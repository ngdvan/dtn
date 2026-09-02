ALTER TABLE notifications
  ADD COLUMN email_status ENUM('pending','success','failed') NULL AFTER source_key,
  ADD COLUMN push_status ENUM('pending','success','failed') NULL AFTER email_status;
