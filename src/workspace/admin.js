'use strict';
const A=require('./access');
const V=require('./validation');
const {json,audit}=require('./database');
const {permissions}=require('./catalog');
function requireAdmin(user){if(!A.isAdmin(user))V.fail('Administrator access is required.',403);}
async function bump(db){await db.query("UPDATE app_metadata SET value=CAST(value AS UNSIGNED)+1 WHERE name='authorization_revision'");}
function rolePermissions(list,scope,code){
  if(!Array.isArray(list)||list.some(p=>!Object.hasOwn(permissions,p)))V.fail('Choose supported permission keys.');
  if(code!=='administrator'&&list.some(p=>p.startsWith('admin.')))V.fail('Administrative and sensitive controls are reserved for Administrator.');
  if(scope==='unit'&&list.includes('school.read'))V.fail('School-wide visibility requires a global role.');
  return [...new Set(list)];
}
module.exports=(app,db,mutate)=>{
  app.get('/api/people',async(req,res)=>{
    if(!A.isAdmin(req.user)&&!req.user.roles.some(r=>r.code==='leader'&&A.has(req.user,'team.appoint',r.unit_id)))V.fail('Roster appointment access required.',403);
    const [rows]=await db.query('SELECT id,name,email,is_active FROM users WHERE is_active=1 ORDER BY name');res.json(rows);
  });
  app.get('/api/units/:id/members',async(req,res)=>{
    const unit=V.id(req.params.id);
    if(!A.isAdmin(req.user)&&!req.user.memberships.some(m=>m.unit_id===unit))V.fail('Team membership required.',403);
    const [rows]=await db.execute("SELECT u.id,u.name,GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', ') roles FROM memberships m JOIN users u ON u.id=m.user_id LEFT JOIN unit_roles a ON a.user_id=m.user_id AND a.unit_id=m.unit_id LEFT JOIN roles r ON r.id=a.role_id WHERE m.unit_id=? AND u.is_active=1 GROUP BY u.id ORDER BY u.name",[unit]);res.json(rows);
  });
  app.post('/api/units/:id/appointments',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    const unit=V.id(req.params.id);const target=V.id(req.body.user_id);
    if(!A.isAdmin(user)&&!(A.isLeader(user,unit)&&A.has(user,'team.appoint',unit)))V.fail('Only this team’s Leader or Administrator can appoint members.',403);
    if(!['member','leader'].includes(req.body.role))V.fail('Team appointments support Member or Leader only.',403);
    const [[u]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[unit]);if(!u)V.fail('Unit unavailable.');
    if(!await A.identity(conn,target))V.fail('Choose an active HUST account.');
    const [roles]=await conn.execute("SELECT id,code FROM roles WHERE code IN ('member','leader') AND scope='unit'");
    await conn.execute('INSERT IGNORE INTO memberships(user_id,unit_id) VALUES(?,?)',[target,unit]);
    for(const r of roles)if(r.code==='member'||r.code===req.body.role)await conn.execute('INSERT IGNORE INTO unit_roles(user_id,unit_id,role_id) VALUES(?,?,?)',[target,unit,r.id]);
    await audit(conn,user.id,'team.appoint',`${unit}:${target}`,{role:req.body.role});await bump(conn);return{ok:true};
  })));
  app.get('/api/admin',async(req,res)=>{
    requireAdmin(req.user);
    const [units]=await db.query('SELECT * FROM units ORDER BY id');
    const [roles]=await db.query('SELECT * FROM roles ORDER BY id');
    const [users]=await db.query('SELECT id,name,email,identity_source,is_active FROM users ORDER BY name');
    const [assignments]=await db.query('SELECT user_id,role_id,NULL unit_id FROM global_roles UNION ALL SELECT user_id,role_id,unit_id FROM unit_roles');
    const [workflows]=await db.query('SELECT * FROM workflow_versions ORDER BY id DESC');
    const [events]=await db.query('SELECT e.*,u.name actor_name FROM audit_events e LEFT JOIN users u ON u.id=e.actor_id ORDER BY e.id DESC LIMIT 100');
    res.json({units,roles:roles.map(r=>({...r,permissions:json(r.permissions)})),users,assignments,permissions,workflows:workflows.map(w=>({...w,steps:json(w.steps)})),events:events.map(e=>({...e,details:json(e.details)}))});
  });
  app.post('/api/admin/units',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const b=req.body;const code=V.text(b.code,'Code',60);
    if(!/^[a-z0-9-]+$/.test(code))V.fail('Code uses lowercase letters, numbers and hyphens.');
    const parent=b.parent_id?V.id(b.parent_id):null;
    if(parent){const [[p]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[parent]);if(!p)V.fail('Parent unavailable.');}
    const color=String(b.color||'#245747');if(!/^#[\da-f]{6}$/i.test(color))V.fail('Choose a valid color.');
    const [r]=await conn.execute('INSERT INTO units(code,name,name_vi,type,parent_id,color) VALUES(?,?,?,?,?,?)',[code,V.text(b.name,'Name',160),V.text(b.name_vi||b.name,'Vietnamese name',160),V.text(b.type,'Type',40),parent,color]);await audit(conn,user.id,'unit.create',r.insertId);return{id:r.insertId};
  })));
  app.patch('/api/admin/units/:id',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const unit=V.id(req.params.id);const [[old]]=await conn.execute('SELECT * FROM units WHERE id=?',[unit]);if(!old)V.fail('Unit not found.',404);
    const parent=req.body.parent_id?V.id(req.body.parent_id):null;let current=parent;const visited=new Set([unit]);
    while(current){if(visited.has(current))V.fail('Unit hierarchy cannot contain cycles.');visited.add(current);const [[p]]=await conn.execute('SELECT parent_id,is_active FROM units WHERE id=?',[current]);if(!p||!p.is_active)V.fail('Parent unavailable.');current=p.parent_id;}
    if(req.body.is_active===false){const [[child]]=await conn.execute('SELECT COUNT(*) n FROM units WHERE parent_id=? AND is_active=1',[unit]);if(child.n)V.fail('Deactivate or reparent active child units first.',409);}
    await conn.execute('UPDATE units SET name=?,name_vi=?,parent_id=?,is_active=? WHERE id=?',[V.text(req.body.name||old.name,'Name',160),V.text(req.body.name_vi||old.name_vi,'Vietnamese name',160),parent,req.body.is_active===false?0:1,unit]);await bump(conn);await audit(conn,user.id,'unit.update',unit,{before:old,after:req.body});return{ok:true};
  })));
  app.post('/api/admin/roles',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const b=req.body;if(!['unit','global'].includes(b.scope))V.fail('Choose unit/global scope.');
    const code=V.text(b.code,'Code',60);if(!/^[a-z][a-z0-9_-]+$/.test(code))V.fail('Use a simple lowercase role code.');
    const perms=rolePermissions(b.permissions,b.scope,code);
    const [r]=await conn.execute('INSERT INTO roles(code,name,scope,permissions) VALUES(?,?,?,?)',[code,V.text(b.name,'Name',120),b.scope,JSON.stringify(perms)]);await bump(conn);await audit(conn,user.id,'role.create',r.insertId,{code,permissions:perms});return{id:r.insertId};
  })));
  app.patch('/api/admin/roles/:id',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const [[role]]=await conn.execute('SELECT * FROM roles WHERE id=?',[V.id(req.params.id)]);if(!role)V.fail('Role not found.',404);
    if(role.code==='administrator')V.fail('Administrator is a protected system role.');
    if(Number(req.body.revision)!==role.revision)V.fail('Role changed; reload the matrix.',409);
    const perms=rolePermissions(req.body.permissions,role.scope,role.code);
    if(role.code==='dean'&&perms.some(p=>p!=='school.read'))V.fail('Dean is a read-only operational role; assign a separate role for other authority.');
    await conn.execute('UPDATE roles SET permissions=?,revision=revision+1 WHERE id=?',[JSON.stringify(perms),role.id]);await bump(conn);await audit(conn,user.id,'role.update',role.id,{before:json(role.permissions),after:perms});return{ok:true};
  })));
  app.post('/api/admin/assignments',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const target=V.id(req.body.user_id);if(!await A.identity(conn,target))V.fail('Active HUST user required.');
    const [[role]]=await conn.execute('SELECT * FROM roles WHERE id=?',[V.id(req.body.role_id)]);if(!role)V.fail('Role not found.');
    const unit=req.body.unit_id?V.id(req.body.unit_id):null;const revoke=req.body.revoke===true;
    if(role.scope==='global'){
      if(unit)V.fail('Global role cannot have a team scope.');
      if(revoke&&role.code==='administrator'){
        const [[count]]=await conn.execute('SELECT COUNT(*) n FROM global_roles g JOIN users u ON u.id=g.user_id WHERE g.role_id=? AND u.is_active=1 AND g.user_id!=?',[role.id,target]);if(!count.n)V.fail('Cannot remove the last active Administrator.',409);
      }
      await conn.execute(revoke?'DELETE FROM global_roles WHERE user_id=? AND role_id=?':'INSERT IGNORE INTO global_roles(user_id,role_id) VALUES(?,?)',[target,role.id]);
    }else{
      if(!unit)V.fail('Unit role needs a team.');
      const [[u]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[unit]);if(!u)V.fail('Unit unavailable.');
      if(revoke&&role.code==='member'){
        await conn.execute('DELETE FROM memberships WHERE user_id=? AND unit_id=?',[target,unit]);
      }else if(revoke){await conn.execute('DELETE FROM unit_roles WHERE user_id=? AND unit_id=? AND role_id=?',[target,unit,role.id]);}
      else{
        await conn.execute('INSERT IGNORE INTO memberships(user_id,unit_id) VALUES(?,?)',[target,unit]);
        await conn.execute("INSERT IGNORE INTO unit_roles(user_id,unit_id,role_id) SELECT ?,?,id FROM roles WHERE code='member'",[target,unit]);
        await conn.execute('INSERT IGNORE INTO unit_roles(user_id,unit_id,role_id) VALUES(?,?,?)',[target,unit,role.id]);
      }
    }
    await bump(conn);await audit(conn,user.id,revoke?'assignment.revoke':'assignment.grant',target,{role_id:role.id,unit_id:unit});return{ok:true};
  })));
  app.patch('/api/admin/users/:id',async(req,res)=>res.json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const target=V.id(req.params.id);const [[u]]=await conn.execute('SELECT id,is_active FROM users WHERE id=?',[target]);if(!u)V.fail('User not found.',404);
    if(typeof req.body.is_active!=='boolean')V.fail('An active state is required.');
    if(!req.body.is_active){const [[role]]=await conn.execute("SELECT r.id FROM global_roles g JOIN roles r ON r.id=g.role_id WHERE g.user_id=? AND r.code='administrator'",[target]);
      if(role){const [[count]]=await conn.execute('SELECT COUNT(*) n FROM global_roles g JOIN users u ON u.id=g.user_id WHERE g.role_id=? AND u.is_active=1 AND u.id!=?',[role.id,target]);if(!count.n)V.fail('Cannot deactivate the last active Administrator.',409);}}
    await conn.execute('UPDATE users SET is_active=? WHERE id=?',[req.body.is_active,target]);await bump(conn);await audit(conn,user.id,'account.active',target,req.body);return{ok:true};
  })));
  app.post('/api/admin/workflows',async(req,res)=>res.status(201).json(await mutate(db,req,async(conn,user)=>{
    requireAdmin(user);const b=req.body;if(!['record.publish','record.complete'].includes(b.action_type))V.fail('Unsupported action type.');
    const unit=b.unit_id?V.id(b.unit_id):null;
    if(unit){const [[u]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[unit]);if(!u)V.fail('Unit unavailable.');}
    if(!Array.isArray(b.steps)||!b.steps.length||b.steps.length>8)V.fail('Configure one to eight approval steps.');
    const steps=[];
    for(const input of b.steps){
      const [[r]]=await conn.execute('SELECT * FROM roles WHERE id=?',[V.id(input.role_id)]);
      if(!r||!json(r.permissions).includes('workflow.approve'))V.fail('Each approving role needs workflow.approve permission.');
      if(!['global','owner','unit'].includes(input.scope)||!['any','all'].includes(input.mode))V.fail('Choose valid scope and quorum.');
      if((r.scope==='global')!==(input.scope==='global'))V.fail('Approver role/scope mismatch.');
      const explicit=input.scope==='unit'?V.id(input.unit_id):null;
      if(explicit){const [[u]]=await conn.execute('SELECT id FROM units WHERE id=? AND is_active=1',[explicit]);if(!u)V.fail('Approver unit unavailable.');}
      steps.push({role_id:r.id,scope:input.scope,unit_id:explicit,mode:input.mode});
    }
    const [[last]]=await conn.execute('SELECT COALESCE(MAX(version),0) n FROM workflow_versions WHERE action_type=? AND unit_id <=> ?',[b.action_type,unit]);
    const [r]=await conn.execute('INSERT INTO workflow_versions(action_type,unit_id,version,steps,allow_self,created_by) VALUES(?,?,?,?,?,?)',[b.action_type,unit,last.n+1,JSON.stringify(steps),b.allow_self===true,user.id]);await audit(conn,user.id,'workflow.publish_version',r.insertId,{action:b.action_type,unit,steps});return{id:r.insertId,version:last.n+1};
  })));
};
