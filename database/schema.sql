SET NAMES utf8mb4;
SET time_zone = '+07:00';

CREATE TABLE IF NOT EXISTS teams (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  color CHAR(7) NOT NULL DEFAULT '#315C4C',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','leader','vice_leader','member') NOT NULL DEFAULT 'member',
  phone VARCHAR(30),
  avatar_color CHAR(7) NOT NULL DEFAULT '#315C4C',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_teams (
  user_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  is_lead BOOLEAN NOT NULL DEFAULT FALSE,
  is_vice_lead BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  proposal_document_url VARCHAR(1000),
  type ENUM('event','assigned') NOT NULL,
  status ENUM('proposed','approved','active','completed','cancelled') NOT NULL DEFAULT 'proposed',
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  team_id INT UNSIGNED NOT NULL,
  creator_id INT UNSIGNED NOT NULL,
  requested_by VARCHAR(160),
  location VARCHAR(180),
  start_date DATE,
  deadline DATE NOT NULL,
  result_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY activity_search (title, description, result_summary),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activity_teams (
  activity_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  role ENUM('primary','supporting') NOT NULL DEFAULT 'supporting',
  responsibility VARCHAR(255),
  contact_user_id INT UNSIGNED,
  PRIMARY KEY (activity_id, team_id),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  stage ENUM('before','during','after','general') NOT NULL DEFAULT 'general',
  status ENUM('open','in_progress','review','done') NOT NULL DEFAULT 'open',
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  team_id INT UNSIGNED NOT NULL,
  assignee_id INT UNSIGNED,
  start_date DATE,
  deadline DATE NOT NULL,
  deliverable VARCHAR(255),
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_assignees (
  task_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS participants (
  activity_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  state ENUM('volunteered','confirmed','declined') NOT NULL DEFAULT 'volunteered',
  responsibility VARCHAR(255),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id, user_id),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS updates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id INT UNSIGNED NOT NULL,
  task_id INT UNSIGNED,
  user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  kind ENUM('comment','progress','evidence','issue') NOT NULL DEFAULT 'comment',
  attachment_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  link_url VARCHAR(1000) NOT NULL,
  description TEXT NOT NULL,
  applicable_year SMALLINT UNSIGNED NOT NULL,
  issuing_team_id INT UNSIGNED NOT NULL,
  visibility ENUM('all_teams','issuing_team') NOT NULL DEFAULT 'issuing_team',
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX documents_year (applicable_year),
  INDEX documents_team (issuing_team_id),
  FOREIGN KEY (issuing_team_id) REFERENCES teams(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT IGNORE INTO teams (id, name, description, color, sort_order) VALUES
  (1, 'Communications', 'Media, content, photography and publications', '#315C4C', 1),
  (2, 'Logistics', 'Venue, materials, transport and operations', '#C76D4B', 2),
  (3, 'Academic Activities', 'Academic programs and competitions', '#5577A5', 3),
  (4, 'Events', 'Event planning and on-site coordination', '#9A6D9D', 4),
  (5, 'External Relations', 'Partners, sponsors and guest relations', '#B58A2D', 5),
  (6, 'Student Support', 'Student welfare and participation', '#558C6B', 6);

-- Password for all demo accounts: password (change these in a real deployment)
INSERT IGNORE INTO users (id, name, email, password_hash, role, phone, avatar_color) VALUES
  (1, 'Nguyen Minh Anh', 'admin@seee.edu.vn', '$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG', 'admin', '090 123 4567', '#315C4C'),
  (2, 'Dr. Tran Thu Ha', 'lecturer@seee.edu.vn', '$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG', 'admin', '090 234 5678', '#5577A5'),
  (3, 'Le Hoang Nam', 'leader@seee.edu.vn', '$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG', 'leader', '090 345 6789', '#C76D4B'),
  (4, 'Pham Bao Chau', 'member@seee.edu.vn', '$2b$10$tgCJElVRWK1z/OEpyy./6.yePIi7J51BUbU3VxWVCF5JDzZhDbqRG', 'member', '090 456 7890', '#9A6D9D');

INSERT IGNORE INTO user_teams (user_id,team_id,is_lead,is_vice_lead) VALUES (1,1,1,0),(2,3,1,0),(3,4,1,0),(3,2,0,0),(4,1,0,0);

INSERT IGNORE INTO activities (id,title,description,type,status,priority,team_id,creator_id,requested_by,location,start_date,deadline) VALUES
 (1,'Welcome Week 2026','Welcome new students to SEEE through orientation, campus tours and team activities.','event','active','high',4,3,NULL,'SEEE Main Hall','2026-08-18','2026-08-22'),
 (2,'Electrical Safety Workshop','A practical safety session requested by the School leadership.','assigned','approved','medium',3,2,'School Executive Board','Lab E2-204','2026-08-26','2026-08-28'),
 (3,'Summer Volunteer Campaign','Community outreach and electrical system checks for local schools.','event','completed','high',6,1,NULL,'Bac Ninh Province','2026-06-10','2026-06-18');

INSERT IGNORE INTO activity_teams (activity_id,team_id,role,responsibility)
SELECT id,team_id,'primary','Coordinating team' FROM activities;

INSERT IGNORE INTO tasks (id,activity_id,title,description,stage,status,priority,team_id,assignee_id,deadline,deliverable,completed_at) VALUES
 (1,1,'Publish welcome campaign','Prepare the campaign identity and social media launch.','before','in_progress','high',1,4,'2026-08-12','Campaign kit and 5 social posts',NULL),
 (2,1,'Prepare main hall','Confirm seating, signage, AV and reception desks.','before','open','high',2,3,'2026-08-17','Venue readiness checklist',NULL),
 (3,1,'Coordinate check-in','Run QR check-in and direct students on the day.','during','open','medium',4,NULL,'2026-08-18','Attendance sheet',NULL),
 (4,1,'Publish event recap','Select photographs and publish a post-event story.','after','open','medium',1,NULL,'2026-08-24','Recap article and album',NULL),
 (5,2,'Prepare lab demonstrations','Build safe demonstration rigs and supporting slides.','general','review','medium',3,2,'2026-08-24','Slides and demonstration plan',NULL),
 (6,3,'Submit campaign report','Finalize statistics, finances and lessons learned.','after','done','high',6,1,'2026-06-25','Signed final report','2026-06-24 16:30:00');

INSERT IGNORE INTO activity_teams (activity_id,team_id,role,responsibility)
SELECT DISTINCT activity_id,team_id,'supporting','Responsible for assigned work' FROM tasks;

INSERT IGNORE INTO task_assignees (task_id,user_id)
SELECT id,assignee_id FROM tasks WHERE assignee_id IS NOT NULL;

INSERT IGNORE INTO participants (activity_id,user_id,state,responsibility) VALUES
 (1,1,'confirmed','Project oversight'),(1,3,'confirmed','Event lead'),(1,4,'confirmed','Communications'),(2,2,'confirmed','Workshop lead'),(3,1,'confirmed','Campaign coordinator');

INSERT IGNORE INTO updates (id,activity_id,task_id,user_id,body,kind) VALUES
 (1,1,1,4,'Visual direction approved. First three posts are ready for review.','progress'),
 (2,1,2,3,'The main hall is confirmed; waiting for the AV inventory.','progress'),
 (3,1,NULL,2,'Please include an accessible check-in lane in the floor plan.','comment'),
 (4,3,6,1,'Final report signed and archived with the School office.','evidence');
