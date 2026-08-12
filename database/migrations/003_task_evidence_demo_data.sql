SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS task_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  kind ENUM('clarification','evidence','issue','deliverable') NOT NULL DEFAULT 'clarification',
  label VARCHAR(180) NOT NULL,
  link_url VARCHAR(1000),
  stored_name VARCHAR(255),
  original_name VARCHAR(255),
  mime_type VARCHAR(120),
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_attachments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- All demonstration accounts use the password: password
INSERT IGNORE INTO users (id,name,email,password_hash,role,phone,avatar_color) VALUES
 (5,'Vo Khanh Linh','linh.vk@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','leader','091 101 2001','#3B7662'),
 (6,'Do Quang Huy','huy.dq@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','leader','091 101 2002','#C06B49'),
 (7,'Nguyen Mai Phuong','phuong.nm@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2003','#5577A5'),
 (8,'Tran Gia Bao','bao.tg@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2004','#9A6D9D'),
 (9,'Le Thuy Duong','duong.lt@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2005','#B58A2D'),
 (10,'Pham Duc Anh','anh.pd@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2006','#558C6B'),
 (11,'Bui Minh Chau','chau.bm@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2007','#7D688C'),
 (12,'Hoang Tuan Kiet','kiet.ht@seee.edu.vn','$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG','member','091 101 2008','#477A89');

INSERT IGNORE INTO user_teams (user_id,team_id,is_lead) VALUES
 (5,1,1),(5,5,0),(6,2,1),(6,4,0),(7,3,0),(7,4,0),(8,2,0),(8,4,0),
 (9,5,0),(9,1,0),(10,6,0),(10,2,0),(11,1,0),(11,6,0),(12,3,0),(12,2,0);

INSERT IGNORE INTO activities (id,title,description,type,status,priority,team_id,creator_id,requested_by,location,start_date,deadline) VALUES
 (10,'SEEE Innovation Showcase','Student teams demonstrate engineering prototypes to industry guests and incoming students.','event','active','high',3,2,NULL,'Innovation Hall','2026-08-08','2026-08-20'),
 (11,'Green Campus Electrical Audit','Review lighting and electrical consumption, then propose practical energy-saving improvements.','assigned','approved','medium',6,1,'School Facilities Board','SEEE Campus','2026-08-12','2026-09-05'),
 (12,'Alumni Networking Evening','Connect current students with alumni working across electronics, automation, and energy.','event','proposed','medium',5,5,NULL,'SEEE Courtyard','2026-08-22','2026-08-28'),
 (13,'Robotics Bootcamp','A hands-on introductory robotics program with demonstrations, team challenges, and mentoring.','event','active','urgent',3,3,NULL,'Robotics Laboratory','2026-08-06','2026-08-16'),
 (14,'Freshman Support Desk','Provide enrollment guidance, campus directions, and peer support during intake week.','assigned','approved','high',6,6,'Student Affairs Office','Building E Lobby','2026-08-17','2026-08-30');

INSERT IGNORE INTO activity_teams (activity_id,team_id,role,responsibility) VALUES
 (10,3,'primary','Manage demonstrations and technical review'),(10,1,'supporting','Campaign and event coverage'),(10,4,'supporting','Guest flow and event operations'),
 (11,6,'primary','Coordinate the audit and recommendations'),(11,2,'supporting','Inspect facilities and collect measurements'),(11,3,'supporting','Analyze electrical data'),
 (12,5,'primary','Alumni and partner coordination'),(12,4,'supporting','Run the evening program'),(12,1,'supporting','Invitations and media'),
 (13,3,'primary','Develop and deliver learning content'),(13,2,'supporting','Prepare kits and laboratory logistics'),(13,4,'supporting','Coordinate participants'),
 (14,6,'primary','Operate student support services'),(14,1,'supporting','Publish guidance materials'),(14,2,'supporting','Set up desks and signage');

INSERT IGNORE INTO participants (activity_id,user_id,state,responsibility) VALUES
 (10,2,'confirmed','Academic supervisor'),(10,7,'confirmed','Prototype coordinator'),(10,8,'confirmed','Venue support'),(10,11,'confirmed','Media volunteer'),
 (11,1,'confirmed','Project sponsor'),(11,6,'confirmed','Logistics lead'),(11,10,'confirmed','Audit recorder'),(11,12,'confirmed','Data analyst'),
 (12,5,'confirmed','Activity lead'),(12,9,'confirmed','Alumni liaison'),(12,3,'confirmed','Program coordinator'),
 (13,3,'confirmed','Bootcamp lead'),(13,7,'confirmed','Technical mentor'),(13,8,'confirmed','Kit manager'),(13,12,'confirmed','Teaching assistant'),
 (14,6,'confirmed','Operations lead'),(14,10,'confirmed','Student support'),(14,11,'confirmed','Guide editor');

INSERT IGNORE INTO tasks (id,activity_id,title,description,stage,status,priority,team_id,assignee_id,start_date,deadline,deliverable) VALUES
 (20,10,'Confirm prototype lineup','Review submissions and publish the final demonstration schedule.','before','in_progress','high',3,7,'2026-08-06','2026-08-09','Approved prototype schedule'),
 (21,10,'Produce showcase media kit','Create visual identity, guest information, and social media assets.','before','open','medium',1,11,'2026-08-07','2026-08-12','Media kit and publication calendar'),
 (22,10,'Run guest reception','Welcome guests, issue badges, and direct groups to demonstration zones.','during','open','medium',4,8,'2026-08-18','2026-08-18','Reception log and attendance count'),
 (23,10,'Publish showcase results','Collect winning projects, photographs, and partner feedback.','after','open','medium',1,5,'2026-08-20','2026-08-23','Results article and photo album'),
 (24,11,'Collect lighting inventory','Record lamp type, power rating, location, and operating hours.','general','in_progress','high',2,10,'2026-08-12','2026-08-19','Completed inventory spreadsheet'),
 (25,11,'Analyze energy measurements','Calculate baseline consumption and identify priority improvement areas.','general','open','high',3,12,'2026-08-18','2026-08-26','Analysis workbook and charts'),
 (26,11,'Draft recommendation report','Combine findings into a practical proposal for School leadership.','general','open','medium',6,1,'2026-08-27','2026-09-03','Energy-saving recommendation report'),
 (27,12,'Confirm alumni speakers','Invite alumni and collect biographies and discussion topics.','before','in_progress','high',5,9,'2026-08-05','2026-08-12','Confirmed speaker list'),
 (28,12,'Design invitation campaign','Prepare email invitations, social posts, and registration form.','before','open','medium',1,5,'2026-08-10','2026-08-16','Invitation package'),
 (29,12,'Prepare networking format','Plan introductions, moderated discussion, and open networking.','during','open','medium',4,3,'2026-08-15','2026-08-22','Run-of-show document'),
 (30,13,'Prepare robotics kits','Test controllers, sensors, batteries, and spare components.','before','in_progress','urgent',2,8,'2026-08-05','2026-08-07','20 tested robotics kits'),
 (31,13,'Finalize learning exercises','Complete slides, wiring exercises, and the team challenge brief.','before','review','high',3,7,'2026-08-04','2026-08-08','Bootcamp teaching package'),
 (32,13,'Mentor challenge teams','Support teams during building, testing, and troubleshooting.','during','open','high',3,12,'2026-08-10','2026-08-15','Mentoring notes and results'),
 (33,14,'Publish freshman quick guide','Prepare a bilingual guide covering enrollment and key locations.','before','in_progress','high',1,11,'2026-08-07','2026-08-13','Digital freshman quick guide'),
 (34,14,'Set up support desks','Prepare tables, signs, queue markers, maps, and supplies.','before','open','medium',2,6,'2026-08-14','2026-08-16','Desk setup checklist'),
 (35,14,'Operate peer support shift','Answer questions, give directions, and record recurring issues.','during','open','high',6,10,'2026-08-17','2026-08-28','Daily support and issue log');

INSERT IGNORE INTO task_assignees (task_id,user_id) VALUES
 (20,7),(20,12),(21,11),(21,4),(22,8),(22,3),(23,5),(23,11),(24,10),(24,6),(25,12),(25,7),(26,1),(26,10),
 (27,9),(27,5),(28,5),(28,11),(29,3),(29,8),(30,8),(30,6),(31,7),(31,12),(32,12),(32,7),(33,11),(33,4),(34,6),(34,8),(35,10),(35,11);

INSERT IGNORE INTO updates (activity_id,task_id,user_id,body,kind) VALUES
 (10,20,7,'Nine prototype teams have submitted complete technical summaries; two are awaiting safety review.','progress'),
 (11,24,10,'Inventory collection started in Buildings E1 and E2. Several rooms need updated circuit labels.','issue'),
 (12,27,9,'Four alumni speakers confirmed across automation, semiconductors, energy, and embedded systems.','progress'),
 (13,30,8,'All controllers tested. Two battery packs were replaced before the first session.','evidence'),
 (14,33,11,'Vietnamese copy is complete and the English version is under review.','progress');

INSERT IGNORE INTO task_attachments (id,task_id,user_id,kind,label,link_url,size_bytes) VALUES
 (100,20,7,'clarification','Prototype submission checklist','https://www.ieee.org/conferences-events/index.html',0),
 (101,21,11,'clarification','Shared visual inspiration board','https://www.canva.com/design/',0),
 (102,24,10,'evidence','Energy audit reference methodology','https://www.energy.gov/eere/amo/energy-assessment',0),
 (103,30,8,'clarification','Arduino hardware documentation','https://docs.arduino.cc/hardware/',0),
 (104,31,12,'evidence','Robotics learning reference','https://docs.arduino.cc/learn/electronics/',0),
 (105,33,11,'clarification','Student guide content reference','https://www.ieee.org/membership/students/index.html',0);
