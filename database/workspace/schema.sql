CREATE TABLE app_metadata (name VARCHAR(60) PRIMARY KEY, value VARCHAR(200) NOT NULL);
CREATE TABLE users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255),
 identity_source ENUM('demo','microsoft') NOT NULL, provider_subject VARCHAR(255) UNIQUE,
 is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE units (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(60) UNIQUE NOT NULL,
 name VARCHAR(160) NOT NULL, name_vi VARCHAR(160) NOT NULL, type VARCHAR(40) NOT NULL,
 parent_id INT UNSIGNED NULL, color CHAR(7) NOT NULL DEFAULT '#245747',
 is_active BOOLEAN NOT NULL DEFAULT TRUE, FOREIGN KEY(parent_id) REFERENCES units(id)
);
CREATE TABLE memberships (
 user_id INT UNSIGNED NOT NULL, unit_id INT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,unit_id),
 FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(unit_id) REFERENCES units(id)
);
CREATE TABLE roles (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, code VARCHAR(60) UNIQUE NOT NULL,
 name VARCHAR(120) NOT NULL, scope ENUM('global','unit') NOT NULL,
 permissions JSON NOT NULL, revision INT NOT NULL DEFAULT 1, is_system BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE global_roles (
 user_id INT UNSIGNED NOT NULL, role_id INT UNSIGNED NOT NULL,
 PRIMARY KEY(user_id,role_id), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(role_id) REFERENCES roles(id)
);
CREATE TABLE unit_roles (
 user_id INT UNSIGNED NOT NULL, unit_id INT UNSIGNED NOT NULL, role_id INT UNSIGNED NOT NULL,
 PRIMARY KEY(user_id,unit_id,role_id),
 FOREIGN KEY(user_id,unit_id) REFERENCES memberships(user_id,unit_id) ON DELETE CASCADE,
 FOREIGN KEY(role_id) REFERENCES roles(id)
);
CREATE TABLE records (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, kind ENUM('activity','document','request') NOT NULL,
 title VARCHAR(180) NOT NULL, body TEXT NOT NULL, owner_unit_id INT UNSIGNED NOT NULL,
 author_id INT UNSIGNED NOT NULL, audience ENUM('public','teams','roles','admin') NOT NULL DEFAULT 'public',
 audience_rules JSON NOT NULL, status ENUM('draft','pending','published','completed') NOT NULL DEFAULT 'draft',
 deadline DATE NULL, link_url VARCHAR(1000), version INT NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(owner_unit_id) REFERENCES units(id), FOREIGN KEY(author_id) REFERENCES users(id),
 INDEX records_status(status,owner_unit_id), INDEX records_kind(kind)
);
CREATE TABLE workflow_versions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, action_type ENUM('record.publish','record.complete') NOT NULL,
 unit_id INT UNSIGNED NULL, version INT NOT NULL, steps JSON NOT NULL,
 allow_self BOOLEAN NOT NULL DEFAULT FALSE, created_by INT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(unit_id) REFERENCES units(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE workflow_instances (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, record_id INT UNSIGNED NOT NULL,
 workflow_version_id INT UNSIGNED NOT NULL, action_type VARCHAR(60) NOT NULL,
 submitter_id INT UNSIGNED NOT NULL, current_step INT NOT NULL DEFAULT 0,
 required_users JSON NOT NULL, state ENUM('pending','blocked','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
 previous_status VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(record_id) REFERENCES records(id), FOREIGN KEY(workflow_version_id) REFERENCES workflow_versions(id),
 FOREIGN KEY(submitter_id) REFERENCES users(id), INDEX workflow_state(state,record_id)
);
CREATE TABLE workflow_decisions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, instance_id INT UNSIGNED NOT NULL, step_index INT NOT NULL,
 actor_id INT UNSIGNED NOT NULL, decision ENUM('approve','reject') NOT NULL, note VARCHAR(1000),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY one_decision(instance_id,step_index,actor_id),
 FOREIGN KEY(instance_id) REFERENCES workflow_instances(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE tasks (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, record_id INT UNSIGNED NOT NULL,
 title VARCHAR(180) NOT NULL, assignee_id INT UNSIGNED NOT NULL, created_by INT UNSIGNED NOT NULL,
 deadline DATE NOT NULL, status ENUM('open','in_progress','done') NOT NULL DEFAULT 'open', completed_at DATETIME NULL,
 FOREIGN KEY(record_id) REFERENCES records(id), FOREIGN KEY(assignee_id) REFERENCES users(id), FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE comments (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, record_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL,
 body TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(record_id) REFERENCES records(id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE attachments (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, record_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL,
 original_name VARCHAR(255) NOT NULL, stored_name VARCHAR(100) NOT NULL, size_bytes BIGINT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(record_id) REFERENCES records(id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE notifications (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NOT NULL, record_id INT UNSIGNED NULL,
 title VARCHAR(180) NOT NULL, seen_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(record_id) REFERENCES records(id)
);
CREATE TABLE audit_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, actor_id INT UNSIGNED NULL,
 action VARCHAR(100) NOT NULL, target VARCHAR(150) NOT NULL, details JSON NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(actor_id) REFERENCES users(id)
);
