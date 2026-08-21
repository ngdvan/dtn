SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  link_url VARCHAR(1000) NOT NULL,
  description TEXT NOT NULL,
  applicable_year SMALLINT UNSIGNED NOT NULL,
  issuing_team_id INT UNSIGNED NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX documents_year (applicable_year),
  INDEX documents_team (issuing_team_id),
  CONSTRAINT fk_documents_team FOREIGN KEY (issuing_team_id) REFERENCES teams(id),
  CONSTRAINT fk_documents_creator FOREIGN KEY (created_by) REFERENCES users(id)
);
