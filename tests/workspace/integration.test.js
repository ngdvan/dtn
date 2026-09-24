'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const mysql=require('mysql2/promise');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
process.env.WORKSPACE_DB_NAME='seee_workspace_test';
process.env.LOCAL_DEMO_AUTH='true';
const {seed}=require('../../scripts/local/seed');
const {createApplication}=require('../../src/workspace/app');
let app,server,base,root;const clients={};
function client(){let cookie='',csrf='';return{
 async call(url,method='GET',body,extra={}){
  const response=await fetch(base+url,{method,headers:{Cookie:cookie,'X-CSRF-Token':csrf,...(body instanceof FormData?{}:{'Content-Type':'application/json'}),...extra},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
  const set=response.headers.getSetCookie();if(set.length)cookie=set.map(s=>s.split(';')[0]).join('; ');
  const data=response.headers.get('content-type')?.includes('application/json')?await response.json():await response.arrayBuffer();
  if(data.csrf)csrf=data.csrf;
  return {status:response.status,data,headers:response.headers};
 },
 async login(email){await this.call('/api/session');const result=await this.call('/api/login','POST',{email,password:'SeeeDemo!2026'});assert.equal(result.status,200,JSON.stringify(result.data));return this;}
};}
before(async()=>{
 const credentials=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../.local/mysql-admin.json'),'utf8'));
 root=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root',password:credentials.password,multipleStatements:true});
 const [[location]]=await root.query('SELECT @@datadir directory');
 assert.equal(path.resolve(location.directory).toLowerCase(),path.resolve(__dirname,'../../.local/mysql-data').toLowerCase());
 // This fixed, dedicated test database is the only schema reset by the suite.
 await root.query('DROP DATABASE IF EXISTS seee_workspace_test');
 await root.query('CREATE DATABASE seee_workspace_test CHARACTER SET utf8mb4');
 await root.query("GRANT ALL ON seee_workspace_test.* TO 'seee_local'@'localhost'");
 await root.query('USE seee_workspace_test');await seed(root);
 app=createApplication();await new Promise(r=>{server=app.app.listen(0,'127.0.0.1',r);});base=`http://127.0.0.1:${server.address().port}`;
 for(const [name,email]of Object.entries({admin:'admin.demo@hust.edu.vn',recovery:'van.nguyendinh@hust.edu.vn',dean:'dean.demo@hust.edu.vn',leader:'leader.demo@hust.edu.vn',member:'member.demo@sis.hust.edu.vn',public:'public.demo@sis.hust.edu.vn',office:'office.demo@hust.edu.vn',coleader:'coleader.demo@hust.edu.vn'}))clients[name]=await client().login(email);
});
after(async()=>{if(server)await new Promise(r=>server.close(r));if(app)await app.close();if(root)await root.end();});
test('anonymous and non-HUST login are denied; session and CSRF are required',async()=>{
 const c=client();assert.equal((await c.call('/api/records')).status,401);
 await c.call('/api/session');assert.equal((await c.call('/api/login','POST',{email:'outside@example.com',password:'SeeeDemo!2026'})).status,401);
 assert.equal((await clients.member.call('/api/records','POST',{}, {'X-CSRF-Token':''})).status,403);
 assert.equal((await clients.member.call('/api/records','POST',{}, {Origin:'https://outside.example'})).status,403);
});
test('public/member/leader/Dean access matches list and direct record checks',async()=>{
 const expected={public:[1,4,7],member:[1,2,4,7,8,9,10],leader:[1,2,3,4,7,9],office:[1,4,5,7,9],dean:[1,2,3,4,5,7,9]};
 for(const [name,ids]of Object.entries(expected)){
  const result=await clients[name].call('/api/records');assert.equal(result.status,200,JSON.stringify(result.data));
  assert.deepEqual(result.data.records.map(r=>r.id).sort((a,b)=>a-b),ids,name);
  for(let i=1;i<=10;i++)assert.equal((await clients[name].call('/api/records/'+i)).status,ids.includes(i)?200:404,`${name}:${i}`);
 }
 assert.equal((await clients.dean.call('/api/admin')).status,403);assert.equal((await clients.dean.call('/api/admin/export')).status,403);
 assert.equal((await clients.admin.call('/api/records/6')).status,200);
});
test('work writes are scoped and private tasks never bypass record audience',async()=>{
 const body={kind:'activity',title:'Wrong unit',body:'Scope test',owner_unit_id:3,audience:'public'};
 assert.equal((await clients.leader.call('/api/records','POST',body)).status,403);
 assert.equal((await clients.public.call('/api/records','POST',{...body,owner_unit_id:4})).status,403);
 assert.equal((await clients.member.call('/api/records/3/tasks','POST',{title:'Denied',assignee_id:5,deadline:'2026-10-01'})).status,404);
 assert.equal((await clients.leader.call('/api/records/3/tasks','POST',{title:'Ineligible',assignee_id:5,deadline:'2026-10-01'})).status,400);
 assert.equal((await clients.office.call('/api/tasks/1','PATCH',{status:'done'})).status,404);
 assert.equal((await clients.member.call('/api/tasks/1','PATCH',{status:'done'})).status,200);
 assert.equal((await clients.member.call('/api/tasks/1','PATCH',{status:'open'})).status,200);
 const [[row]]=await root.query('SELECT completed_at FROM tasks WHERE id=1');assert.equal(row.completed_at,null);
});
test('members submit publication; only current scoped approvers decide; versions are immutable',async()=>{
 const submitted=await clients.member.call('/api/records/8/submit','POST',{action:'record.publish'});assert.equal(submitted.status,200,JSON.stringify(submitted.data));
 const iid=submitted.data.id;
 const version=await clients.admin.call('/api/admin/workflows','POST',{action_type:'record.publish',unit_id:4,allow_self:false,steps:[{role_id:1,scope:'global',mode:'any'}]});assert.equal(version.status,201);
 assert.equal((await clients.office.call(`/api/approvals/${iid}/decision`,'POST',{decision:'approve'})).status,403);
 assert.equal((await clients.member.call(`/api/approvals/${iid}/decision`,'POST',{decision:'approve'})).status,403);
 assert.equal((await clients.leader.call(`/api/approvals/${iid}/decision`,'POST',{decision:'approve'})).status,200);
 assert.equal((await clients.leader.call(`/api/approvals/${iid}/decision`,'POST',{decision:'approve'})).status,403);
 assert.equal((await clients.member.call('/api/records/8')).data.record.status,'published');
 const [[instance]]=await root.query('SELECT workflow_version_id FROM workflow_instances WHERE id=?',[iid]);assert.equal(instance.workflow_version_id,1);
});
test('leader can appoint another same-team leader, not global or other-team roles',async()=>{
 assert.equal((await clients.leader.call('/api/units/3/appointments','POST',{user_id:6,role:'leader'})).status,403);
 assert.equal((await clients.leader.call('/api/units/4/appointments','POST',{user_id:6,role:'administrator'})).status,403);
 assert.equal((await clients.leader.call('/api/units/4/appointments','POST',{user_id:6,role:'leader'})).status,200);
 assert.equal((await clients.public.call('/api/records/3')).status,200,'existing session gains fresh current role');
 assert.equal((await clients.public.call('/api/admin')).status,403);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:6,unit_id:4,role_id:4,revoke:true})).status,200);
 assert.equal((await clients.public.call('/api/records/2')).status,404,'revocation affects existing session');
 assert.equal((await clients.public.call('/api/records/1')).status,200,'public baseline remains');
});
test('publisher audiences require role AND scope and revisions prevent stale updates',async()=>{
 const created=await clients.leader.call('/api/records','POST',{kind:'activity',title:'Audience test',body:'Publish by role',owner_unit_id:4,audience:'roles',audience_rules:[{role_id:3,unit_id:4}]});assert.equal(created.status,201);
 const id=created.data.id;const submit=await clients.leader.call(`/api/records/${id}/submit`,'POST',{action:'record.publish'});assert.equal(submit.status,200);
 assert.equal((await clients.admin.call(`/api/approvals/${submit.data.id}/decision`,'POST',{decision:'approve'})).status,200);
 assert.equal((await clients.member.call(`/api/records/${id}`)).status,404);
 assert.equal((await clients.office.call(`/api/records/${id}`)).status,404);
 assert.equal((await clients.dean.call(`/api/records/${id}`)).status,200);
 const r=(await clients.leader.call(`/api/records/${id}`)).data.record;
 assert.equal((await clients.leader.call(`/api/records/${id}`,'PATCH',{...r,version:0})).status,409);
 assert.equal((await clients.leader.call(`/api/records/${id}`,'PATCH',{...r,audience:'public',audience_rules:[]})).status,200);
 assert.equal((await clients.public.call(`/api/records/${id}`)).status,404,'audience change is a draft until approved');
 assert.equal((await clients.leader.call('/api/records','POST',{kind:'document',title:'Invalid',body:'scope',owner_unit_id:4,audience:'roles',audience_rules:[{role_id:3,unit_id:null}]})).status,400);
});
test('protected materials use live record visibility for direct download',async()=>{
 const body=new FormData();body.set('file',new Blob(['Synthetic permission check'],{type:'text/plain'}),'test.txt');
 const result=await clients.leader.call('/api/records/3/attachments','POST',body);assert.equal(result.status,201,JSON.stringify(result.data));
 const id=result.data.id;
 assert.equal((await clients.member.call(`/api/attachments/${id}`)).status,404);
 assert.equal((await clients.public.call(`/api/attachments/${id}`)).status,404);
 assert.equal((await clients.dean.call(`/api/attachments/${id}`)).status,200);
 assert.equal((await clients.leader.call(`/api/attachments/${id}`)).status,200);
});
test('permission matrix changes apply immediately to existing sessions',async()=>{
 let role=(await clients.admin.call('/api/admin')).data.roles.find(r=>r.id===4);
 assert.equal((await clients.admin.call('/api/admin/roles/4','PATCH',{permissions:role.permissions.filter(p=>p!=='comment.create'),revision:role.revision})).status,200);
 assert.equal((await clients.member.call('/api/records/2/comments','POST',{body:'Should be denied'})).status,403);
 assert.equal((await clients.member.call('/api/records/2')).status,200,'baseline viewing remains');
 assert.equal((await clients.admin.call('/api/admin/roles/4','PATCH',{permissions:role.permissions,revision:role.revision+1})).status,200);
 assert.equal((await clients.member.call('/api/records/2/comments','POST',{body:'Allowed again'})).status,201);
});
test('all-approver snapshot is not silently reduced after revocation',async()=>{
 const configured=await clients.admin.call('/api/admin/workflows','POST',{action_type:'record.publish',unit_id:4,steps:[{role_id:3,scope:'owner',mode:'all'}]});assert.equal(configured.status,201);
 const created=await clients.member.call('/api/records','POST',{kind:'request',title:'All approval',body:'Quorum test',owner_unit_id:4,audience:'teams',audience_rules:[{unit_id:4}]});
 const submitted=await clients.member.call(`/api/records/${created.data.id}/submit`,'POST',{action:'record.publish'});assert.equal(submitted.status,200);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:8,unit_id:4,role_id:3,revoke:true})).status,200);
 assert.equal((await clients.coleader.call(`/api/approvals/${submitted.data.id}/decision`,'POST',{decision:'approve'})).status,403);
 assert.equal((await clients.leader.call(`/api/approvals/${submitted.data.id}/decision`,'POST',{decision:'approve'})).status,200);
 const [[i]]=await root.query('SELECT state FROM workflow_instances WHERE id=?',[submitted.data.id]);assert.equal(i.state,'blocked');
 assert.equal((await clients.admin.call(`/api/approvals/${submitted.data.id}/cancel`,'POST',{})).status,200);
});
test('self-approval and missing approvers cannot automatically publish',async()=>{
 await clients.admin.call('/api/admin/workflows','POST',{action_type:'record.publish',unit_id:4,allow_self:false,steps:[{role_id:3,scope:'owner',mode:'any'}]});
 const c=await clients.leader.call('/api/records','POST',{kind:'request',title:'Blocked example',body:'Only the submitter has this approver role',owner_unit_id:4,audience:'public'});
 const s=await clients.leader.call(`/api/records/${c.data.id}/submit`,'POST',{action:'record.publish'});assert.equal(s.data.state,'blocked');
 assert.equal((await clients.leader.call(`/api/approvals/${s.data.id}/decision`,'POST',{decision:'approve'})).status,403);
});
test('sensitive classification cannot be downgraded; reports/audit remain administrator-only',async()=>{
 const r=(await clients.admin.call('/api/records/6')).data.record;
 assert.equal((await clients.admin.call('/api/records/6','PATCH',{...r,audience:'public',audience_rules:[]})).status,403);
 const output=await clients.admin.call('/api/admin/export');assert.equal(output.status,200);assert.ok(output.data.byteLength>1000);assert.equal(Buffer.from(output.data).subarray(0,2).toString(),'PK');
 const d=await clients.admin.call('/api/admin');assert.ok(d.data.events.some(e=>e.action==='history.export'));
});
test('unit cycles, wrong role scope, last admin removal and deactivation are enforced',async()=>{
 assert.equal((await clients.admin.call('/api/admin/units/1','PATCH',{parent_id:4})).status,400);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:5,role_id:2,unit_id:4})).status,400);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:1,role_id:1,revoke:true})).status,200);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:2,role_id:1,revoke:true})).status,409);
 assert.equal((await clients.admin.call('/api/admin/users/2','PATCH',{is_active:false})).status,409);
 assert.equal((await clients.admin.call('/api/admin/users/5','PATCH',{is_active:false})).status,200);
 assert.equal((await clients.member.call('/api/records')).status,401);
});

test('room access, operating hours, concurrent conflicts, manual decisions and cancellations',async()=>{
 await clients.admin.call('/api/admin/users/5','PATCH',{is_active:true});
 assert.equal((await clients.public.call('/api/rooms')).status,403);
 assert.equal((await clients.member.call('/api/rooms')).status,403);
 const [[faculty]]=await root.query("SELECT id FROM roles WHERE code='faculty'");
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:5,unit_id:4,role_id:faculty.id})).status,200);
 const created=await clients.admin.call('/api/rooms','POST',{name:'Test shared',location:'A1',approval_mode:'auto'});assert.equal(created.status,201);
 const body={room_id:created.data.id,unit_id:4,date:'2099-01-05',start:'07:00',end:'08:00',chair:'Faculty chair',agenda:'Meeting agenda',category:'professional'};
 assert.equal((await clients.public.call('/api/room-bookings','POST',body)).status,403);
 assert.equal((await clients.member.call('/api/room-bookings','POST',{...body,start:'06:59'})).status,400);
 const results=await Promise.all([clients.member.call('/api/room-bookings','POST',body),clients.member.call('/api/room-bookings','POST',body)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);assert.equal(results.find(r=>r.status===201).data.status,'approved');
 assert.equal((await clients.member.call('/api/room-bookings','POST',{...body,start:'08:00',end:'09:00'})).status,201);
 const weekend={...body,date:'2099-01-03',start:'16:00',end:'17:01'};
 assert.equal((await clients.member.call('/api/room-bookings','POST',weekend)).status,400);
 assert.equal((await clients.member.call('/api/room-bookings','POST',{...weekend,end:'17:00'})).status,201);
 const manual=await clients.admin.call('/api/rooms','POST',{name:'Test special',location:'A2',approval_mode:'manual',approver_id:7});assert.equal(manual.status,201);
 const pending=await clients.member.call('/api/room-bookings','POST',{...body,room_id:manual.data.id});assert.equal(pending.data.status,'pending');
 const url='/api/room-bookings/'+pending.data.id+'/decision';
 assert.equal((await clients.leader.call(url,'POST',{decision:'approve'})).status,403);
 assert.equal((await clients.office.call(url,'POST',{decision:'reject'})).status,400);
 assert.equal((await clients.office.call(url,'POST',{decision:'approve'})).status,200);
 assert.equal((await clients.office.call(url,'POST',{decision:'approve'})).status,409);
 assert.equal((await clients.member.call(url,'POST',{decision:'cancel'})).status,200);
 const next=await clients.member.call('/api/room-bookings','POST',{...body,room_id:manual.data.id});assert.equal(next.status,201);
 assert.equal((await clients.office.call('/api/room-bookings/'+next.data.id+'/decision','POST',{decision:'reject',note:'Unavailable'})).status,200);
 assert.equal((await clients.admin.call('/api/admin/assignments','POST',{user_id:5,unit_id:4,role_id:faculty.id,revoke:true})).status,200);
 assert.equal((await clients.member.call('/api/rooms')).status,403);
});
