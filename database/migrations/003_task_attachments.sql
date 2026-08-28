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
