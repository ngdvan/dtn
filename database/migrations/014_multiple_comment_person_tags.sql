CREATE TABLE IF NOT EXISTS update_tagged_users (
  update_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (update_id, user_id),
  INDEX update_tagged_users_user (user_id),
  CONSTRAINT fk_update_tagged_users_update FOREIGN KEY (update_id) REFERENCES updates(id) ON DELETE CASCADE,
  CONSTRAINT fk_update_tagged_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO update_tagged_users(update_id, user_id)
SELECT id, tagged_user_id FROM updates WHERE tagged_user_id IS NOT NULL;
