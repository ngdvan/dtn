SET NAMES utf8mb4;

ALTER TABLE activities
  ADD COLUMN proposal_document_url VARCHAR(1000) NULL
  AFTER description;
