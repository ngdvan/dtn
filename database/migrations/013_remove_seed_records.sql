DELETE d FROM documents d
JOIN users u ON u.id=d.created_by
WHERE u.email IN (
  'admin@seee.edu.vn','lecturer@seee.edu.vn','leader@seee.edu.vn','member@seee.edu.vn',
  'linh.vk@seee.edu.vn','huy.dq@seee.edu.vn','phuong.nm@seee.edu.vn','bao.tg@seee.edu.vn',
  'duong.lt@seee.edu.vn','anh.pd@seee.edu.vn','chau.bm@seee.edu.vn','kiet.ht@seee.edu.vn'
);

DELETE x FROM task_attachments x
JOIN users u ON u.id=x.user_id
WHERE u.email IN (
  'admin@seee.edu.vn','lecturer@seee.edu.vn','leader@seee.edu.vn','member@seee.edu.vn',
  'linh.vk@seee.edu.vn','huy.dq@seee.edu.vn','phuong.nm@seee.edu.vn','bao.tg@seee.edu.vn',
  'duong.lt@seee.edu.vn','anh.pd@seee.edu.vn','chau.bm@seee.edu.vn','kiet.ht@seee.edu.vn'
);

DELETE n FROM updates n
JOIN users u ON u.id=n.user_id
WHERE u.email IN (
  'admin@seee.edu.vn','lecturer@seee.edu.vn','leader@seee.edu.vn','member@seee.edu.vn',
  'linh.vk@seee.edu.vn','huy.dq@seee.edu.vn','phuong.nm@seee.edu.vn','bao.tg@seee.edu.vn',
  'duong.lt@seee.edu.vn','anh.pd@seee.edu.vn','chau.bm@seee.edu.vn','kiet.ht@seee.edu.vn'
);

DELETE a FROM activities a
JOIN users u ON u.id=a.creator_id
WHERE u.email IN (
  'admin@seee.edu.vn','lecturer@seee.edu.vn','leader@seee.edu.vn','member@seee.edu.vn',
  'linh.vk@seee.edu.vn','huy.dq@seee.edu.vn','phuong.nm@seee.edu.vn','bao.tg@seee.edu.vn',
  'duong.lt@seee.edu.vn','anh.pd@seee.edu.vn','chau.bm@seee.edu.vn','kiet.ht@seee.edu.vn'
);

DELETE FROM users WHERE email IN (
  'admin@seee.edu.vn','lecturer@seee.edu.vn','leader@seee.edu.vn','member@seee.edu.vn',
  'linh.vk@seee.edu.vn','huy.dq@seee.edu.vn','phuong.nm@seee.edu.vn','bao.tg@seee.edu.vn',
  'duong.lt@seee.edu.vn','anh.pd@seee.edu.vn','chau.bm@seee.edu.vn','kiet.ht@seee.edu.vn'
);
