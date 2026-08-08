-- =============================================================
--  Seed: Roles + Initial HR Admin User
-- =============================================================

INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'HR'),
  (2, 'Manager'),
  (3, 'Employee');

-- Initial HR Admin employee record
INSERT IGNORE INTO employees (id, employee_code, first_name, last_name, joining_date, official_email, status)
VALUES (1, 'EMP-001', 'System', 'Admin', CURDATE(), 'admin@ankitinfotech.com', 'Active');

-- password = Admin@1234
INSERT IGNORE INTO users (id, employee_id, username, password_hash, role_id, is_active)
VALUES (1, 1, 'admin', '$2a$12$2puxPBS7Lh1x6hWuHaK0NuEuqRvfN793LL2TDmTjeqamCSl.oYJNO', 1, 1);
