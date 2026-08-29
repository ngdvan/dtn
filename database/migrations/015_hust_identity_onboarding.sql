ALTER TABLE users
  ADD COLUMN class_number VARCHAR(100) NULL AFTER phone,
  ADD COLUMN faculty_notice_acknowledged_at DATETIME NULL AFTER class_number;
