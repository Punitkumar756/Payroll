-- =============================================================
--  Stored Procedures: Attendance & Shift Module
-- =============================================================
DELIMITER $$

-- ── SHIFTS ───────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_shift_list$$
CREATE PROCEDURE sp_shift_list(IN p_caller_role VARCHAR(30))
BEGIN
  SELECT id,code,name,start_time,end_time,grace_late_mins,grace_early_mins,
         ot_eligible,ot_start_after_mins,is_night_shift,is_active
  FROM shifts ORDER BY name;
END$$

DROP PROCEDURE IF EXISTS sp_shift_create$$
CREATE PROCEDURE sp_shift_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_start_time TIME, IN p_end_time TIME,
  IN p_grace_late INT UNSIGNED, IN p_grace_early INT UNSIGNED,
  IN p_ot_eligible TINYINT(1), IN p_ot_after INT UNSIGNED,
  IN p_is_night TINYINT(1)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO shifts (code,name,start_time,end_time,grace_late_mins,grace_early_mins,ot_eligible,ot_start_after_mins,is_night_shift)
  VALUES (TRIM(p_code),TRIM(p_name),p_start_time,p_end_time,p_grace_late,p_grace_early,p_ot_eligible,p_ot_after,p_is_night);
  SET v_id=LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid,p_caller_role,'sp_shift_create',CAST(v_id AS CHAR),'CREATE',NULL,JSON_OBJECT('code',p_code,'name',p_name));
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_shift_update$$
CREATE PROCEDURE sp_shift_update(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_start_time TIME, IN p_end_time TIME,
  IN p_grace_late INT UNSIGNED, IN p_grace_early INT UNSIGNED,
  IN p_ot_eligible TINYINT(1), IN p_ot_after INT UNSIGNED,
  IN p_is_night TINYINT(1), IN p_is_active TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE shifts SET code=TRIM(p_code),name=TRIM(p_name),start_time=p_start_time,end_time=p_end_time,
    grace_late_mins=p_grace_late,grace_early_mins=p_grace_early,
    ot_eligible=p_ot_eligible,ot_start_after_mins=p_ot_after,
    is_night_shift=p_is_night,is_active=p_is_active
  WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── SHIFT ASSIGN ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_shift_assign$$
CREATE PROCEDURE sp_shift_assign(
  IN p_caller_role    VARCHAR(30),
  IN p_caller_uid     INT UNSIGNED,
  IN p_employee_ids   JSON,
  IN p_shift_id       INT UNSIGNED,
  IN p_effective_from DATE,
  IN p_effective_to   DATE
)
BEGIN
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_len INT;
  DECLARE v_emp_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SET v_len = JSON_LENGTH(p_employee_ids);
  WHILE v_idx < v_len DO
    SET v_emp_id = JSON_EXTRACT(p_employee_ids, CONCAT('$[',v_idx,']'));
    INSERT INTO employee_shift_assignments (employee_id,shift_id,effective_from,effective_to,created_by)
    VALUES (v_emp_id,p_shift_id,p_effective_from,p_effective_to,p_caller_uid);
    SET v_idx=v_idx+1;
  END WHILE;
  SELECT v_len AS assigned;
END$$

-- ── ATTENDANCE PROCESS TIMECARD ───────────────────────────────
DROP PROCEDURE IF EXISTS sp_attendance_process_timecard$$
CREATE PROCEDURE sp_attendance_process_timecard(
  IN p_caller_role      VARCHAR(30),
  IN p_caller_uid       INT UNSIGNED,
  IN p_employee_ids     JSON,
  IN p_from_date        DATE,
  IN p_to_date          DATE,
  IN p_overwrite_manual TINYINT(1)
)
BEGIN
  DECLARE v_emp_id   INT UNSIGNED;
  DECLARE v_idx      INT DEFAULT 0;
  DECLARE v_len      INT;
  DECLARE v_cur_date DATE;
  DECLARE v_shift_id INT UNSIGNED;
  DECLARE v_cal_id   INT UNSIGNED;
  DECLARE v_day_status ENUM('Present','Absent','WeekOff','Holiday','Leave','HalfDay','PaidLeave','UnpaidLeave');
  DECLARE v_dow      TINYINT;  -- 1=Sunday...7=Saturday in MySQL
  DECLARE v_processed INT DEFAULT 0;

  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_to_date < p_from_date THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start'; END IF;

  SET v_len = JSON_LENGTH(p_employee_ids);

  emp_loop: WHILE v_idx < v_len DO
    SET v_emp_id = JSON_EXTRACT(p_employee_ids, CONCAT('$[',v_idx,']'));

    -- Get employee calendar
    SELECT calendar_id INTO v_cal_id FROM employees WHERE id=v_emp_id;

    SET v_cur_date = p_from_date;
    date_loop: WHILE v_cur_date <= p_to_date DO

      -- Skip locked records (unless overwrite_manual is implied by HR unlock)
      IF EXISTS (SELECT 1 FROM attendance_daily WHERE employee_id=v_emp_id AND attendance_date=v_cur_date AND is_locked=1) THEN
        SET v_cur_date = DATE_ADD(v_cur_date, INTERVAL 1 DAY);
        ITERATE date_loop;
      END IF;

      -- Skip manual records if flag not set
      IF p_overwrite_manual=0 AND EXISTS (SELECT 1 FROM attendance_daily WHERE employee_id=v_emp_id AND attendance_date=v_cur_date AND is_manual=1) THEN
        SET v_cur_date = DATE_ADD(v_cur_date, INTERVAL 1 DAY);
        ITERATE date_loop;
      END IF;

      -- Get effective shift for this date
      SELECT shift_id INTO v_shift_id
      FROM employee_shift_assignments
      WHERE employee_id=v_emp_id
        AND effective_from <= v_cur_date
        AND (effective_to IS NULL OR effective_to >= v_cur_date)
      ORDER BY effective_from DESC LIMIT 1;

      -- Determine day status
      SET v_dow = DAYOFWEEK(v_cur_date);

      IF fn_calendar_has_holiday(v_cal_id, v_cur_date) THEN
        SET v_day_status = 'Holiday';
      ELSEIF v_dow IN (1,7) THEN  -- Sunday or Saturday
        SET v_day_status = 'WeekOff';
      ELSEIF EXISTS (
        SELECT 1 FROM leave_applications
        WHERE employee_id=v_emp_id AND status='Approved'
          AND v_cur_date BETWEEN start_date AND end_date
      ) THEN
        SET v_day_status = 'Leave';
      ELSE
        -- Check if check-in record exists
        IF EXISTS (SELECT 1 FROM attendance_daily WHERE employee_id=v_emp_id AND attendance_date=v_cur_date AND check_in IS NOT NULL) THEN
          SET v_day_status = 'Present';
        ELSE
          SET v_day_status = 'Absent';
        END IF;
      END IF;

      -- Upsert attendance record
      INSERT INTO attendance_daily (employee_id, attendance_date, shift_id, day_status, is_manual)
      VALUES (v_emp_id, v_cur_date, v_shift_id, v_day_status, 0)
      ON DUPLICATE KEY UPDATE
        shift_id=v_shift_id, day_status=v_day_status, is_manual=0;

      SET v_processed = v_processed+1;
      SET v_cur_date = DATE_ADD(v_cur_date, INTERVAL 1 DAY);
    END WHILE date_loop;

    SET v_idx = v_idx+1;
  END WHILE emp_loop;

  SELECT v_processed AS records_processed;
END$$

-- ── ATTENDANCE MANUAL UPDATE ──────────────────────────────────
DROP PROCEDURE IF EXISTS sp_attendance_manual_update$$
CREATE PROCEDURE sp_attendance_manual_update(
  IN p_caller_role    VARCHAR(30),
  IN p_caller_uid     INT UNSIGNED,
  IN p_employee_id    INT UNSIGNED,
  IN p_att_date       DATE,
  IN p_day_status     VARCHAR(30),
  IN p_check_in       DATETIME,
  IN p_check_out      DATETIME,
  IN p_remarks        VARCHAR(500)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF EXISTS (SELECT 1 FROM attendance_daily WHERE employee_id=p_employee_id AND attendance_date=p_att_date AND is_locked=1) THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:period_locked';
  END IF;
  INSERT INTO attendance_daily (employee_id,attendance_date,day_status,check_in,check_out,remarks,is_manual)
  VALUES (p_employee_id,p_att_date,p_day_status,p_check_in,p_check_out,p_remarks,1)
  ON DUPLICATE KEY UPDATE
    day_status=p_day_status,check_in=p_check_in,check_out=p_check_out,remarks=p_remarks,is_manual=1;
  CALL sp_audit_log(p_caller_uid,p_caller_role,'sp_attendance_manual_update',CAST(p_employee_id AS CHAR),'UPDATE',NULL,JSON_OBJECT('date',p_att_date,'status',p_day_status));
  SELECT ROW_COUNT() AS affected;
END$$

-- ── ATTENDANCE LOCK PERIOD ────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_attendance_lock_period$$
CREATE PROCEDURE sp_attendance_lock_period(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_from_date    DATE,
  IN p_to_date      DATE
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE attendance_daily SET is_locked=1
  WHERE attendance_date BETWEEN p_from_date AND p_to_date;
  CALL sp_audit_log(p_caller_uid,p_caller_role,'sp_attendance_lock_period',NULL,'LOCK',NULL,JSON_OBJECT('from',p_from_date,'to',p_to_date));
  SELECT ROW_COUNT() AS locked;
END$$

-- ── ATTENDANCE GET SELF ───────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_attendance_get_self$$
CREATE PROCEDURE sp_attendance_get_self(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_from_date          DATE,
  IN p_to_date            DATE
)
BEGIN
  SELECT ad.attendance_date, ad.day_status, ad.check_in, ad.check_out,
         ad.effective_hours, ad.late_mins, ad.early_exit_mins, ad.ot_hours,
         s.name AS shift_name, s.start_time, s.end_time
  FROM attendance_daily ad
  LEFT JOIN shifts s ON s.id=ad.shift_id
  WHERE ad.employee_id=p_caller_employee_id
    AND ad.attendance_date BETWEEN p_from_date AND p_to_date
  ORDER BY ad.attendance_date DESC;
END$$

-- ── CORRECTION REQUEST ────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_attendance_request_correction$$
CREATE PROCEDURE sp_attendance_request_correction(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_caller_uid         INT UNSIGNED,
  IN p_att_date           DATE,
  IN p_requested_in       DATETIME,
  IN p_requested_out      DATETIME,
  IN p_reason             VARCHAR(1000)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role NOT IN ('HR','Employee') THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED'; END IF;
  INSERT INTO attendance_correction_requests (employee_id,attendance_date,requested_check_in,requested_check_out,reason)
  VALUES (p_caller_employee_id,p_att_date,p_requested_in,p_requested_out,p_reason);
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id;
END$$

-- ── CORRECTION REQUESTS LIST (HR) ─────────────────────────────
DROP PROCEDURE IF EXISTS sp_correction_requests_list$$
CREATE PROCEDURE sp_correction_requests_list(
  IN p_caller_role VARCHAR(30),
  IN p_status      VARCHAR(20)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT acr.id, acr.employee_id, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         acr.attendance_date, acr.requested_check_in, acr.requested_check_out,
         acr.reason, acr.status, acr.created_at
  FROM attendance_correction_requests acr
  JOIN employees e ON e.id=acr.employee_id
  WHERE (p_status IS NULL OR acr.status=p_status)
  ORDER BY acr.created_at DESC;
END$$

-- ── CORRECTION APPROVE / REJECT ───────────────────────────────
DROP PROCEDURE IF EXISTS sp_correction_approve$$
CREATE PROCEDURE sp_correction_approve(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_request_id  INT UNSIGNED,
  IN p_remarks     VARCHAR(500)
)
BEGIN
  DECLARE v_emp_id INT UNSIGNED;
  DECLARE v_att_date DATE;
  DECLARE v_in DATETIME;
  DECLARE v_out DATETIME;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT employee_id,attendance_date,requested_check_in,requested_check_out
  INTO v_emp_id,v_att_date,v_in,v_out
  FROM attendance_correction_requests WHERE id=p_request_id AND status='Pending';
  IF v_emp_id IS NULL THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:correction_request'; END IF;
  UPDATE attendance_correction_requests
    SET status='Approved',reviewed_by=p_caller_uid,reviewed_at=NOW(),reviewer_remarks=p_remarks
  WHERE id=p_request_id;
  -- Apply correction to daily attendance
  INSERT INTO attendance_daily (employee_id,attendance_date,check_in,check_out,is_manual)
  VALUES (v_emp_id,v_att_date,v_in,v_out,1)
  ON DUPLICATE KEY UPDATE check_in=v_in,check_out=v_out,is_manual=1;
  SELECT ROW_COUNT() AS affected;
END$$

DELIMITER ;
