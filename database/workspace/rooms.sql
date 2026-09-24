CREATE TABLE IF NOT EXISTS rooms (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(180) NOT NULL, location VARCHAR(180) NOT NULL,
 approval_mode ENUM('auto','manual') NOT NULL DEFAULT 'auto',
 approver_id INT UNSIGNED NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE,
 FOREIGN KEY(approver_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS room_bookings (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, room_id INT UNSIGNED NOT NULL,
 user_id INT UNSIGNED NOT NULL, unit_id INT UNSIGNED NOT NULL,
 starts_at DATETIME NOT NULL, ends_at DATETIME NOT NULL,
 chair VARCHAR(180) NOT NULL, agenda TEXT NOT NULL, category VARCHAR(60) NOT NULL,
 status ENUM('pending','approved','rejected','cancelled') NOT NULL,
 decision_by INT UNSIGNED NULL, decision_note VARCHAR(1000),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(room_id) REFERENCES rooms(id), FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(unit_id) REFERENCES units(id), FOREIGN KEY(decision_by) REFERENCES users(id),
 INDEX room_schedule(room_id,status,starts_at,ends_at)
);
