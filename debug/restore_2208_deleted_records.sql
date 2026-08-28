-- Selective recovery from the 2026-08-22 dump after migration 013 removed
-- admin@seee.edu.vn and activities created by that account.
--
-- Required setup:
--   1. Stop application writes.
--   2. Back up the current production database.
--   3. Create database nhsvsvwx_seee_activity_hub_2208_recovery.
--   4. Import "nhsvsvwx_seee_activity_hub_db 2208.sql" into that database.
--   5. Run this file while connected with access to both databases.
--
-- This script deliberately restores only records proven to have been removed by
-- migration 013. It does not restore activity 9 or overwrite any current row.

SET NAMES utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS nhsvsvwx_seee_activity_hub_db.restore_2208_deleted_records$$

CREATE PROCEDURE nhsvsvwx_seee_activity_hub_db.restore_2208_deleted_records()
BEGIN
  DECLARE source_count INT DEFAULT 0;
  DECLARE conflict_count INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- Prove that the source database is the expected pre-migration snapshot.
  SELECT COUNT(*) INTO source_count
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.users
  WHERE id=1 AND email='admin@seee.edu.vn';
  IF source_count <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: expected source user 1 was not found.';
  END IF;

  SELECT COUNT(*) INTO source_count
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.activities
  WHERE id IN (1,6,8) AND creator_id=1;
  IF source_count <> 3 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: source activities 1, 6, and 8 were not found.';
  END IF;

  SELECT COUNT(*) INTO source_count
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.tasks
  WHERE id IN (1,2) AND activity_id=1;
  IF source_count <> 2 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: source tasks 1 and 2 were not found.';
  END IF;

  SELECT
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_2208_recovery.activity_teams WHERE activity_id IN (1,6,8)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_2208_recovery.participants WHERE activity_id IN (1,6,8)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_2208_recovery.task_assignees WHERE task_id IN (1,2)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_2208_recovery.task_attachments WHERE task_id IN (1,2)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_2208_recovery.documents WHERE id=1 AND created_by=1)
  INTO source_count;
  IF source_count <> 30 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: source dependent-row counts do not match the audited dump.';
  END IF;

  -- Require the current schema, including the two migrations involved in the incident.
  SELECT COUNT(*) INTO source_count
  FROM nhsvsvwx_seee_activity_hub_db.schema_migrations
  WHERE filename IN ('013_remove_seed_records.sql','014_multiple_comment_person_tags.sql');
  IF source_count <> 2 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: production is not on the expected current schema.';
  END IF;

  -- Abort on every primary-key or unique-key collision; never overwrite production.
  SELECT
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_db.users WHERE id=1 OR email='admin@seee.edu.vn') +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_db.activities WHERE id IN (1,6,8)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_db.documents WHERE id=1) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_db.tasks WHERE id IN (1,2)) +
    (SELECT COUNT(*) FROM nhsvsvwx_seee_activity_hub_db.task_attachments WHERE id IN (1,2))
  INTO conflict_count;
  IF conflict_count <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Recovery aborted: one or more target IDs or the source email already exist.';
  END IF;

  START TRANSACTION;

  INSERT INTO nhsvsvwx_seee_activity_hub_db.users
    (id,name,email,password_hash,role,phone,avatar_color,is_active,created_at)
  SELECT id,name,email,password_hash,role,phone,avatar_color,is_active,created_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.users
  WHERE id=1 AND email='admin@seee.edu.vn';

  INSERT INTO nhsvsvwx_seee_activity_hub_db.user_teams
    (user_id,team_id,is_lead,is_vice_lead)
  SELECT user_id,team_id,is_lead,0
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.user_teams
  WHERE user_id=1;

  INSERT INTO nhsvsvwx_seee_activity_hub_db.activities
    (id,title,description,is_public,public_image_url,proposal_document_url,type,status,
     priority,team_id,creator_id,requested_by,location,start_date,deadline,result_summary,
     created_at,updated_at)
  SELECT id,title,description,0,NULL,proposal_document_url,type,status,priority,team_id,
         creator_id,requested_by,location,start_date,deadline,result_summary,created_at,updated_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.activities
  WHERE id IN (1,6,8) AND creator_id=1;

  INSERT INTO nhsvsvwx_seee_activity_hub_db.activity_teams
    (activity_id,team_id,role,responsibility,contact_user_id)
  SELECT activity_id,team_id,role,responsibility,contact_user_id
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.activity_teams
  WHERE activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.participants
    (activity_id,user_id,state,responsibility,joined_at)
  SELECT activity_id,user_id,state,responsibility,joined_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.participants
  WHERE activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.tasks
    (id,activity_id,title,description,stage,status,priority,team_id,assignee_id,assigned_by,
     start_date,deadline,deliverable,completed_at,created_at)
  SELECT id,activity_id,title,description,stage,status,priority,team_id,assignee_id,1,
         start_date,deadline,deliverable,completed_at,created_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.tasks
  WHERE activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.task_assignees
    (task_id,user_id,assigned_at)
  SELECT a.task_id,a.user_id,a.assigned_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.task_assignees a
  JOIN nhsvsvwx_seee_activity_hub_2208_recovery.tasks t ON t.id=a.task_id
  WHERE t.activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.task_attachments
    (id,task_id,user_id,kind,label,link_url,stored_name,original_name,mime_type,size_bytes,created_at)
  SELECT x.id,x.task_id,x.user_id,x.kind,x.label,x.link_url,x.stored_name,x.original_name,
         x.mime_type,x.size_bytes,x.created_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.task_attachments x
  JOIN nhsvsvwx_seee_activity_hub_2208_recovery.tasks t ON t.id=x.task_id
  WHERE t.activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.updates
    (id,activity_id,task_id,user_id,tagged_user_id,body,kind,attachment_url,created_at)
  SELECT n.id,n.activity_id,n.task_id,n.user_id,NULL,n.body,n.kind,n.attachment_url,n.created_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.updates n
  WHERE n.activity_id IN (1,6,8);

  INSERT INTO nhsvsvwx_seee_activity_hub_db.documents
    (id,name,link_url,description,applicable_year,issuing_team_id,visibility,created_by,
     created_at,updated_at)
  SELECT id,name,link_url,description,applicable_year,issuing_team_id,
         CASE WHEN visibility='all' THEN 'all_teams' ELSE 'issuing_team' END,
         created_by,created_at,updated_at
  FROM nhsvsvwx_seee_activity_hub_2208_recovery.documents
  WHERE id=1 AND created_by=1;

  COMMIT;
END$$

CALL nhsvsvwx_seee_activity_hub_db.restore_2208_deleted_records()$$
DROP PROCEDURE nhsvsvwx_seee_activity_hub_db.restore_2208_deleted_records$$

DELIMITER ;

-- Expected verification: 1 user, 3 activities, 2 tasks, 2 attachments, 1 document.
SELECT id,name,email FROM nhsvsvwx_seee_activity_hub_db.users WHERE id=1;
SELECT id,title,creator_id FROM nhsvsvwx_seee_activity_hub_db.activities WHERE id IN (1,6,8) ORDER BY id;
SELECT id,activity_id,title FROM nhsvsvwx_seee_activity_hub_db.tasks WHERE activity_id IN (1,6,8) ORDER BY id;
SELECT id,task_id,label,stored_name FROM nhsvsvwx_seee_activity_hub_db.task_attachments WHERE task_id IN (1,2) ORDER BY id;
SELECT id,name,created_by,visibility FROM nhsvsvwx_seee_activity_hub_db.documents WHERE id=1;
