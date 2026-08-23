ALTER TABLE notifications
  ADD COLUMN activity_id INT UNSIGNED NULL AFTER user_id,
  ADD COLUMN task_id INT UNSIGNED NULL AFTER activity_id,
  ADD INDEX notifications_activity (activity_id),
  ADD INDEX notifications_task (task_id),
  ADD CONSTRAINT fk_notifications_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
