'use strict';
const crypto=require('node:crypto');
const path=require('node:path');
const fs=require('node:fs/promises');
const multer=require('multer');
const ExcelJS=require('exceljs');
const {transaction,audit,json}=require('./database');
const A=require('./access');
const V=require('./validation');
const W=require('./workflows');
const storage=path.resolve(__dirname,'../../.local/workspace-uploads');
const extensions=new Set(['.png','.jpg','.jpeg','.webp','.pdf','.txt','.csv','.docx','.xlsx','.pptx','.zip']);

// Serialize authorization changes against writes so revocation cannot race a write
// that evaluated an older permission matrix. Suitable for a single-school workload.
async function mutate(db,req,fn){return transaction(db,async conn=>{
  await conn.query("SELECT value FROM app_metadata WHERE name='authorization_revision' FOR UPDATE");
  const user=await A.identity(conn,req.session.userId);if(!user)V.fail('Your account is no longer active.',401);
  return fn(conn,user);
});}
async function audience(db,user,body){
  const mode=body.audience||'public';
  if(!['public','teams','roles','admin'].includes(mode))V.fail('Choose a valid audience.');
  if(mode==='admin'&&!A.isAdmin(user))V.fail('Only Administrator can classify sensitive records.',403);
  const rules=Array.isArray(body.audience_rules)?body.audience_rules:[];
  if(['teams','roles'].includes(mode)&&(!rules.length||rules.length>100))V.fail('Select at least one audience.');
  const result=[];
  for(const rule of rules){
    if(!['teams','roles'].includes(mode))break;
    const unitId=rule.unit_id==null?null:V.id(rule.unit_id);
    if(unitId){const [[u]]=await db.execute('SELECT id FROM units WHERE id=? AND is_active=1',[unitId]);if(!u)V.fail('Audience team unavailable.');}
    if(mode==='teams'){if(!unitId)V.fail('Select a team.');result.push({unit_id:unitId});}
    else{
      const roleId=V.id(rule.role_id);const [[r]]=await db.execute('SELECT * FROM roles WHERE id=?',[roleId]);
      if(!r||(r.scope==='unit'&&!unitId)||(r.scope==='global'&&unitId))V.fail('Role audience must use the correct global/team scope.');
      result.push({role_id:roleId,unit_id:unitId});
    }
  }
  return {mode,rules:result};
}
module.exports=function routes(app,db){
  app.get('/api/bootstrap',async(req,res)=>{
    const [units]=await db.query('SELECT * FROM units WHERE is_active=1 ORDER BY id');
    const [roles]=await db.query('SELECT id,code,name,scope FROM roles ORDER BY id');
    const [stats]=await db.query(`SELECT r.kind,r.status,COUNT(*) total FROM records r WHERE ${A.readScope(req.user)} GROUP BY r.kind,r.status`);
    res.json({user:req.user,units,roles,stats,isAdmin:A.isAdmin(req.user),canCreate:units.some(u=>A.has(req.user,'record.create',u.id)),canAppoint:units.some(u=>A.has(req.user,'team.appoint',u.id)),recoveryOwner:'van.nguyendinh@hust.edu.vn'});
  });
  app.get('/api/records',async(req,res)=>{
    const page=Math.max(1,Math.min(100000,Number(req.query.page)||1));const limit=24;const where=[A.readScope(req.user)],values=[];
    if(req.query.kind){where.push('r.kind=?');values.push(String(req.query.kind));}
    if(req.query.q){where.push('(r.title LIKE ? OR r.body LIKE ?)');values.push(`%${String(req.query.q).slice(0,100)}%`,`%${String(req.query.q).slice(0,100)}%`);}
    if(req.query.unit_id){where.push('r.owner_unit_id=?');values.push(V.id(req.query.unit_id));}
    if(req.query.status){where.push('r.status=?');values.push(String(req.query.status));}
    const sql=where.join(' AND ');
    const [[count]]=await db.execute(`SELECT COUNT(*) total,COALESCE(SUM(r.kind='activity' AND r.status='published'),0) published_activities FROM records r WHERE ${sql}`,values);
    const [rows]=await db.execute(`SELECT r.*,u.name unit_name,u.color unit_color,a.name author_name FROM records r JOIN units u ON u.id=r.owner_unit_id JOIN users a ON a.id=r.author_id WHERE ${sql} ORDER BY r.updated_at DESC,r.id DESC LIMIT ${limit} OFFSET ${(page-1)*limit}`,values);
    res.json({records:rows.map(r=>({...r,audience_rules:json(r.audience_rules)})),total:count.total,publishedActivities:Number(count.published_activities),page,pages:Math.ceil(count.total/limit)});
  });
  app.post('/api/records',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    const b=req.body,unit=V.id(b.owner_unit_id);
    if(!A.has(user,'record.create',unit))V.fail('You cannot create work for this unit.',403);
    const [[u]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[unit]);if(!u)V.fail('Unit unavailable.');
    if(!['activity','document','request'].includes(b.kind))V.fail('Choose an activity, document or request.');
    const visibility=await audience(conn,user,b);
    const [r]=await conn.execute('INSERT INTO records(kind,title,body,owner_unit_id,author_id,audience,audience_rules,deadline,link_url) VALUES(?,?,?,?,?,?,?,?,?)',[b.kind,V.text(b.title,'Title'),V.text(b.body,'Description',20000),unit,user.id,visibility.mode,JSON.stringify(visibility.rules),V.date(b.deadline),V.url(b.link_url)]);
    await audit(conn,user.id,'record.create',r.insertId,{unit,audience:visibility.mode});return{id:r.insertId};
  })));
  app.get('/api/records/:id',async(req,res)=>{
    const record=await A.visibleRecord(db,req.user,V.id(req.params.id));if(!record)V.fail('Record not found.',404);
    const [tasks]=await db.execute('SELECT t.*,u.name assignee_name FROM tasks t JOIN users u ON u.id=t.assignee_id WHERE t.record_id=? ORDER BY t.deadline,t.id',[record.id]);
    const [comments]=await db.execute('SELECT c.*,u.name author_name FROM comments c JOIN users u ON u.id=c.user_id WHERE c.record_id=? ORDER BY c.id',[record.id]);
    const [attachments]=await db.execute('SELECT id,original_name,size_bytes,created_at FROM attachments WHERE record_id=? ORDER BY id',[record.id]);
    const [requests]=await db.execute('SELECT i.*,w.version workflow_version FROM workflow_instances i JOIN workflow_versions w ON w.id=i.workflow_version_id WHERE record_id=? ORDER BY i.id DESC',[record.id]);
    res.json({record,tasks:tasks.map(t=>({...t,canUpdate:A.has(req.user,'task.manage',record.owner_unit_id)||(t.assignee_id===req.user.id&&A.has(req.user,'task.update.assigned',record.owner_unit_id))})),comments,attachments,requests,capabilities:{edit:A.canEdit(req.user,record),publish:A.canEdit(req.user,record)&&A.has(req.user,'record.publish',record.owner_unit_id),complete:A.canEdit(req.user,record)&&A.has(req.user,'record.complete',record.owner_unit_id),taskManage:A.has(req.user,'task.manage',record.owner_unit_id),comment:A.has(req.user,'comment.create',record.owner_unit_id),upload:A.has(req.user,'attachment.create',record.owner_unit_id)}});
  });
  app.patch('/api/records/:id',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    const record=await A.visibleRecord(conn,user,V.id(req.params.id),true);if(!record)V.fail('Record not found.',404);
    if(!A.canEdit(user,record)||!A.has(user,'record.publish',record.owner_unit_id))V.fail('You cannot edit/publish this record.',403);
    if(record.status==='pending'||record.status==='completed')V.fail('Resolve/cancel the request first; completed records are read-only.',409);
    if(Number(req.body.version)!==record.version)V.fail('This record changed. Reload before editing.',409);
    if(req.body.owner_unit_id&&Number(req.body.owner_unit_id)!==record.owner_unit_id)V.fail('Ownership transfer is not available in this release.');
    if(record.audience==='admin'&&req.body.audience!=='admin')V.fail('Administrator-only classification cannot be downgraded.',403);
    const a=await audience(conn,user,req.body);
    await conn.execute("UPDATE records SET title=?,body=?,audience=?,audience_rules=?,deadline=?,link_url=?,status='draft',version=version+1 WHERE id=?",[V.text(req.body.title,'Title'),V.text(req.body.body,'Description',20000),a.mode,JSON.stringify(a.rules),V.date(req.body.deadline),V.url(req.body.link_url),record.id]);
    await audit(conn,user.id,'record.edit',record.id,{before:{audience:record.audience,status:record.status},after:{audience:a.mode,status:'draft'}});return{ok:true};
  })));
  app.post('/api/records/:id/submit',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    const record=await A.visibleRecord(conn,user,V.id(req.params.id),true);if(!record)V.fail('Record not found.',404);
    if(!A.canEdit(user,record))V.fail('You cannot submit this record.',403);
    if(!['record.publish','record.complete'].includes(req.body.action))V.fail('Unsupported action type.');
    return W.submit(conn,user,record,req.body.action);
  })));
  app.get('/api/tasks',async(req,res)=>{
    const [rows]=await db.execute(`SELECT t.*,r.title record_title,u.name assignee_name FROM tasks t JOIN records r ON r.id=t.record_id JOIN users u ON u.id=t.assignee_id WHERE ${A.readScope(req.user)} AND t.assignee_id=? ORDER BY t.status='done',t.deadline`,[req.user.id]);res.json(rows);
  });
  app.get('/api/records/:id/assignees',async(req,res)=>{
    const r=await A.visibleRecord(db,req.user,V.id(req.params.id));if(!r)V.fail('Record not found.',404);
    if(!A.has(req.user,'task.manage',r.owner_unit_id))V.fail('Assignment permission required.',403);
    const [rows]=await db.execute('SELECT u.id,u.name,u.email FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.unit_id=? AND u.is_active=1',[r.owner_unit_id]);
    const users=[];for(const row of rows){const u=await A.identity(db,row.id);if(u&&A.has(u,'task.update.assigned',r.owner_unit_id)&&await A.visibleRecord(db,u,r.id))users.push(row);}res.json(users);
  });
  app.post('/api/records/:id/tasks',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    const r=await A.visibleRecord(conn,user,V.id(req.params.id),true);if(!r)V.fail('Record not found.',404);
    if(!A.has(user,'task.manage',r.owner_unit_id))V.fail('Assignment permission required.',403);
    if(r.status!=='published')V.fail('Tasks can be assigned to published work.',409);
    const assignee=await A.identity(conn,V.id(req.body.assignee_id));
    if(!assignee||!assignee.memberships.some(m=>m.unit_id===r.owner_unit_id)||!A.has(assignee,'task.update.assigned',r.owner_unit_id)||!await A.visibleRecord(conn,assignee,r.id))V.fail('Assignee must be an eligible team member who can view this record.');
    const [result]=await conn.execute('INSERT INTO tasks(record_id,title,assignee_id,created_by,deadline) VALUES(?,?,?,?,?)',[r.id,V.text(req.body.title,'Task title'),assignee.id,user.id,V.date(req.body.deadline,true)]);
    await audit(conn,user.id,'task.create',result.insertId,{record_id:r.id,assignee_id:assignee.id});return{id:result.insertId};
  })));
  app.patch('/api/tasks/:id',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    const [[t]]=await conn.execute('SELECT * FROM tasks WHERE id=?',[V.id(req.params.id)]);if(!t)V.fail('Task not found.',404);
    const r=await A.visibleRecord(conn,user,t.record_id,true);if(!r)V.fail('Task not found.',404);
    if(r.status!=='published')V.fail('Task updates require published active work.',409);
    if(!A.has(user,'task.manage',r.owner_unit_id)&&!(t.assignee_id===user.id&&A.has(user,'task.update.assigned',r.owner_unit_id)))V.fail('You cannot update this task.',403);
    if(!['open','in_progress','done'].includes(req.body.status))V.fail('Invalid status.');
    await conn.execute("UPDATE tasks SET status=?,completed_at=IF(?='done',NOW(),NULL) WHERE id=?",[req.body.status,req.body.status,t.id]);await audit(conn,user.id,'task.status',t.id,{status:req.body.status});return{ok:true};
  })));
  app.post('/api/records/:id/comments',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    const r=await A.visibleRecord(conn,user,V.id(req.params.id),true);if(!r)V.fail('Record not found.',404);
    if(!A.has(user,'comment.create',r.owner_unit_id))V.fail('Comment permission required.',403);
    const [result]=await conn.execute('INSERT INTO comments(record_id,user_id,body) VALUES(?,?,?)',[r.id,user.id,V.text(req.body.body,'Comment',5000)]);return{id:result.insertId};
  })));
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
  app.post('/api/records/:id/attachments',upload.single('file'),async(req,res)=>{
    if(!req.file)V.fail('Choose a file.');const ext=path.extname(req.file.originalname).toLowerCase();if(!extensions.has(ext))V.fail('Unsupported file extension.',415);
    const stored=crypto.randomUUID()+ext;let written=false;
    try{const result=await mutate(db,req,async(conn,user)=>{
      const r=await A.visibleRecord(conn,user,V.id(req.params.id),true);if(!r)V.fail('Record not found.',404);
      if(!A.has(user,'attachment.create',r.owner_unit_id))V.fail('Upload permission required.',403);
      const [[usage]]=await conn.execute('SELECT COALESCE(SUM(size_bytes),0) bytes FROM attachments WHERE record_id=?',[r.id]);
      if(Number(usage.bytes)+req.file.size>50*1024*1024)V.fail('Record materials exceed the shared 50 MiB quota.',413);
      await fs.mkdir(storage,{recursive:true});await fs.writeFile(path.join(storage,stored),req.file.buffer,{flag:'wx'});written=true;
      const [result]=await conn.execute('INSERT INTO attachments(record_id,user_id,original_name,stored_name,size_bytes) VALUES(?,?,?,?,?)',[r.id,user.id,path.basename(req.file.originalname).slice(0,255),stored,req.file.size]);await audit(conn,user.id,'attachment.create',result.insertId,{record_id:r.id});return{id:result.insertId};
    });res.status(201).json(result);}catch(e){if(written)await fs.unlink(path.join(storage,stored)).catch(()=>{});throw e;}
  });
  app.get('/api/attachments/:id',async(req,res)=>{
    const [[file]]=await db.execute(`SELECT f.* FROM attachments f JOIN records r ON r.id=f.record_id WHERE f.id=? AND ${A.readScope(req.user)}`,[V.id(req.params.id)]);
    if(!file)V.fail('Attachment not found.',404);res.set('Cache-Control','no-store');res.download(path.join(storage,path.basename(file.stored_name)),file.original_name,{dotfiles:'allow'});
  });
  app.get('/api/approvals',async(req,res)=>{
    const [rows]=await db.execute(`SELECT i.*,r.title,r.owner_unit_id,u.name submitter_name FROM workflow_instances i JOIN records r ON r.id=i.record_id JOIN users u ON u.id=i.submitter_id WHERE ${A.isAdmin(req.user)?'1=1':"(i.submitter_id=? OR (i.state IN ('pending','blocked') AND JSON_CONTAINS(i.required_users,CAST(? AS JSON))))"} ORDER BY i.id DESC`,A.isAdmin(req.user)?[]:[req.user.id,String(req.user.id)]);
    const results=[];for(const i of rows){const canDecide=await W.canDecide(db,req.user,i);if(A.isAdmin(req.user)||i.submitter_id===req.user.id||canDecide){const {record,workflow}=await W.requestContext(db,i);if(record.audience==='admin'&&!A.isAdmin(req.user))continue;results.push({...i,record,workflow,canDecide});}}res.json(results);
  });
  app.post('/api/approvals/:id/decision',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    if(!['approve','reject'].includes(req.body.decision))V.fail('Choose approve or reject.');
    await W.decide(conn,user,V.id(req.params.id),req.body.decision,String(req.body.note||'').slice(0,1000));return{ok:true};
  })));
  app.post('/api/approvals/:id/cancel',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    const [[i]]=await conn.execute('SELECT * FROM workflow_instances WHERE id=?',[V.id(req.params.id)]);if(!i)V.fail('Request not found.',404);
    if(!A.isAdmin(user)&&i.submitter_id!==user.id)V.fail('You cannot cancel this request.',403);
    if(!['pending','blocked'].includes(i.state))V.fail('Request already resolved.',409);
    await conn.execute('SELECT id FROM records WHERE id=? FOR UPDATE',[i.record_id]);
    await conn.execute("UPDATE workflow_instances SET state='cancelled' WHERE id=?",[i.id]);await conn.execute('UPDATE records SET status=?,version=version+1 WHERE id=?',[i.previous_status,i.record_id]);await audit(conn,user.id,'workflow.cancel',i.id);return{ok:true};
  })));
  app.get('/api/notifications',async(req,res)=>{
    const [rows]=await db.execute(`SELECT n.* FROM notifications n JOIN records r ON r.id=n.record_id WHERE n.user_id=? AND ${A.readScope(req.user)} ORDER BY n.id DESC LIMIT 30`,[req.user.id]);res.json(rows);
  });
  app.get('/api/admin/export',async(req,res)=>{
    if(!A.isAdmin(req.user))V.fail('Historical exports are Administrator-only.',403);
    const [rows]=await db.query('SELECT r.id,r.kind,r.title,u.name owning_unit,r.status,r.audience,r.deadline,r.created_at FROM records r JOIN units u ON u.id=r.owner_unit_id ORDER BY r.id');
    const workbook=new ExcelJS.Workbook();const sheet=workbook.addWorksheet('Records');sheet.columns=Object.keys(rows[0]||{id:0}).map(k=>({header:k,key:k,width:k==='title'?45:22}));rows.forEach(r=>sheet.addRow(r));sheet.views=[{state:'frozen',ySplit:1}];sheet.getRow(1).font={bold:true};
    await audit(db,req.user.id,'history.export','records',{count:rows.length});res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('seee-workspace-records.xlsx').send(Buffer.from(await workbook.xlsx.writeBuffer()));
  });
  require('./admin')(app,db,mutate);
};
