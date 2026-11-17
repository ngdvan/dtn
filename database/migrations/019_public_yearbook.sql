SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS yearbook_terms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  start_year SMALLINT UNSIGNED NOT NULL,
  end_year SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  introduction TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY yearbook_term_years (start_year,end_year),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS yearbook_people (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term_id INT UNSIGNED NOT NULL,
  role ENUM('secretary','deputy_secretary','committee_member','student_association_president') NOT NULL,
  name VARCHAR(180) NOT NULL,
  academic_title VARCHAR(180),
  biography TEXT,
  portrait_stored_name VARCHAR(255),
  portrait_original_name VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX yearbook_people_term (term_id,role,sort_order),
  FOREIGN KEY (term_id) REFERENCES yearbook_terms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS yearbook_audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED,
  user_email VARCHAR(190) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT UNSIGNED,
  before_data JSON,
  after_data JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX yearbook_audit_created (created_at),
  INDEX yearbook_audit_target (target_type,target_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
