const sampleGroups=[
  {name:'BAN THƯ KÝ HỘI SINH VIÊN',members:['Hoàng Đức Nam','Nguyễn Hà Chi','Trần Anh Minh','Lê Thu Hương','Phạm Quang Huy']},
  {name:'BAN CHẤP HÀNH ĐOÀN THANH NIÊN',members:['Nguyễn Hải Linh','Phạm Minh Phúc','Đỗ Thu Ngân','Vũ Khánh An','Trần Gia Bảo','Lê Minh Châu','Nguyễn Đức Duy','Phạm Hà Giang','Đinh Quốc Hưng','Bùi Mai Lan','Vũ Tuấn Long','Hoàng Khánh Ly','Nguyễn Hoàng Nam','Trần Minh Phương','Lê Anh Tuấn']}
];
const initials=name=>name.split(' ').slice(-2).map(part=>part[0]).join('');
document.getElementById('sample-groups').innerHTML=sampleGroups.map(group=>`<article class="yb-group"><h2>${group.name}</h2><div class="yb-group-members">${group.members.map((name,index)=>`<article class="yb-group-member"><div class="yb-portrait sample-portrait"><span>${initials(name)}</span></div><b>${name}</b><small>${index===0?'Trưởng ban / Chủ trì':'Thành viên'}</small></article>`).join('')}</div></article>`).join('');
