SET NAMES utf8mb4;

ALTER TABLE tasks
  ADD COLUMN self_reported_by INT UNSIGNED NULL AFTER assigned_by,
  ADD INDEX tasks_self_reported_by (self_reported_by),
  ADD CONSTRAINT fk_tasks_self_reported_by FOREIGN KEY (self_reported_by) REFERENCES users(id) ON DELETE SET NULL;
