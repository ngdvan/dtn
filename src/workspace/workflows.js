'use strict';
const { json, audit } = require('./database');
const { identity, has, isAdmin } = require('./access');
const { fail } = require('./validation');

async function definition(db, action, unitId) {
  const [[w]] = await db.execute('SELECT * FROM workflow_versions WHERE action_type=? AND (unit_id=? OR unit_id IS NULL) ORDER BY (unit_id IS NOT NULL) DESC, id DESC LIMIT 1', [action,unitId]);
  if (!w) fail('No workflow is configured for this action. Ask an administrator.', 409);
  w.steps = json(w.steps); return w;
}
function matches(user, step, record) {
  const unit = step.scope === 'owner' ? Number(record.owner_unit_id) : step.scope === 'unit' ? Number(step.unit_id) : null;
  return user.roles.some(r => Number(r.id) === Number(step.role_id) && r.unit_id === unit) && has(user, 'workflow.approve', unit);
}
async function eligible(db, workflow, stepIndex, record, submitter) {
  const [users] = await db.query('SELECT id FROM users WHERE is_active=1');
  const result = [];
  for (const row of users) {
    if (!workflow.allow_self && row.id === Number(submitter)) continue;
    const user = await identity(db, row.id);
    if (user && matches(user, workflow.steps[stepIndex], record) && (record.audience !== 'admin' || isAdmin(user))) result.push(row.id);
  }
  return result;
}
async function notify(db, ids, recordId, title) {
  for (const userId of ids) await db.execute('INSERT INTO notifications(user_id,record_id,title) VALUES(?,?,?)', [userId,recordId,title]);
}
async function submit(db, user, record, action) {
  if (!has(user, action, record.owner_unit_id)) fail('You cannot submit this action.', 403);
  const state = action === 'record.publish' ? 'draft' : 'published';
  if (record.status !== state) fail(`This action requires a ${state} record.`, 409);
  const w = await definition(db, action, record.owner_unit_id);
  const recipients = await eligible(db,w,0,record,user.id);
  const [result] = await db.execute('INSERT INTO workflow_instances(record_id,workflow_version_id,action_type,submitter_id,required_users,state,previous_status) VALUES(?,?,?,?,?,?,?)', [record.id,w.id,action,user.id,JSON.stringify(recipients),recipients.length ? 'pending' : 'blocked',record.status]);
  await db.execute("UPDATE records SET status='pending',version=version+1 WHERE id=?", [record.id]);
  await notify(db,recipients,record.id,'An approval request is waiting for you.');
  await audit(db,user.id,'workflow.submit',result.insertId,{record_id:record.id,workflow_version:w.id,required_users:recipients});
  return { id: result.insertId, state: recipients.length ? 'pending' : 'blocked' };
}
async function requestContext(db, instance) {
  const [[record]] = await db.execute('SELECT * FROM records WHERE id=?',[instance.record_id]);
  const [[workflow]] = await db.execute('SELECT * FROM workflow_versions WHERE id=?',[instance.workflow_version_id]);
  workflow.steps=json(workflow.steps); instance.required_users=json(instance.required_users);
  return {record,workflow};
}
async function canDecide(db, user, instance) {
  const {record,workflow}=await requestContext(db,instance);
  return instance.state==='pending' && instance.required_users.includes(user.id) &&
    (workflow.allow_self || user.id!==instance.submitter_id) && matches(user,workflow.steps[instance.current_step],record) && (record.audience!=='admin'||isAdmin(user));
}
async function decide(db,user,instanceId,decision,note) {
  // All request operations lock the record before its instance to avoid lock-order inversions.
  const [[lookup]]=await db.execute('SELECT record_id FROM workflow_instances WHERE id=?',[instanceId]);
  if (!lookup) fail('Approval request not found.',404);
  await db.execute('SELECT id FROM records WHERE id=? FOR UPDATE',[lookup.record_id]);
  const [[instance]]=await db.execute('SELECT * FROM workflow_instances WHERE id=? FOR UPDATE',[instanceId]);
  if (!await canDecide(db,user,instance)) fail('This step is not assigned to your current role, or is already resolved.',403);
  const {record,workflow}=await requestContext(db,instance);
  const [previous]=await db.execute('SELECT id FROM workflow_decisions WHERE instance_id=? AND step_index=? AND actor_id=?',[instanceId,instance.current_step,user.id]);
  if(previous.length) fail('You already decided this step.',409);
  await db.execute('INSERT INTO workflow_decisions(instance_id,step_index,actor_id,decision,note) VALUES(?,?,?,?,?)',[instanceId,instance.current_step,user.id,decision,note]);
  if(decision==='reject') {
    await db.execute("UPDATE workflow_instances SET state='rejected' WHERE id=?",[instanceId]);
    await db.execute('UPDATE records SET status=?,version=version+1 WHERE id=?',[instance.previous_status,record.id]);
  } else {
    const step=workflow.steps[instance.current_step];
    const current=await eligible(db,workflow,instance.current_step,record,instance.submitter_id);
    const revoked=instance.required_users.some(id=>!current.includes(id));
    const [decisions]=await db.execute("SELECT actor_id FROM workflow_decisions WHERE instance_id=? AND step_index=? AND decision='approve'",[instanceId,instance.current_step]);
    if(step.mode==='all' && revoked) {
      await db.execute("UPDATE workflow_instances SET state='blocked' WHERE id=?",[instanceId]);
    } else if(step.mode==='any' || instance.required_users.every(id=>decisions.some(d=>d.actor_id===id))) {
      const next=instance.current_step+1;
      if(next<workflow.steps.length) {
        const recipients=await eligible(db,workflow,next,record,instance.submitter_id);
        await db.execute('UPDATE workflow_instances SET current_step=?,required_users=?,state=? WHERE id=?',[next,JSON.stringify(recipients),recipients.length?'pending':'blocked',instanceId]);
        await notify(db,recipients,record.id,'An approval request is waiting for you.');
      } else {
        await db.execute("UPDATE workflow_instances SET state='approved' WHERE id=?",[instanceId]);
        await db.execute('UPDATE records SET status=?,version=version+1 WHERE id=?',[instance.action_type==='record.publish'?'published':'completed',record.id]);
      }
    }
  }
  await audit(db,user.id,`workflow.${decision}`,instanceId,{step:instance.current_step,note});
  await notify(db,[instance.submitter_id],record.id,'Your approval request has an update.');
}
module.exports={definition,eligible,submit,canDecide,requestContext,decide,matches};
