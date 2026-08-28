ALTER TABLE activities
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE AFTER description,
  ADD COLUMN public_image_url VARCHAR(1000) NULL AFTER is_public,
  ADD INDEX activities_public (is_public, created_at);
