SET NAMES utf8mb4;

ALTER TABLE task_attachments
  MODIFY kind ENUM('clarification','evidence','issue','deliverable','description') NOT NULL DEFAULT 'clarification';

CREATE TABLE IF NOT EXISTS activity_description_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  size_bytes BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_description_attachments_activity (activity_id),
  CONSTRAINT fk_activity_description_attachment_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_description_attachment_user FOREIGN KEY (user_id) REFERENCES users(id)
);
