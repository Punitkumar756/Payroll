-- =============================================================
--  Stored Procedures: Calendar Management Module
-- =============================================================
DELIMITER $$

-- ── CALENDAR: create ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_create$$
CREATE PROCEDURE sp_calendar_create(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_calendar_code   VARCHAR(30),
  IN p_calendar_name   VARCHAR(100),
  IN p_year            YEAR,
  IN p_location_id     INT UNSIGNED,
  IN p_description     VARCHAR(500),
  IN p_status          VARCHAR(20)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  -- Check unique code
  IF EXISTS (SELECT 1 FROM calendars WHERE calendar_code = p_calendar_code) THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:calendar_code_exists';
  END IF;

  INSERT INTO calendars (calendar_code, calendar_name, year, location_id, description, status)
  VALUES (TRIM(p_calendar_code), TRIM(p_calendar_name), p_year, p_location_id, p_description, p_status);
  
  SET v_id = LAST_INSERT_ID();
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code', p_calendar_code));
  SELECT v_id AS id;
END$$

-- ── CALENDAR: update ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_update$$
CREATE PROCEDURE sp_calendar_update(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_id              INT UNSIGNED,
  IN p_calendar_name   VARCHAR(100),
  IN p_year            YEAR,
  IN p_location_id     INT UNSIGNED,
  IN p_description     VARCHAR(500),
  IN p_status          VARCHAR(20)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  UPDATE calendars SET
    calendar_name = TRIM(p_calendar_name),
    year = p_year,
    location_id = p_location_id,
    description = p_description,
    status = p_status
  WHERE id = p_id;
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_update', CAST(p_id AS CHAR), 'UPDATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDAR: delete ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_delete$$
CREATE PROCEDURE sp_calendar_delete(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_id          INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  -- Hard delete is allowed here because constraints will prevent it if it's used by employees, 
  -- but generally we should soft delete. We'll allow hard delete for now.
  DELETE FROM calendars WHERE id = p_id;
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_delete', CAST(p_id AS CHAR), 'DELETE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDAR: list ───────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_list$$
CREATE PROCEDURE sp_calendar_list(
  IN p_caller_role VARCHAR(30),
  IN p_search      VARCHAR(100),
  IN p_status      VARCHAR(20),
  IN p_year        YEAR
)
BEGIN
  SELECT c.id, c.calendar_code, c.calendar_name, c.year, c.status, l.name AS location_name,
         (SELECT COUNT(*) FROM calendar_holidays WHERE calendar_id = c.id) AS holiday_count
  FROM calendars c
  LEFT JOIN locations l ON l.id = c.location_id
  WHERE (p_status IS NULL OR c.status = p_status)
    AND (p_year IS NULL OR c.year = p_year)
    AND (p_search IS NULL OR c.calendar_name LIKE CONCAT('%', p_search, '%') OR c.calendar_code LIKE CONCAT('%', p_search, '%'))
  ORDER BY c.year DESC, c.calendar_name ASC;
END$$

-- ── CALENDAR: get by id ──────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_get$$
CREATE PROCEDURE sp_calendar_get(
  IN p_caller_role VARCHAR(30),
  IN p_id          INT UNSIGNED
)
BEGIN
  SELECT c.*, l.name AS location_name
  FROM calendars c
  LEFT JOIN locations l ON l.id = c.location_id
  WHERE c.id = p_id;
END$$

-- ── CALENDAR: get holidays ───────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_holidays_get$$
CREATE PROCEDURE sp_calendar_holidays_get(
  IN p_caller_role VARCHAR(30),
  IN p_calendar_id INT UNSIGNED
)
BEGIN
  SELECT * FROM calendar_holidays WHERE calendar_id = p_calendar_id ORDER BY holiday_date ASC;
END$$

-- ── CALENDAR HOLIDAY: upsert ─────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_holiday_upsert$$
CREATE PROCEDURE sp_calendar_holiday_upsert(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_calendar_id INT UNSIGNED,
  IN p_holiday_id  INT UNSIGNED, -- NULL for create
  IN p_date        DATE,
  IN p_name        VARCHAR(200),
  IN p_type        VARCHAR(50),
  IN p_optional    TINYINT(1),
  IN p_description VARCHAR(500)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  IF p_holiday_id IS NULL OR p_holiday_id = 0 THEN
    INSERT INTO calendar_holidays (calendar_id, holiday_date, holiday_name, holiday_type, is_optional, description)
    VALUES (p_calendar_id, p_date, TRIM(p_name), p_type, p_optional, p_description);
  ELSE
    UPDATE calendar_holidays SET
      holiday_date = p_date,
      holiday_name = TRIM(p_name),
      holiday_type = p_type,
      is_optional = p_optional,
      description = p_description
    WHERE id = p_holiday_id AND calendar_id = p_calendar_id;
  END IF;
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_holiday_upsert', CAST(p_calendar_id AS CHAR), 'UPDATE', NULL, NULL);
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDAR HOLIDAY: delete ─────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_holiday_delete$$
CREATE PROCEDURE sp_calendar_holiday_delete(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_calendar_id INT UNSIGNED,
  IN p_holiday_id  INT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  DELETE FROM calendar_holidays WHERE id = p_holiday_id AND calendar_id = p_calendar_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDAR: get weekly offs ────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_weekly_offs_get$$
CREATE PROCEDURE sp_calendar_weekly_offs_get(
  IN p_caller_role VARCHAR(30),
  IN p_calendar_id INT UNSIGNED
)
BEGIN
  SELECT * FROM calendar_weekly_offs WHERE calendar_id = p_calendar_id;
END$$

-- ── CALENDAR WEEKLY OFF: clear & save ────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_weekly_offs_save$$
CREATE PROCEDURE sp_calendar_weekly_offs_save(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_calendar_id INT UNSIGNED,
  IN p_json_data   JSON
)
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE v_count INT;
  DECLARE v_day VARCHAR(20);
  DECLARE v_pattern VARCHAR(20);

  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  START TRANSACTION;
  
  DELETE FROM calendar_weekly_offs WHERE calendar_id = p_calendar_id;
  
  SET v_count = JSON_LENGTH(p_json_data);
  WHILE i < v_count DO
    SET v_day = JSON_UNQUOTE(JSON_EXTRACT(p_json_data, CONCAT('$[', i, '].day_of_week')));
    SET v_pattern = JSON_UNQUOTE(JSON_EXTRACT(p_json_data, CONCAT('$[', i, '].week_pattern')));
    
    INSERT INTO calendar_weekly_offs (calendar_id, day_of_week, week_pattern)
    VALUES (p_calendar_id, v_day, v_pattern);
    
    SET i = i + 1;
  END WHILE;
  
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_weekly_offs_save', CAST(p_calendar_id AS CHAR), 'UPDATE', NULL, NULL);
  COMMIT;
  SELECT v_count AS affected;
END$$

-- ── CALENDAR OVERRIDES: get ──────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_overrides_get$$
CREATE PROCEDURE sp_calendar_overrides_get(
  IN p_caller_role VARCHAR(30),
  IN p_calendar_id INT UNSIGNED
)
BEGIN
  SELECT * FROM calendar_date_overrides WHERE calendar_id = p_calendar_id ORDER BY date ASC;
END$$

-- ── CALENDAR OVERRIDE: upsert ────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_override_upsert$$
CREATE PROCEDURE sp_calendar_override_upsert(
  IN p_caller_role   VARCHAR(30),
  IN p_caller_uid    INT UNSIGNED,
  IN p_calendar_id   INT UNSIGNED,
  IN p_date          DATE,
  IN p_override      VARCHAR(50),
  IN p_reason        VARCHAR(500)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  INSERT INTO calendar_date_overrides (calendar_id, date, override_status, reason, created_by)
  VALUES (p_calendar_id, p_date, p_override, p_reason, p_caller_uid)
  ON DUPLICATE KEY UPDATE
    override_status = p_override,
    reason = p_reason,
    created_by = p_caller_uid;
    
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_calendar_override_upsert', CAST(p_calendar_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('date', p_date, 'override', p_override));
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CALENDAR OVERRIDE: delete ────────────────────────────────
DROP PROCEDURE IF EXISTS sp_calendar_override_delete$$
CREATE PROCEDURE sp_calendar_override_delete(
  IN p_caller_role   VARCHAR(30),
  IN p_caller_uid    INT UNSIGNED,
  IN p_calendar_id   INT UNSIGNED,
  IN p_date          DATE
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  DELETE FROM calendar_date_overrides WHERE calendar_id = p_calendar_id AND date = p_date;
  SELECT ROW_COUNT() AS affected;
END$$

DELIMITER ;
