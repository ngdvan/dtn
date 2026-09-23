'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const mysql=require('mysql2/promise');
const {start,data,local}=require('./database');
const {seed}=require('./seed');
async function setup(){
  await start();
  const credentials=path.join(local,'mysql-admin.json');
  const saved=fs.existsSync(credentials)?JSON.parse(fs.readFileSync(credentials,'utf8')):null;
  const root=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root',password:saved?.password||'',multipleStatements:true});
  try{
    const [[row]]=await root.query('SELECT @@datadir directory');
    const normalize=p=>path.resolve(p).replace(/\\/g,'/').replace(/\/$/,'').toLowerCase();
    if(normalize(row.directory)!==normalize(data))throw new Error('Port 3307 belongs to another database. Refusing to modify it.');
    if(!saved){const password=crypto.randomBytes(32).toString('hex');await root.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[password]);fs.writeFileSync(credentials,JSON.stringify({password}),{mode:0o600});}
    const envPath=path.resolve(__dirname,'../../.env.local');
    const existing=fs.existsSync(envPath)?require('dotenv').parse(fs.readFileSync(envPath)):{};
    const appPassword=existing.WORKSPACE_DB_PASSWORD||crypto.randomBytes(24).toString('hex');
    if(existing.WORKSPACE_DB_NAME&&existing.WORKSPACE_DB_NAME!=='seee_workspace_local')throw new Error('Existing .env.local targets another database; refusing to overwrite configuration.');
    await root.query('CREATE DATABASE IF NOT EXISTS seee_workspace_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await root.query("CREATE USER IF NOT EXISTS 'seee_local'@'localhost' IDENTIFIED BY ?",[appPassword]);
    await root.query("ALTER USER 'seee_local'@'localhost' IDENTIFIED BY ?",[appPassword]);
    await root.query("GRANT ALL ON seee_workspace_local.* TO 'seee_local'@'localhost'");
    const lines={...existing,WORKSPACE_DB_HOST:'127.0.0.1',WORKSPACE_DB_PORT:'3307',WORKSPACE_DB_USER:'seee_local',WORKSPACE_DB_PASSWORD:appPassword,WORKSPACE_DB_NAME:'seee_workspace_local',WORKSPACE_SESSION_SECRET:existing.WORKSPACE_SESSION_SECRET||crypto.randomBytes(32).toString('hex'),LOCAL_DEMO_AUTH:'true',WORKSPACE_PORT:existing.WORKSPACE_PORT||'3000'};
    fs.writeFileSync(envPath,Object.entries(lines).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
    await root.query('USE seee_workspace_local');await seed(root);
    console.log('Ready. Run npm start, then open http://localhost:3000.');
    console.log('Local demo password: SeeeDemo!2026 (synthetic accounts only).');
  }finally{await root.end();}
}
setup().catch(e=>{console.error(e.message);process.exitCode=1;});
