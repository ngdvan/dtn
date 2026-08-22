SET NAMES utf8mb4;

ALTER TABLE users
  MODIFY role ENUM('admin','leader','vice_leader','member') NOT NULL DEFAULT 'member';

ALTER TABLE user_teams
  ADD COLUMN is_vice_lead BOOLEAN NOT NULL DEFAULT FALSE AFTER is_lead;

ALTER TABLE documents
  MODIFY visibility ENUM('all','managers','all_teams','issuing_team') NOT NULL DEFAULT 'issuing_team';

UPDATE documents
SET visibility = CASE
  WHEN visibility = 'all' THEN 'all_teams'
  ELSE 'issuing_team'
END;

ALTER TABLE documents
  MODIFY visibility ENUM('all_teams','issuing_team') NOT NULL DEFAULT 'issuing_team';
