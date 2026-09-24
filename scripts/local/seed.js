'use strict';
const fs=require('node:fs');
const path=require('node:path');
const bcrypt=require('bcryptjs');
const {roleSeeds}=require('../../src/workspace/catalog');

async function seed(db){
  const [[exists]]=await db.query("SELECT COUNT(*) n FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='app_metadata'");
  if(exists.n){const [[row]]=await db.query("SELECT value FROM app_metadata WHERE name='schema_version'");if(row?.value!=='3.0.0')throw new Error('Unexpected schema. Refusing to overwrite an existing database.');await require('../../src/workspace/room-migration')(db);console.log('Workspace already initialized; existing data preserved.');return;}
  await db.query(fs.readFileSync(path.resolve(__dirname,'../../database/workspace/schema.sql'),'utf8'));
  await db.beginTransaction();
  try{
    const units=[
      ['seee','SEEE','Trường Điện - Điện tử','school',null,'#245747'],
      ['leadership','School leadership','Ban Giám hiệu','governance',1,'#775b9a'],
      ['office','School office','Văn phòng Trường','office',1,'#be8250'],
      ['electrical','Electrical Engineering','Khoa Điện','department',1,'#467baf'],
      ['automation','Automation','Khoa Tự động hóa','department',1,'#3d8b79'],
      ['communication','Communication Engineering','Khoa Kỹ thuật truyền thông','department',1,'#8665ad'],
      ['electronics','Electronics','Khoa Điện tử','department',1,'#b36b75'],
      ['training','Practical training center','Trung tâm Đào tạo Thực hành Điện - Điện tử','center',1,'#537f85'],
      ['research','Research & development center','Trung tâm Nghiên cứu Phát triển Điện - Điện tử','center',1,'#6f789e'],
      ['student','Student organizations','Đoàn Thanh niên / Hội Sinh viên','student',1,'#bf8a36'],
      ['party','Party committee','Đảng ủy bộ phận','governance',1,'#aa665a'],
      ['council','School council','Hội đồng trường','governance',1,'#647a93'],
      ['union','Trade union','Công đoàn','association',1,'#758d55']
    ];
    for(const u of units)await db.execute('INSERT INTO units(code,name,name_vi,type,parent_id,color) VALUES(?,?,?,?,?,?)',u);
    for(const [code,name,scope,perms]of roleSeeds)await db.execute('INSERT INTO roles(code,name,scope,permissions,is_system) VALUES(?,?,?,?,1)',[code,name,scope,JSON.stringify(perms)]);
    const users=[['Recovery administrator (demo)','van.nguyendinh@hust.edu.vn'],['Demo Administrator','admin.demo@hust.edu.vn'],['Demo Dean','dean.demo@hust.edu.vn'],['Electrical team leader','leader.demo@hust.edu.vn'],['Electrical team member','member.demo@sis.hust.edu.vn'],['Public HUST user','public.demo@sis.hust.edu.vn'],['Office team leader','office.demo@hust.edu.vn'],['Electrical co-leader','coleader.demo@hust.edu.vn']];
    const hash=await bcrypt.hash('SeeeDemo!2026',10);
    for(const u of users)await db.execute("INSERT INTO users(name,email,password_hash,identity_source) VALUES(?,?,?,'demo')",[...u,hash]);
    for(const pair of [[1,1],[2,1],[3,2]])await db.execute('INSERT INTO global_roles(user_id,role_id) VALUES(?,?)',pair);
    for(const [user,unit,leader]of [[3,2,false],[4,4,true],[5,4,false],[7,3,true],[8,4,true]]){
      await db.execute('INSERT INTO memberships(user_id,unit_id) VALUES(?,?)',[user,unit]);
      await db.execute('INSERT INTO unit_roles(user_id,unit_id,role_id) VALUES(?,?,4)',[user,unit]);
      if(leader)await db.execute('INSERT INTO unit_roles(user_id,unit_id,role_id) VALUES(?,?,3)',[user,unit]);
    }
    const records=[
      ['activity','Welcome to SEEE Workspace','A school-wide workspace for everyday coordination. This public record can be viewed by every signed-in HUST user. Try different demo accounts to explore the permission boundaries.',1,2,'public',[],'published','2026-10-15',null],
      ['activity','Electrical lab readiness review','Review equipment, update safety checklists and prepare laboratories for the new semester. Ordinary Electrical Engineering members can see this record.',4,4,'teams',[{unit_id:4}],'published','2026-10-02',null],
      ['request','Leadership planning discussion','An example of an exclusive team record. Electrical Leaders and the Dean can read it. Ordinary team Members cannot.',4,4,'roles',[{role_id:3,unit_id:4}],'published','2026-10-05',null],
      ['document','School organization reference','The official school organization chart is a structural reference, not an authorization matrix.',1,2,'public',[],'published',null,'https://seee.hust.edu.vn/vi/gioi-thieu/co-cau-to-chuc/'],
      ['activity','Office coordination meeting','Prepare this week’s facilities and administrative agenda. This is visible to Office members, not Electrical members.',3,7,'teams',[{unit_id:3}],'published','2026-10-01',null],
      ['request','Demo sensitive record','Synthetic administrator-only material for testing. Dean and team Leaders must not see this record. No real personal data is included.',1,2,'admin',[],'published',null,null],
      ['activity','Student welcome session','Coordinate student welcome activities with support from academic units. Public audience does not grant editing permissions.',10,2,'public',[],'published','2026-10-10',null],
      ['activity','New teaching-material workshop','A draft authored by the Electrical Member. Submit it to test the owning-team Leader approval workflow.',4,5,'teams',[{unit_id:4}],'draft','2026-10-09',null],
      ['document','Shared equipment request guide','A demonstration of selected-team visibility spanning Electrical Engineering and the School Office.',3,7,'teams',[{unit_id:3},{unit_id:4}],'published',null,null],
      ['request','Workshop room reservation','A pending publication request for Electrical Leaders to approve. Try the Leader account, or reject it with a note to return it to draft.',4,5,'teams',[{unit_id:4}],'pending','2026-10-06',null]
    ];
    for(const r of records){r[6]=JSON.stringify(r[6]);await db.execute('INSERT INTO records(kind,title,body,owner_unit_id,author_id,audience,audience_rules,status,deadline,link_url) VALUES(?,?,?,?,?,?,?,?,?,?)',r);}
    for(const action of ['record.publish','record.complete'])await db.execute('INSERT INTO workflow_versions(action_type,unit_id,version,steps,allow_self,created_by) VALUES(?,NULL,1,?,0,2)',[action,JSON.stringify([{role_id:3,scope:'owner',unit_id:null,mode:'any'}])]);
    for(const action of ['record.publish','record.complete'])await db.execute('INSERT INTO workflow_versions(action_type,unit_id,version,steps,allow_self,created_by) VALUES(?,1,1,?,0,2)',[action,JSON.stringify([{role_id:1,scope:'global',unit_id:null,mode:'any'}])]);
    await db.execute("INSERT INTO workflow_instances(record_id,workflow_version_id,action_type,submitter_id,required_users,previous_status) VALUES(10,1,'record.publish',5,'[4,8]','draft')");
    await db.execute("INSERT INTO tasks(record_id,title,assignee_id,created_by,deadline) VALUES(2,'Check the equipment inventory',5,4,'2026-10-01'),(2,'Review safety checklist',4,4,'2026-10-02')");
    await db.execute("INSERT INTO comments(record_id,user_id,body) VALUES(2,4,'Please add the inventory findings here. This is synthetic demo content.')");
    await db.execute("INSERT INTO audit_events(actor_id,action,target,details) VALUES(2,'workspace.seed','local-demo',?)",[JSON.stringify({synthetic:true,unit_parentage:'Local display arrangement; formal reporting lines require confirmation.'})]);
    await db.execute("INSERT INTO app_metadata(name,value) VALUES('schema_version','3.0.0'),('authorization_revision','1')");
    await db.commit();await require('../../src/workspace/room-migration')(db);console.log('Seeded 13 units, 8 demo identities, 4 roles, 10 records, workflows and tasks.');
  }catch(e){await db.rollback();throw e;}
}
module.exports={seed};
