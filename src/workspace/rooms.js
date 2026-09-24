'use strict';
const A=require('./access');
const V=require('./validation');
const {audit}=require('./database');
const categories=['partner','student','professional','administrative','other'];
const canBook=u=>u.memberships.some(m=>u.roles.some(r=>r.permissions.includes('room.book')&&(r.unit_id===null||Number(r.unit_id)===Number(m.unit_id))));
const canManage=u=>A.has(u,'room.manage');
function interval(b,now=Date.now()){
 const day=V.date(b.date,true);
 const time=v=>{if(!/^\d{2}:\d{2}$/.test(String(v)))V.fail('Giờ phải có định dạng HH:mm.');const [h,m]=v.split(':').map(Number);if(h>23||m>59)V.fail('Giờ không hợp lệ.');return h*60+m;};
 const start=time(b.start),end=time(b.end),weekday=new Date(day+'T12:00:00Z').getUTCDay();
 if(start<420||end>(weekday===0||weekday===6?1020:1200)||end<=start)V.fail('Đặt trong ngày: 07:00–20:00 thứ 2–6; 07:00–17:00 thứ 7, CN.');
 if(Date.parse(day+'T'+b.start+':00+07:00')<=now)V.fail('Chọn thời gian bắt đầu trong tương lai.');
 return [day+' '+b.start+':00',day+' '+b.end+':00'];
}
async function conflict(db,room,start,end,exclude=0){
 const [[row]]=await db.execute("SELECT id FROM room_bookings WHERE room_id=? AND status IN ('pending','approved') AND starts_at<? AND ends_at>? AND id<>? LIMIT 1 FOR UPDATE",[room,end,start,exclude]);
 if(row)V.fail('Phòng đã có lịch hoặc đang chờ duyệt trong khung giờ này.',409);
}
module.exports=function(app,db,mutate){
 async function access(user){if(canBook(user)||canManage(user))return;const [[r]]=await db.execute('SELECT id FROM rooms WHERE approver_id=? AND is_active=1 LIMIT 1',[user.id]);if(!r)V.fail('Cần quyền faculty và là thành viên team.',403);}
 app.get('/api/rooms',async(req,res)=>{await access(req.user);const [rooms]=await db.query('SELECT r.*,u.name approver_name FROM rooms r LEFT JOIN users u ON u.id=r.approver_id ORDER BY r.name');res.json({rooms:rooms.filter(r=>r.is_active||canManage(req.user)),canBook:canBook(req.user),canManage:canManage(req.user),categories});});
 app.get('/api/rooms/people',async(req,res)=>{if(!canManage(req.user))V.fail('Cần quyền quản lý phòng.',403);const [rows]=await db.query('SELECT id,name,email FROM users WHERE is_active=1 ORDER BY name');res.json(rows);});
 app.post('/api/rooms',async(req,res)=>res.status(201).json(await mutate(db,req,async(c,u)=>saveRoom(c,u,req.body))));
 app.patch('/api/rooms/:id',async(req,res)=>res.json(await mutate(db,req,async(c,u)=>saveRoom(c,u,req.body,V.id(req.params.id)))));
 async function saveRoom(c,u,b,id){
  if(!canManage(u))V.fail('Cần quyền Trưởng VP / quản lý phòng.',403);
  if(!['auto','manual'].includes(b.approval_mode))V.fail('Chọn cơ chế duyệt.');
  const approver=b.approval_mode==='manual'?V.id(b.approver_id):null;
  if(approver&&!await A.identity(c,approver))V.fail('Cán bộ duyệt phải có tài khoản đang hoạt động.');
  const values=[V.text(b.name,'Tên phòng'),V.text(b.location,'Vị trí'),b.approval_mode,approver,b.is_active===false?0:1];
  if(id){const [[r]]=await c.execute('SELECT id FROM rooms WHERE id=? FOR UPDATE',[id]);if(!r)V.fail('Không tìm thấy phòng.',404);await c.execute('UPDATE rooms SET name=?,location=?,approval_mode=?,approver_id=?,is_active=? WHERE id=?',[...values,id]);}
  else{const [r]=await c.execute('INSERT INTO rooms(name,location,approval_mode,approver_id,is_active) VALUES(?,?,?,?,?)',values);id=r.insertId;}
  await audit(c,u.id,'room.configure',id,b);return{id};
 }
 app.get('/api/room-bookings',async(req,res)=>{
  await access(req.user);const from=V.date(req.query.from,true),to=V.date(req.query.to,true);
  if(to<=from||Date.parse(to)-Date.parse(from)>31*86400000)V.fail('Chọn khoảng lịch tối đa 31 ngày.');
  const [rows]=await db.execute('SELECT b.*,r.name room_name,u.name requester_name FROM room_bookings b JOIN rooms r ON r.id=b.room_id JOIN users u ON u.id=b.user_id WHERE starts_at<? AND ends_at>? ORDER BY starts_at',[to,from]);
  const [rooms]=await db.query('SELECT id,approver_id,is_active FROM rooms');
  res.json(rows.map(b=>({...b,canCancel:(b.user_id===req.user.id||canManage(req.user))&&['pending','approved'].includes(b.status),canDecide:b.status==='pending'&&rooms.some(r=>r.id===b.room_id&&r.is_active&&r.approver_id===req.user.id)})));
 });
 app.post('/api/room-bookings',async(req,res)=>res.status(201).json(await mutate(db,req,async(c,u)=>{
  if(!canBook(u))V.fail('Cần quyền faculty và là thành viên team.',403);
  const b=req.body,unit=V.id(b.unit_id);if(!u.memberships.some(m=>m.unit_id===unit)||!u.roles.some(r=>r.permissions.includes('room.book')&&(r.unit_id===null||r.unit_id===unit)))V.fail('Team không có quyền faculty.',403);
  const [start,end]=interval(b);if(!categories.includes(b.category))V.fail('Chọn loại cuộc họp.');
  const [[room]]=await c.execute('SELECT * FROM rooms WHERE id=? AND is_active=1 FOR UPDATE',[V.id(b.room_id)]);if(!room)V.fail('Phòng không khả dụng.',404);
  if(room.approval_mode==='manual'&&(!room.approver_id||!await A.identity(c,room.approver_id)))V.fail('Phòng chưa có cán bộ duyệt đang hoạt động.',409);
  await conflict(c,room.id,start,end);const status=room.approval_mode==='auto'?'approved':'pending';
  const [r]=await c.execute('INSERT INTO room_bookings(room_id,user_id,unit_id,starts_at,ends_at,chair,agenda,category,status) VALUES(?,?,?,?,?,?,?,?,?)',[room.id,u.id,unit,start,end,V.text(b.chair,'Người chủ trì'),V.text(b.agenda,'Nội dung họp',10000),b.category,status]);
  await audit(c,u.id,'room.book',r.insertId,{room_id:room.id,status});return{id:r.insertId,status};
 })));
 app.post('/api/room-bookings/:id/decision',async(req,res)=>res.json(await mutate(db,req,async(c,u)=>{
  const [[b]]=await c.execute('SELECT * FROM room_bookings WHERE id=? FOR UPDATE',[V.id(req.params.id)]);if(!b)V.fail('Không tìm thấy lịch.',404);
  const [[room]]=await c.execute('SELECT * FROM rooms WHERE id=? FOR UPDATE',[b.room_id]);const action=req.body.decision;
  if(action==='cancel'){if(b.user_id!==u.id&&!canManage(u))V.fail('Không thể hủy lịch của người khác.',403);if(!['pending','approved'].includes(b.status))V.fail('Lịch đã kết thúc xử lý.',409);}
  else{if(!['approve','reject'].includes(action))V.fail('Quyết định không hợp lệ.');if(room.approver_id!==u.id||!room.is_active)V.fail('Chỉ cán bộ được chỉ định được duyệt.',403);if(b.status!=='pending')V.fail('Lịch đã được xử lý.',409);}
  if(Date.parse(b.starts_at.replace(' ','T')+'+07:00')<=Date.now())V.fail('Lịch đã bắt đầu; không thể thay đổi.',409);
  if(action==='approve'){const requester=await A.identity(c,b.user_id);if(!requester||!canBook(requester)||!requester.memberships.some(m=>m.unit_id===b.unit_id)||!requester.roles.some(r=>r.permissions.includes('room.book')&&(r.unit_id===null||r.unit_id===b.unit_id)))V.fail('Người đăng ký không còn đủ quyền.',409);await conflict(c,room.id,b.starts_at,b.ends_at,b.id);}
  const note=action==='reject'?V.text(req.body.note,'Lý do từ chối',1000):String(req.body.note||'').slice(0,1000);
  const status={approve:'approved',reject:'rejected',cancel:'cancelled'}[action];await c.execute('UPDATE room_bookings SET status=?,decision_by=?,decision_note=? WHERE id=?',[status,u.id,note,b.id]);await audit(c,u.id,'room.'+action,b.id,{note});return{ok:true};
 })));
};
module.exports.canBook=canBook;
module.exports.canManage=canManage;
module.exports.interval=interval;
