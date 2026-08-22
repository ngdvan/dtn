ALTER TABLE tasks
  ADD COLUMN assigned_by INT UNSIGNED NULL AFTER assignee_id,
  ADD INDEX tasks_assigned_by (assigned_by),
  ADD CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

UPDATE tasks task
JOIN activities activity ON activity.id = task.activity_id
SET task.assigned_by = activity.creator_id
WHERE task.assigned_by IS NULL;
