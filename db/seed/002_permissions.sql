-- =============================================================
--  DB Permissions: EXECUTE-only application user
--  Run as root/admin after schema is created
-- =============================================================

-- Create app user (change password in production!)
CREATE USER IF NOT EXISTS 'hrms_app'@'localhost' IDENTIFIED BY 'HrmsApp@SecurePass2026!';

-- Grant EXECUTE on all stored procedures / functions only
-- NO direct DML (SELECT/INSERT/UPDATE/DELETE) on tables
GRANT EXECUTE ON `hrms`.* TO 'hrms_app'@'localhost';

-- Revoke any accidental DML grants
REVOKE SELECT, INSERT, UPDATE, DELETE ON `hrms`.* FROM 'hrms_app'@'localhost';

FLUSH PRIVILEGES;
