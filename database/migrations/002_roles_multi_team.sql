SET NAMES utf8mb4;

UPDATE users SET role='admin' WHERE role='lecturer';
ALTER TABLE users MODIFY role ENUM('admin','leader','member') NOT NULL DEFAULT 'member';

CREATE TABLE IF NOT EXISTS activity_teams (
  activity_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  role ENUM('primary','supporting') NOT NULL DEFAULT 'supporting',
  responsibility VARCHAR(255),
  contact_user_id INT UNSIGNED,
  PRIMARY KEY (activity_id, team_id),
  CONSTRAINT fk_activity_teams_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_teams_team FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT fk_activity_teams_contact FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO activity_teams (activity_id,team_id,role,responsibility)
SELECT id,team_id,'primary','Coordinating team' FROM activities;

INSERT IGNORE INTO activity_teams (activity_id,team_id,role,responsibility)
SELECT DISTINCT activity_id,team_id,'supporting','Responsible for assigned work' FROM tasks;

ALTER TABLE tasks ADD COLUMN start_date DATE NULL AFTER assignee_id;

CREATE TABLE IF NOT EXISTS task_assignees (
  task_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  CONSTRAINT fk_task_assignees_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_assignees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO task_assignees (task_id,user_id)
SELECT id,assignee_id FROM tasks WHERE assignee_id IS NOT NULL;
