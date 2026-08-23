CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  kind VARCHAR(50) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body VARCHAR(500) NOT NULL,
  url VARCHAR(500),
  source_key VARCHAR(190) NOT NULL,
  seen_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY notifications_user_source (user_id, source_key),
  INDEX notifications_inbox (user_id, seen_at, created_at),
  INDEX notifications_expiry (expires_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
