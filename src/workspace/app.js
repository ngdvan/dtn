'use strict';
const express=require('express');
const session=require('express-session');
const SessionStore=require('./session-store');
const helmet=require('helmet');
const crypto=require('node:crypto');
const path=require('node:path');
const bcrypt=require('bcryptjs');
const {dbConfig,createPool,audit}=require('./database');
const {hustEmail}=require('./catalog');
const access=require('./access');
const {fail}=require('./validation');

function createApplication(options={}) {
  const db=options.db||createPool(); const app=express();
  const demo=process.env.LOCAL_DEMO_AUTH==='true';
  if(process.env.NODE_ENV==='production'&&demo) throw new Error('Demo authentication cannot run in production.');
  if(!process.env.WORKSPACE_SESSION_SECRET) throw new Error('Run npm run setup:local first or configure WORKSPACE_SESSION_SECRET.');
  const store=new SessionStore(db);
  app.disable('x-powered-by');
  app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'",'data:'],connectSrc:["'self'"],frameAncestors:["'none'"]}}}));
  app.use(express.json({limit:'1mb'}));
  app.use(session({name:'seee.workspace.sid',secret:process.env.WORKSPACE_SESSION_SECRET,store,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:12*3600000}}));
  app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));
  const save=req=>new Promise((resolve,reject)=>req.session.save(e=>e?reject(e):resolve()));
  const login=async(req,user)=>{await regenerate(req);req.session.userId=user.id;req.session.csrf=crypto.randomBytes(24).toString('hex');await save(req);};
  app.get('/api/session',async(req,res)=>{
    req.session.csrf ||= crypto.randomBytes(24).toString('hex');
    let user=req.session.userId?await access.identity(db,req.session.userId):null;
    if(user?.identity_source==='demo'&&!demo)user=null;
    res.json({user,csrf:req.session.csrf,demo,ssoEnabled:!!process.env.AZURE_CLIENT_ID,version:'3.0.0',recoveryOwner:'van.nguyendinh@hust.edu.vn'});
  });
  app.get('/api/health',async(_req,res)=>{await db.query('SELECT 1');res.json({status:'ok',application:'SEEE Workspace',database:dbConfig.database});});
  app.use('/api',(req,_res,next)=>{
    if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
    const expected=req.session.csrf,actual=req.get('X-CSRF-Token');
    if(!expected||!actual||actual!==expected) fail('Refresh the page before making changes.',403);
    const origin=req.get('origin');
    if(origin&&origin!==`${req.protocol}://${req.get('host')}`) fail('Cross-origin changes are not allowed.',403);
    next();
  });
  const attempts=new Map();
  app.post('/api/login',async(req,res)=>{
    if(!demo) fail('Use your verified Microsoft HUST identity.',403);
    const key=req.ip;const now=Date.now();let count=attempts.get(key);
    if(!count||now-count.start>60000){count={start:now,n:0};attempts.set(key,count);}
    if(++count.n>20) fail('Too many attempts. Try again in a minute.',429);
    if(attempts.size>2000) for(const [k,v]of attempts)if(now-v.start>60000)attempts.delete(k);
    const email=hustEmail(req.body.email);
    const [[row]]=await db.execute("SELECT * FROM users WHERE email=? AND is_active=1 AND identity_source='demo'",[email||'']);
    if(!row||!await bcrypt.compare(String(req.body.password||''),row.password_hash))fail('Email or password is incorrect.',401);
    await login(req,row);await audit(db,row.id,'session.demo_login',row.id);
    res.json({user:await access.identity(db,row.id),csrf:req.session.csrf});
  });
  app.get('/auth/microsoft',async(req,res)=>{
    if(!process.env.AZURE_CLIENT_ID||!process.env.AZURE_CLIENT_SECRET||!process.env.AZURE_REDIRECT_URI)fail('Microsoft HUST SSO is not configured. Local demo login is available only in development.',503);
    req.session.ssoState=crypto.randomBytes(32).toString('hex');await save(req);
    const redirect=process.env.AZURE_REDIRECT_URI;
    const q=new URLSearchParams({client_id:process.env.AZURE_CLIENT_ID,response_type:'code',redirect_uri:redirect,scope:'openid profile email',state:req.session.ssoState,prompt:'select_account'});
    res.redirect(`https://login.microsoftonline.com/${encodeURIComponent(process.env.AZURE_TENANT||'hust.edu.vn')}/oauth2/v2.0/authorize?${q}`);
  });
  app.get('/auth/microsoft/callback',async(req,res)=>{
    if(!req.query.state||req.query.state!==req.session.ssoState)fail('Invalid sign-in state.',400);
    delete req.session.ssoState;await save(req);
    if(!req.query.code)fail('Microsoft sign-in did not complete.',401);
    const response=await fetch(`https://login.microsoftonline.com/${encodeURIComponent(process.env.AZURE_TENANT||'hust.edu.vn')}/oauth2/v2.0/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.AZURE_CLIENT_ID,client_secret:process.env.AZURE_CLIENT_SECRET,redirect_uri:process.env.AZURE_REDIRECT_URI,grant_type:'authorization_code',code:String(req.query.code)}),signal:AbortSignal.timeout(15000)});
    const token=await response.json();if(!response.ok||!token.access_token)fail('Microsoft sign-in failed.',401);
    const profileResponse=await fetch('https://graph.microsoft.com/oidc/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`},signal:AbortSignal.timeout(15000)});
    const profile=await profileResponse.json();const email=hustEmail(profile.email||profile.preferred_username);
    if(!profileResponse.ok||!email||!profile.sub)fail('Only verified HUST accounts are supported.',403);
    const subject=`${process.env.AZURE_TENANT||'hust.edu.vn'}:${profile.sub}`;
    let [[user]]=await db.execute('SELECT * FROM users WHERE provider_subject=?',[subject]);
    if(!user){
      const [[existing]]=await db.execute('SELECT id FROM users WHERE email=?',[email]);
      if(existing)fail('An existing account requires administrator identity reconciliation; SSO cannot claim demo privileges.',409);
      try{const [r]=await db.execute("INSERT INTO users(name,email,identity_source,provider_subject) VALUES(?,?,'microsoft',?)",[String(profile.name||email).slice(0,120),email,subject]);user={id:r.insertId,is_active:1};}
      catch(e){if(e.code!=='ER_DUP_ENTRY')throw e;[[user]]=await db.execute('SELECT * FROM users WHERE provider_subject=?',[subject]);}
    }
    if(!user?.is_active)fail('Account unavailable.',403);
    await login(req,user);res.redirect('/');
  });
  app.use('/api',async(req,_res,next)=>{
    req.user=req.session.userId?await access.identity(db,req.session.userId):null;
    if(req.user?.identity_source==='demo'&&!demo)req.user=null;
    if(!req.user)fail('Please sign in with an active HUST account.',401);next();
  });
  app.post('/api/logout',(req,res,next)=>req.session.destroy(e=>e?next(e):res.json({ok:true})));
  require('./routes')(app,db);
  app.use('/api',(_req,res)=>res.status(404).json({error:'Endpoint not found.'}));
  app.use(express.static(path.resolve(__dirname,'../../public/workspace')));
  app.get('/',(_req,res)=>res.sendFile(path.resolve(__dirname,'../../public/workspace/index.html')));
  app.use((err,_req,res,_next)=>{
    const status=err.status|| (err.code==='ER_DUP_ENTRY'?409:err.code==='LIMIT_FILE_SIZE'?413:500);
    if(status===500)console.error(err);
    if(!res.headersSent)res.status(status).json({error:status===500?'An unexpected error occurred. Check the server log.':err.code==='ER_DUP_ENTRY'?'That item already exists.':err.code==='LIMIT_FILE_SIZE'?'One file cannot exceed 10 MiB.':err.message});
  });
  return {app,db,close:async()=>{await store.close();if(!options.db)await db.end();}};
}
module.exports={createApplication};
