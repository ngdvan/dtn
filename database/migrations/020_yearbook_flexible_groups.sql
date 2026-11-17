SET NAMES utf8mb4;

CREATE TABLE yearbook_groups (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX yearbook_groups_term (term_id,sort_order),
  FOREIGN KEY (term_id) REFERENCES yearbook_terms(id) ON DELETE CASCADE
);

ALTER TABLE yearbook_people
  MODIFY role ENUM('secretary','deputy_secretary','committee_member','student_association_president','group_member') NOT NULL,
  ADD COLUMN group_id INT UNSIGNED NULL AFTER term_id,
  ADD INDEX yearbook_people_group (group_id,sort_order),
  ADD CONSTRAINT yearbook_people_group_fk FOREIGN KEY (group_id) REFERENCES yearbook_groups(id) ON DELETE SET NULL;
