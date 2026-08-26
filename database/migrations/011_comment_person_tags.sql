ALTER TABLE updates
  ADD COLUMN tagged_user_id INT UNSIGNED NULL AFTER user_id,
  ADD INDEX updates_tagged_user (tagged_user_id),
  ADD CONSTRAINT fk_updates_tagged_user FOREIGN KEY (tagged_user_id) REFERENCES users(id) ON DELETE SET NULL;
