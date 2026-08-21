SET NAMES utf8mb4;

ALTER TABLE documents
  ADD COLUMN visibility ENUM('all','managers') NOT NULL DEFAULT 'all'
  AFTER issuing_team_id;
