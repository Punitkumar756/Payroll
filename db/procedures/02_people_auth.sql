-- =============================================================
--  Stored Procedures: People / Auth Module
-- =============================================================
DELIMITER $$

-- ── fn_calendar_has_holiday ──────────────────────────────────
DROP FUNCTION IF EXISTS fn_calendar_has_holiday$$
CREATE FUNCTION fn_calendar_has_holiday(p_calendar_id INT UNSIGNED, p_date DATE)
RETURNS TINYINT(1) DETERMINISTIC READS SQL DATA
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count
  FROM holidays h
  JOIN holiday_calendar_map hcm ON hcm.holiday_id=h.id
  WHERE hcm.calendar_id=p_calendar_id AND p_date BETWEEN h.start_date AND h.end_date;
  RETURN IF(v_count > 0, 1, 0);
END$$

-- ── AUTH: login ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_auth_login$$
CREATE PROCEDURE sp_auth_login(IN p_username VARCHAR(100))
BEGIN
  SELECT u.id AS user_id, u.employee_id, u.password_hash, u.is_active,
         r.name AS role_name, e.first_name, e.last_name,
         e.official_email, e.contact_number
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN employees e ON e.id = u.employee_id
  WHERE u.username = p_username          -- existing web/admin login (username)
     OR e.official_email = p_username;   -- mobile login (official email)
END$$

DROP PROCEDURE IF EXISTS sp_auth_update_last_login$$
CREATE PROCEDURE sp_auth_update_last_login(IN p_user_id INT UNSIGNED, IN p_refresh_hash VARCHAR(500))
BEGIN
  UPDATE users SET last_login_at=NOW(), refresh_token_hash=p_refresh_hash WHERE id=p_user_id;
END$$

DROP PROCEDURE IF EXISTS sp_auth_refresh_token$$
CREATE PROCEDURE sp_auth_refresh_token(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT u.id AS user_id, u.employee_id, u.is_active, r.name AS role_name
  FROM users u JOIN roles r ON r.id=u.role_id
  WHERE u.id=p_user_id AND u.is_active=1;
END$$

-- ── EMPLOYEE: create ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_create$$
CREATE PROCEDURE sp_employee_create(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_employee_code   VARCHAR(30),
  IN p_first_name      VARCHAR(80),
  IN p_middle_name     VARCHAR(80),
  IN p_last_name       VARCHAR(80),
  IN p_dob             DATE,
  IN p_gender          VARCHAR(10),
  IN p_joining_date    DATE,
  IN p_department_id   INT UNSIGNED,
  IN p_designation_id  INT UNSIGNED,
  IN p_location_id     INT UNSIGNED,
  IN p_category_id     INT UNSIGNED,
  IN p_group_id        INT UNSIGNED,
  IN p_sub_group_id    INT UNSIGNED,
  IN p_calendar_id     INT UNSIGNED,
  IN p_reporting_mgr   INT UNSIGNED,
  IN p_official_email  VARCHAR(200),
  IN p_contact_number  VARCHAR(20),
  IN p_badge_id        VARCHAR(50)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF p_first_name IS NULL OR TRIM(p_first_name)='' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:first_name_required';
  END IF;
  IF p_last_name IS NULL OR TRIM(p_last_name)='' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:last_name_required';
  END IF;
  IF p_joining_date IS NULL THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:joining_date_required';
  END IF;
  START TRANSACTION;
    INSERT INTO employees (
      employee_code, first_name, middle_name, last_name, date_of_birth, gender,
      joining_date, department_id, designation_id, location_id, category_id,
      group_id, sub_group_id, calendar_id, reporting_manager_id,
      official_email, contact_number, badge_id
    ) VALUES (
      TRIM(p_employee_code), TRIM(p_first_name), p_middle_name, TRIM(p_last_name),
      p_dob, p_gender, p_joining_date, p_department_id, p_designation_id,
      p_location_id, p_category_id, p_group_id, p_sub_group_id, p_calendar_id,
      p_reporting_mgr, p_official_email, p_contact_number, p_badge_id
    );
    SET v_id = LAST_INSERT_ID();
    -- Create empty statutory record
    INSERT INTO employee_statutory_details (employee_id) VALUES (v_id);
    CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_create', CAST(v_id AS CHAR), 'CREATE', NULL,
      JSON_OBJECT('code',p_employee_code,'name',CONCAT(p_first_name,' ',p_last_name)));
  COMMIT;
  SELECT v_id AS id;
END$$

-- ── EMPLOYEE: update ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_update$$
CREATE PROCEDURE sp_employee_update(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_id              INT UNSIGNED,
  IN p_first_name      VARCHAR(80),
  IN p_middle_name     VARCHAR(80),
  IN p_last_name       VARCHAR(80),
  IN p_dob             DATE,
  IN p_gender          VARCHAR(10),
  IN p_joining_date    DATE,
  IN p_confirmation_date DATE,
  IN p_status          VARCHAR(20),
  IN p_department_id   INT UNSIGNED,
  IN p_designation_id  INT UNSIGNED,
  IN p_location_id     INT UNSIGNED,
  IN p_category_id     INT UNSIGNED,
  IN p_group_id        INT UNSIGNED,
  IN p_sub_group_id    INT UNSIGNED,
  IN p_calendar_id     INT UNSIGNED,
  IN p_reporting_mgr   INT UNSIGNED,
  IN p_official_email  VARCHAR(200),
  IN p_contact_number  VARCHAR(20),
  IN p_badge_id        VARCHAR(50)
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM employees WHERE id=p_id) THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:employee';
  END IF;
  UPDATE employees SET
    first_name=TRIM(p_first_name), middle_name=p_middle_name, last_name=TRIM(p_last_name),
    date_of_birth=p_dob, gender=p_gender, joining_date=p_joining_date,
    confirmation_date=p_confirmation_date, status=p_status,
    department_id=p_department_id, designation_id=p_designation_id,
    location_id=p_location_id, category_id=p_category_id,
    group_id=p_group_id, sub_group_id=p_sub_group_id,
    calendar_id=p_calendar_id, reporting_manager_id=p_reporting_mgr,
    official_email=p_official_email, contact_number=p_contact_number, badge_id=p_badge_id
  WHERE id=p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_update', CAST(p_id AS CHAR), 'UPDATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── EMPLOYEE: self update (restricted fields) ────────────────
DROP PROCEDURE IF EXISTS sp_employee_self_update$$
CREATE PROCEDURE sp_employee_self_update(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_caller_uid         INT UNSIGNED,
  IN p_contact_number     VARCHAR(20),
  IN p_current_address    VARCHAR(500),
  IN p_emergency_name     VARCHAR(200),
  IN p_emergency_phone    VARCHAR(20),
  IN p_emergency_relation VARCHAR(50)
)
BEGIN
  IF p_caller_role NOT IN ('HR','Employee','Manager') THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED';
  END IF;
  UPDATE employees SET contact_number=p_contact_number WHERE id=p_caller_employee_id;
  -- Upsert current address
  INSERT INTO employee_addresses (employee_id,address_type,address_line1,emergency_contact_name,emergency_contact_phone,emergency_contact_relation)
  VALUES (p_caller_employee_id,'Current',p_current_address,p_emergency_name,p_emergency_phone,p_emergency_relation)
  ON DUPLICATE KEY UPDATE
    address_line1=p_current_address,
    emergency_contact_name=p_emergency_name,
    emergency_contact_phone=p_emergency_phone,
    emergency_contact_relation=p_emergency_relation;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_self_update', CAST(p_caller_employee_id AS CHAR), 'UPDATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── EMPLOYEE: get by id ───────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_get_by_id$$
CREATE PROCEDURE sp_employee_get_by_id(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_target_employee_id INT UNSIGNED
)
BEGIN
  -- Employees can only see their own record
  IF p_caller_role IN ('Employee', 'Manager') AND p_caller_employee_id != p_target_employee_id THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
  END IF;
  SELECT
    e.id, e.employee_code, e.first_name, e.middle_name, e.last_name,
    e.date_of_birth, e.gender, e.joining_date, e.confirmation_date,
    e.status, e.official_email, e.personal_email, e.contact_number, e.badge_id,
    e.photo_path,
    d.name AS department_name, des.name AS designation_name,
    l.name AS location_name, c.name AS category_name,
    g.name AS group_name, sg.name AS sub_group_name,
    cal.name AS calendar_name,
    CONCAT(m.first_name,' ',m.last_name) AS reporting_manager_name,
    -- Statutory (masked for employee, full for HR)
    sd.pf_number, sd.esi_number, sd.uan_number,
    IF(p_caller_role='HR', sd.bank_name, sd.bank_name) AS bank_name,
    IF(p_caller_role='HR', sd.bank_ifsc, sd.bank_ifsc) AS bank_ifsc
  FROM employees e
  LEFT JOIN departments d   ON d.id=e.department_id
  LEFT JOIN designations des ON des.id=e.designation_id
  LEFT JOIN locations l     ON l.id=e.location_id
  LEFT JOIN categories c    ON c.id=e.category_id
  LEFT JOIN `groups` g      ON g.id=e.group_id
  LEFT JOIN sub_groups sg   ON sg.id=e.sub_group_id
  LEFT JOIN calendars cal   ON cal.id=e.calendar_id
  LEFT JOIN employees m     ON m.id=e.reporting_manager_id
  LEFT JOIN employee_statutory_details sd ON sd.employee_id=e.id
  WHERE e.id=p_target_employee_id;
END$$

-- ── EMPLOYEE: list (HR only) ──────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_list$$
CREATE PROCEDURE sp_employee_list(
  IN p_caller_role    VARCHAR(30),
  IN p_department_id  INT UNSIGNED,
  IN p_location_id    INT UNSIGNED,
  IN p_status         VARCHAR(20),
  IN p_search         VARCHAR(100),
  IN p_page           INT UNSIGNED,
  IN p_page_size      INT UNSIGNED
)
BEGIN
  DECLARE v_offset INT UNSIGNED;
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  SET p_page = IFNULL(p_page, 1);
  SET p_page_size = IFNULL(p_page_size, 20);
  SET v_offset = (p_page - 1) * p_page_size;
  SELECT
    e.id, e.employee_code, CONCAT(e.first_name,' ',e.last_name) AS full_name,
    e.official_email, e.contact_number, e.joining_date, e.status,
    d.name AS department, des.name AS designation, l.name AS location
  FROM employees e
  LEFT JOIN departments d    ON d.id=e.department_id
  LEFT JOIN designations des ON des.id=e.designation_id
  LEFT JOIN locations l      ON l.id=e.location_id
  WHERE (p_department_id IS NULL OR e.department_id=p_department_id)
    AND (p_location_id IS NULL   OR e.location_id=p_location_id)
    AND (p_status IS NULL        OR e.status=p_status)
    AND (p_search IS NULL        OR CONCAT(e.first_name,' ',e.last_name) LIKE CONCAT('%',p_search,'%')
         OR e.employee_code LIKE CONCAT('%',p_search,'%'))
  ORDER BY e.first_name, e.last_name
  LIMIT p_page_size OFFSET v_offset;
END$$

-- ── EMPLOYEE: update statutory details (HR only) ─────────────
DROP PROCEDURE IF EXISTS sp_employee_statutory_update$$
CREATE PROCEDURE sp_employee_statutory_update(
  IN p_caller_role   VARCHAR(30),
  IN p_caller_uid    INT UNSIGNED,
  IN p_employee_id   INT UNSIGNED,
  IN p_pf_number     VARCHAR(50),
  IN p_esi_number    VARCHAR(50),
  IN p_pan           VARCHAR(20),
  IN p_aadhaar       VARCHAR(20),
  IN p_bank_name     VARCHAR(100),
  IN p_bank_account  VARCHAR(30),
  IN p_bank_ifsc     VARCHAR(20),
  IN p_bank_branch   VARCHAR(100),
  IN p_uan           VARCHAR(30),
  IN p_enc_key       VARCHAR(100)
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  INSERT INTO employee_statutory_details
    (employee_id,pf_number,esi_number,pan_encrypted,aadhaar_encrypted,bank_name,bank_account_encrypted,bank_ifsc,bank_branch,uan_number)
  VALUES
    (p_employee_id,p_pf_number,p_esi_number,
     AES_ENCRYPT(p_pan,p_enc_key),AES_ENCRYPT(p_aadhaar,p_enc_key),
     p_bank_name,AES_ENCRYPT(p_bank_account,p_enc_key),p_bank_ifsc,p_bank_branch,p_uan)
  ON DUPLICATE KEY UPDATE
    pf_number=p_pf_number,esi_number=p_esi_number,
    pan_encrypted=AES_ENCRYPT(p_pan,p_enc_key),
    aadhaar_encrypted=AES_ENCRYPT(p_aadhaar,p_enc_key),
    bank_name=p_bank_name,bank_account_encrypted=AES_ENCRYPT(p_bank_account,p_enc_key),
    bank_ifsc=p_bank_ifsc,bank_branch=p_bank_branch,uan_number=p_uan;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_statutory_update', CAST(p_employee_id AS CHAR), 'UPDATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── USER: create for employee ────────────────────────────────
DROP PROCEDURE IF EXISTS sp_user_create_for_employee$$
CREATE PROCEDURE sp_user_create_for_employee(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_employee_id  INT UNSIGNED,
  IN p_username     VARCHAR(100),
  IN p_password_hash VARCHAR(255),
  IN p_role_id      TINYINT UNSIGNED
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF EXISTS (SELECT 1 FROM users WHERE employee_id=p_employee_id) THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:user_already_exists';
  END IF;
  INSERT INTO users (employee_id,username,password_hash,role_id)
  VALUES (p_employee_id,p_username,p_password_hash,p_role_id);
  SET v_id=LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_user_create_for_employee', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('username',p_username,'role_id',p_role_id));
  SELECT v_id AS id;
END$$

-- ── USER: activate / deactivate ──────────────────────────────
DROP PROCEDURE IF EXISTS sp_user_activate$$
CREATE PROCEDURE sp_user_activate(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_user_id INT UNSIGNED)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE users SET is_active=1 WHERE id=p_user_id;
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_user_deactivate$$
CREATE PROCEDURE sp_user_deactivate(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_user_id INT UNSIGNED)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_user_id = p_caller_uid THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:cannot_deactivate_self'; END IF;
  UPDATE users SET is_active=0 WHERE id=p_user_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── USER: list ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_user_list$$
CREATE PROCEDURE sp_user_list(IN p_caller_role VARCHAR(30))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT u.id, u.username, u.is_active, u.last_login_at, r.name AS role_name,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name, e.employee_code
  FROM users u
  JOIN roles r ON r.id=u.role_id
  LEFT JOIN employees e ON e.id=u.employee_id
  ORDER BY u.username;
END$$

-- ── ROLE: assign ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_role_assign$$
CREATE PROCEDURE sp_role_assign(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_user_id INT UNSIGNED, IN p_role_id TINYINT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE users SET role_id=p_role_id WHERE id=p_user_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_role_assign', CAST(p_user_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('role_id',p_role_id));
  SELECT ROW_COUNT() AS affected;
END$$

-- ── EMPLOYEE: delete ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_delete$$
CREATE PROCEDURE sp_employee_delete(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_employee_id     INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_employee_id) THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:employee';
  END IF;

  START TRANSACTION;
  
  -- 1. Unassign reporting manager
  UPDATE employees SET reporting_manager_id = NULL WHERE reporting_manager_id = p_employee_id;
  
  -- 2. Loans & Repayments
  DELETE FROM loan_repayments WHERE loan_id IN (SELECT id FROM loans WHERE employee_id = p_employee_id);
  DELETE FROM loans WHERE employee_id = p_employee_id;
  
  -- 3. Advances
  DELETE FROM advances_deductions WHERE employee_id = p_employee_id;
  
  -- 4. Payroll
  DELETE FROM payslip_lines WHERE payslip_id IN (SELECT id FROM payslips WHERE employee_id = p_employee_id);
  DELETE FROM payslips WHERE employee_id = p_employee_id;
  DELETE FROM employee_ctc WHERE employee_id = p_employee_id;
  
  -- 5. Leaves
  DELETE FROM leave_applications WHERE employee_id = p_employee_id;
  DELETE FROM leave_balances WHERE employee_id = p_employee_id;
  DELETE FROM employee_leave_policy WHERE employee_id = p_employee_id;
  
  -- 6. Attendance
  DELETE FROM attendance_correction_requests WHERE employee_id = p_employee_id;
  DELETE FROM attendance_daily WHERE employee_id = p_employee_id;
  DELETE FROM employee_shift_assignments WHERE employee_id = p_employee_id;
  
  -- 7. User
  DELETE FROM users WHERE employee_id = p_employee_id;
  
  -- 8. Employee (Addresses & Statutory cascade automatically)
  DELETE FROM employees WHERE id = p_employee_id;
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_delete', CAST(p_employee_id AS CHAR), 'DELETE', NULL, NULL);
  
  COMMIT;
  SELECT 1 AS affected;
END$$

DELIMITER ;
