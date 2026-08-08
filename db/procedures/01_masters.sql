-- =============================================================
--  Stored Procedures: Masters Module
-- =============================================================
DELIMITER $$

-- ── Helper: log to audit_log ─────────────────────────────────
DROP PROCEDURE IF EXISTS sp_audit_log$$
CREATE PROCEDURE sp_audit_log(
  IN p_user_id       INT UNSIGNED,
  IN p_role_name     VARCHAR(30),
  IN p_procedure     VARCHAR(100),
  IN p_record_id     VARCHAR(50),
  IN p_action        VARCHAR(30),
  IN p_old_values    JSON,
  IN p_new_values    JSON
)
BEGIN
  INSERT INTO audit_log (user_id, role_name, procedure_name, record_id, action, old_values, new_values)
  VALUES (p_user_id, p_role_name, p_procedure, p_record_id, p_action, p_old_values, p_new_values);
END$$

-- ── LOCATIONS ────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_location_list$$
CREATE PROCEDURE sp_master_location_list(
  IN p_caller_role VARCHAR(30)
)
BEGIN
  IF p_caller_role NOT IN ('HR', 'Manager', 'Employee') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCESS_DENIED';
  END IF;
  SELECT id, code, name, address, phone, fax, website, is_active, created_at
  FROM locations
  ORDER BY name;
END$$

DROP PROCEDURE IF EXISTS sp_master_location_create$$
CREATE PROCEDURE sp_master_location_create(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_code         VARCHAR(20),
  IN p_name         VARCHAR(100),
  IN p_address      TEXT,
  IN p_phone        VARCHAR(20),
  IN p_fax          VARCHAR(20),
  IN p_website      VARCHAR(200)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF p_code IS NULL OR TRIM(p_code) = '' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:code_required';
  END IF;
  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:name_required';
  END IF;
  INSERT INTO locations (code, name, address, phone, fax, website)
  VALUES (TRIM(p_code), TRIM(p_name), p_address, p_phone, p_fax, p_website);
  SET v_id = LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_location_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code', p_code, 'name', p_name));
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_location_update$$
CREATE PROCEDURE sp_master_location_update(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_id           INT UNSIGNED,
  IN p_code         VARCHAR(20),
  IN p_name         VARCHAR(100),
  IN p_address      TEXT,
  IN p_phone        VARCHAR(20),
  IN p_fax          VARCHAR(20),
  IN p_website      VARCHAR(200),
  IN p_is_active    TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM locations WHERE id = p_id) THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:location';
  END IF;
  UPDATE locations SET code=TRIM(p_code), name=TRIM(p_name), address=p_address,
    phone=p_phone, fax=p_fax, website=p_website, is_active=p_is_active
  WHERE id = p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_location_update', CAST(p_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('code', p_code, 'name', p_name));
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_master_location_delete$$
CREATE PROCEDURE sp_master_location_delete(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_id           INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF EXISTS (SELECT 1 FROM employees WHERE location_id = p_id AND status = 'Active') THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:location_in_use';
  END IF;
  UPDATE locations SET is_active = 0 WHERE id = p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_location_delete', CAST(p_id AS CHAR), 'DEACTIVATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── DEPARTMENTS ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_department_list$$
CREATE PROCEDURE sp_master_department_list(IN p_caller_role VARCHAR(30))
BEGIN
  IF p_caller_role NOT IN ('HR','Manager','Employee') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCESS_DENIED';
  END IF;
  SELECT id, code, name, is_active, created_at FROM departments ORDER BY name;
END$$

DROP PROCEDURE IF EXISTS sp_master_department_create$$
CREATE PROCEDURE sp_master_department_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_code IS NULL OR TRIM(p_code)='' THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:code_required'; END IF;
  INSERT INTO departments (code, name) VALUES (TRIM(p_code), TRIM(p_name));
  SET v_id = LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_department_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_department_update$$
CREATE PROCEDURE sp_master_department_update(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE id=p_id) THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:department'; END IF;
  UPDATE departments SET code=TRIM(p_code), name=TRIM(p_name), is_active=p_is_active WHERE id=p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_department_update', CAST(p_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_master_department_delete$$
CREATE PROCEDURE sp_master_department_delete(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF EXISTS (SELECT 1 FROM employees WHERE department_id=p_id AND status='Active') THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:department_in_use';
  END IF;
  UPDATE departments SET is_active=0 WHERE id=p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_department_delete', CAST(p_id AS CHAR), 'DEACTIVATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── DESIGNATIONS ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_designation_list$$
CREATE PROCEDURE sp_master_designation_list(IN p_caller_role VARCHAR(30))
BEGIN
  SELECT id, code, name, is_active FROM designations ORDER BY name;
END$$

DROP PROCEDURE IF EXISTS sp_master_designation_create$$
CREATE PROCEDURE sp_master_designation_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO designations (code, name) VALUES (TRIM(p_code), TRIM(p_name));
  SET v_id = LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_designation_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_designation_update$$
CREATE PROCEDURE sp_master_designation_update(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE designations SET code=TRIM(p_code), name=TRIM(p_name), is_active=p_is_active WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_master_designation_delete$$
CREATE PROCEDURE sp_master_designation_delete(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE designations SET is_active=0 WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CATEGORIES ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_category_list$$
CREATE PROCEDURE sp_master_category_list(IN p_caller_role VARCHAR(30))
BEGIN SELECT id, code, name, is_active FROM categories ORDER BY name; END$$

DROP PROCEDURE IF EXISTS sp_master_category_create$$
CREATE PROCEDURE sp_master_category_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100))
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO categories (code,name) VALUES (TRIM(p_code),TRIM(p_name));
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_category_update$$
CREATE PROCEDURE sp_master_category_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE categories SET code=TRIM(p_code),name=TRIM(p_name),is_active=p_is_active WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_master_category_delete$$
CREATE PROCEDURE sp_master_category_delete(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE categories SET is_active=0 WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── GROUPS ───────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_group_list$$
CREATE PROCEDURE sp_master_group_list(IN p_caller_role VARCHAR(30))
BEGIN SELECT id, code, name, is_active FROM `groups` ORDER BY name; END$$

DROP PROCEDURE IF EXISTS sp_master_group_create$$
CREATE PROCEDURE sp_master_group_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100))
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO `groups` (code,name) VALUES (TRIM(p_code),TRIM(p_name));
  SET v_id=LAST_INSERT_ID(); SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_group_update$$
CREATE PROCEDURE sp_master_group_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE `groups` SET code=TRIM(p_code),name=TRIM(p_name),is_active=p_is_active WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

DROP PROCEDURE IF EXISTS sp_master_group_delete$$
CREATE PROCEDURE sp_master_group_delete(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE `groups` SET is_active=0 WHERE id=p_id; SELECT ROW_COUNT() AS affected;
END$$

-- ── SUB GROUPS ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_subgroup_list$$
CREATE PROCEDURE sp_master_subgroup_list(IN p_caller_role VARCHAR(30), IN p_group_id INT UNSIGNED)
BEGIN
  SELECT s.id, s.code, s.name, s.group_id, g.name AS group_name, s.is_active
  FROM sub_groups s JOIN `groups` g ON g.id=s.group_id
  WHERE (p_group_id IS NULL OR s.group_id=p_group_id)
  ORDER BY s.name;
END$$

DROP PROCEDURE IF EXISTS sp_master_subgroup_create$$
CREATE PROCEDURE sp_master_subgroup_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_group_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100))
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO sub_groups (group_id,code,name) VALUES (p_group_id,TRIM(p_code),TRIM(p_name));
  SET v_id=LAST_INSERT_ID(); SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_subgroup_update$$
CREATE PROCEDURE sp_master_subgroup_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_group_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE sub_groups SET group_id=p_group_id,code=TRIM(p_code),name=TRIM(p_name),is_active=p_is_active WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDARS ────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_calendar_list$$
CREATE PROCEDURE sp_master_calendar_list(IN p_caller_role VARCHAR(30))
BEGIN SELECT id, code, name, is_active FROM calendars ORDER BY name; END$$

DROP PROCEDURE IF EXISTS sp_master_calendar_create$$
CREATE PROCEDURE sp_master_calendar_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100))
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO calendars (code,name) VALUES (TRIM(p_code),TRIM(p_name));
  SET v_id=LAST_INSERT_ID(); SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_master_calendar_update$$
CREATE PROCEDURE sp_master_calendar_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_is_active TINYINT(1))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE calendars SET code=TRIM(p_code),name=TRIM(p_name),is_active=p_is_active WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── HOLIDAYS ─────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_master_holiday_list$$
CREATE PROCEDURE sp_master_holiday_list(IN p_caller_role VARCHAR(30), IN p_calendar_id INT UNSIGNED)
BEGIN
  SELECT h.id, h.code, h.name, h.start_date, h.end_date, h.is_week_off, h.is_optional,
         GROUP_CONCAT(hcm.calendar_id) AS calendar_ids
  FROM holidays h
  LEFT JOIN holiday_calendar_map hcm ON hcm.holiday_id=h.id
  WHERE (p_calendar_id IS NULL OR hcm.calendar_id=p_calendar_id)
  GROUP BY h.id
  ORDER BY h.start_date;
END$$

DROP PROCEDURE IF EXISTS sp_master_holiday_create$$
CREATE PROCEDURE sp_master_holiday_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(200),
  IN p_start_date DATE, IN p_end_date DATE,
  IN p_is_week_off TINYINT(1), IN p_is_optional TINYINT(1),
  IN p_calendar_ids JSON
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  DECLARE v_cal_id INT UNSIGNED;
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_len INT;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_end_date < p_start_date THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start'; END IF;
  INSERT INTO holidays (code,name,start_date,end_date,is_week_off,is_optional)
  VALUES (TRIM(p_code),TRIM(p_name),p_start_date,p_end_date,p_is_week_off,p_is_optional);
  SET v_id=LAST_INSERT_ID();
  IF p_calendar_ids IS NOT NULL THEN
    SET v_len = JSON_LENGTH(p_calendar_ids);
    WHILE v_idx < v_len DO
      SET v_cal_id = JSON_EXTRACT(p_calendar_ids, CONCAT('$[',v_idx,']'));
      INSERT IGNORE INTO holiday_calendar_map (holiday_id,calendar_id) VALUES (v_id,v_cal_id);
      SET v_idx = v_idx+1;
    END WHILE;
  END IF;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_holiday_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
  SELECT v_id AS id;
END$$

-- ── ANNOUNCEMENTS ────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_announcement_publish$$
CREATE PROCEDURE sp_announcement_publish(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_heading VARCHAR(300), IN p_type VARCHAR(50),
  IN p_display_start DATE, IN p_display_end DATE,
  IN p_content TEXT
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_display_end < p_display_start THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start'; END IF;
  INSERT INTO announcements (heading,type,display_start,display_end,content,created_by)
  VALUES (p_heading,p_type,p_display_start,p_display_end,p_content,p_caller_uid);
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_announcement_list$$
CREATE PROCEDURE sp_announcement_list(IN p_caller_role VARCHAR(30), IN p_active_only TINYINT(1))
BEGIN
  SELECT id,heading,type,display_start,display_end,content,is_active,created_at
  FROM announcements
  WHERE (p_active_only=0 OR (is_active=1 AND display_start<=CURDATE() AND display_end>=CURDATE()))
  ORDER BY created_at DESC;
END$$

DELIMITER ;
