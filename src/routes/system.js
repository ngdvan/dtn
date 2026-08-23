const express = require('express');

function createSystemRoutes(context) {
  const { db, auth, admin, manager, isLeadership, asyncRoute, validHttpUrl, one, ids, activityScope, leadsTeam, belongsToTeam, canManageTeam, managedTeamIds, canManageUser, canManageActivity, visibleActivity, bcrypt, ExcelJS, packageInfo, logger, mailer, push, taskUpload, attachmentKinds, allowedExtensions, attachmentRoot, path, fs, crypto } = context;
  const router = express.Router();

router.get('/api/session',(req,res)=>res.json({user:req.session.user||null}));
router.get('/api/push/config',auth,(_req,res)=>{res.set('Cache-Control','no-store');res.json({enabled:push.enabled,appId:push.enabled?push.appId:null})});
router.get('/api/version',(_req,res)=>{res.set('Cache-Control','no-store');res.json({version:packageInfo.version,build:'2026-08-23.3'})});
router.get('/api/health',asyncRoute(async(_req,res)=>{try{await db.query('SELECT 1');res.json({status:'ok'})}catch(error){logger.error('Database health check failed.',error);throw error}}));
router.post('/api/email/test',auth,admin,asyncRoute(async(req,res)=>{const to=String(req.body.to||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||to.length>254)return res.status(400).json({error:'Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰ email há»£p lá»‡.'});try{const result=await mailer.sendTestEmail(to,req.session.user.name);res.json({ok:true,to,message_id:result.messageId})}catch(error){res.status(502).json({error:`KhÃ´ng thá»ƒ gá»­i email kiá»ƒm tra: ${error.response||error.message||'Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh'}`})}}));
router.post('/api/login',asyncRoute(async(req,res)=>{const email=String(req.body.email||'').trim().toLowerCase();const [rows]=await db.execute('SELECT id,name,email,password_hash,role,phone,avatar_color FROM users WHERE email=? AND is_active=1',[email]);const user=one(rows);if(!user||!(await bcrypt.compare(String(req.body.password||''),user.password_hash)))return res.status(401).json({error:'Email or password is incorrect.'});delete user.password_hash;req.session.user=user;res.json({user})}));
router.post('/api/logout',(req,res,next)=>req.session.destroy(err=>err?next(err):res.json({ok:true})));
router.patch('/api/account',auth,asyncRoute(async(req,res)=>{const email=String(req.body.email||'').trim().toLowerCase(),phone=String(req.body.phone||'').trim(),avatarColor=String(req.body.avatar_color||'');if(!email||!/^#[0-9a-f]{6}$/i.test(avatarColor))return res.status(400).json({error:'A valid email and avatar color are required.'});const values=[email,phone||null,avatarColor],sets=['email=?','phone=?','avatar_color=?'];if(req.body.password){if(String(req.body.password).length<8)return res.status(400).json({error:'Password must contain at least 8 characters.'});sets.push('password_hash=?');values.push(await bcrypt.hash(String(req.body.password),10))}values.push(req.session.user.id);await db.execute(`UPDATE users SET ${sets.join(',')} WHERE id=?`,values);Object.assign(req.session.user,{email,phone:phone||null,avatar_color:avatarColor});res.json({user:req.session.user})}));

router.get('/api/bootstrap',auth,asyncRoute(async(req,res)=>{
  const user=req.session.user,s=activityScope(user);
  const taskScope=user.role==='admin'?'1=1':isLeadership(user)?`(EXISTS(SELECT 1 FROM user_teams x WHERE x.user_id=? AND x.team_id=t.team_id AND (x.is_lead=1 OR x.is_vice_lead=1)) OR EXISTS(SELECT 1 FROM task_assignees x WHERE x.task_id=t.id AND x.user_id=?))`:`EXISTS(SELECT 1 FROM task_assignees x WHERE x.task_id=t.id AND x.user_id=?)`;
  const taskParams=user.role==='admin'?[]:isLeadership(user)?[user.id,user.id]:[user.id];
  const [[statRows],[upcoming],[tasks],[activity],[teams]]=await Promise.all([
    db.execute(`SELECT COUNT(DISTINCT CASE WHEN a.status IN ('approved','active') THEN a.id END) activeActivities,COUNT(DISTINCT CASE WHEN t.status!='done' THEN t.id END) openTasks,COUNT(DISTINCT CASE WHEN t.status!='done' AND t.deadline<CURDATE() THEN t.id END) overdueTasks,COUNT(DISTINCT CASE WHEN t.status='done' AND MONTH(t.completed_at)=MONTH(CURDATE()) AND YEAR(t.completed_at)=YEAR(CURDATE()) THEN t.id END) completedMonth FROM activities a LEFT JOIN tasks t ON t.activity_id=a.id WHERE ${s.sql}`,s.params),
    db.execute(`SELECT a.*,te.name team_name,te.color team_color,GROUP_CONCAT(DISTINCT involved.name ORDER BY involved.name SEPARATOR ', ') team_names,COUNT(DISTINCT t.id) task_count,COUNT(DISTINCT CASE WHEN t.status='done' THEN t.id END) done_count,COUNT(DISTINCT p.user_id) participant_count FROM activities a JOIN teams te ON te.id=a.team_id JOIN activity_teams ats ON ats.activity_id=a.id JOIN teams involved ON involved.id=ats.team_id LEFT JOIN tasks t ON t.activity_id=a.id LEFT JOIN participants p ON p.activity_id=a.id AND p.state='confirmed' WHERE a.status IN ('proposed','approved','active') AND ${s.sql} GROUP BY a.id ORDER BY a.deadline LIMIT 5`,s.params),
    db.execute(`SELECT t.*,a.title activity_title,te.name team_name,GROUP_CONCAT(DISTINCT u.name ORDER BY u.name SEPARATOR ', ') assignee_name,GROUP_CONCAT(DISTINCT u.id ORDER BY u.id) assignee_ids FROM tasks t JOIN activities a ON a.id=t.activity_id JOIN teams te ON te.id=t.team_id LEFT JOIN task_assignees ta ON ta.task_id=t.id LEFT JOIN users u ON u.id=ta.user_id WHERE ${taskScope} AND t.status!='done' GROUP BY t.id ORDER BY t.deadline LIMIT 8`,taskParams),
    db.execute(`SELECT n.body,n.kind,n.created_at,usr.name user_name,usr.avatar_color,a.title activity_title,a.id activity_id FROM updates n JOIN users usr ON usr.id=n.user_id JOIN activities a ON a.id=n.activity_id WHERE ${s.sql} ORDER BY n.created_at DESC LIMIT 7`,s.params),
    db.execute(`SELECT t.*,EXISTS(SELECT 1 FROM user_teams ux WHERE ux.team_id=t.id AND ux.user_id=? AND (ux.is_lead=1 OR ux.is_vice_lead=1)) can_manage FROM teams t WHERE t.is_active=1 ORDER BY t.sort_order,t.name`,[user.id])
  ]);
  res.json({stats:one(statRows),upcoming,tasks,activity,teams,capabilities:{canCreateActivity:user.role==='admin'||isLeadership(user),canCreateAccount:user.role==='admin'}})
}));

  return router;
}

module.exports = { createSystemRoutes };
