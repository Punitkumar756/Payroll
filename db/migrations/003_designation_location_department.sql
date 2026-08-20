-- =============================================================
--  Migration 003: Add location_id & department_id to designations
-- =============================================================

ALTER TABLE designations
  ADD COLUMN location_id   INT UNSIGNED NULL AFTER name,
  ADD COLUMN department_id INT UNSIGNED NULL AFTER location_id,
  ADD CONSTRAINT fk_designation_location   FOREIGN KEY (location_id)   REFERENCES locations(id)   ON DELETE SET NULL,
  ADD CONSTRAINT fk_designation_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
