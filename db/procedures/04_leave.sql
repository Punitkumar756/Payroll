-- =============================================================
--  Stored Procedures: Leave Management Module
-- =============================================================
DELIMITER $$

-- ── LEAVE TYPES ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_type_list$$
CREATE PROCEDURE sp_leave_type_list(IN p_caller_role VARCHAR(30))
BEGIN
  SELECT id,code,name,is_paid,allow_carry_forward,max_carry_forward,allow_negative,requires_document,is_active
  FROM leave_types ORDER BY name;
END$$

DROP PROCEDURE IF EXISTS sp_leave_type_create$$
CREATE PROCEDURE sp_leave_type_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_is_paid TINYINT(1), IN p_allow_carry TINYINT(1),
  IN p_max_carry INT UNSIGNED, IN p_allow_neg TINYINT(1), IN p_req_doc TINYINT(1)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO leave_types (code,name,is_paid,allow_carry_forward,max_carry_forward,allow_negative,requires_document)
  VALUES (TRIM(p_code),TRIM(p_name),p_is_paid,p_allow_carry,p_max_carry,p_allow_neg,p_req_doc);
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_leave_type_update$$
CREATE PROCEDURE sp_leave_type_update(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_is_paid TINYINT(1), IN p_allow_carry TINYINT(1),
  IN p_max_carry INT UNSIGNED, IN p_allow_neg TINYINT(1), IN p_req_doc TINYINT(1), IN p_is_active TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE leave_types SET code=TRIM(p_code),name=TRIM(p_name),is_paid=p_is_paid,
    allow_carry_forward=p_allow_carry,max_carry_forward=p_max_carry,
    allow_negative=p_allow_neg,requires_document=p_req_doc,is_active=p_is_active
  WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── LEAVE POLICIES ────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_policy_list$$
CREATE PROCEDURE sp_leave_policy_list(IN p_caller_role VARCHAR(30))
BEGIN
  SELECT lp.id,lp.code,lp.name,lp.accrual_frequency,lp.is_active,
         COUNT(lpt.id) AS type_count
  FROM leave_policies lp
  LEFT JOIN leave_policy_types lpt ON lpt.policy_id=lp.id
  GROUP BY lp.id ORDER BY lp.name;
END$$

DROP PROCEDURE IF EXISTS sp_leave_policy_create$$
CREATE PROCEDURE sp_leave_policy_create(
  IN p_caller_role   VARCHAR(30),
  IN p_caller_uid    INT UNSIGNED,
  IN p_code          VARCHAR(20),
  IN p_name          VARCHAR(100),
  IN p_accrual_freq  VARCHAR(20),
  IN p_types_json    JSON
)
BEGIN
  -- p_types_json: [{"leave_type_id":1,"annual_entitlement":12,"accrual_per_period":1}, ...]
  DECLARE v_id  INT UNSIGNED;
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_len INT;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  START TRANSACTION;
    INSERT INTO leave_policies (code,name,accrual_frequency)
    VALUES (TRIM(p_code),TRIM(p_name),p_accrual_freq);
    SET v_id=LAST_INSERT_ID();
    IF p_types_json IS NOT NULL THEN
      SET v_len=JSON_LENGTH(p_types_json);
      WHILE v_idx < v_len DO
        INSERT INTO leave_policy_types (policy_id,leave_type_id,annual_entitlement,accrual_per_period)
        VALUES (
          v_id,
          JSON_UNQUOTE(JSON_EXTRACT(p_types_json,CONCAT('$[',v_idx,'].leave_type_id'))),
          JSON_UNQUOTE(JSON_EXTRACT(p_types_json,CONCAT('$[',v_idx,'].annual_entitlement'))),
          JSON_UNQUOTE(JSON_EXTRACT(p_types_json,CONCAT('$[',v_idx,'].accrual_per_period')))
        );
        SET v_idx=v_idx+1;
      END WHILE;
    END IF;
  COMMIT;
  SELECT v_id AS id;
END$$

-- ── ASSIGN POLICY TO EMPLOYEE ─────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_policy_assign$$
CREATE PROCEDURE sp_leave_policy_assign(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_employee_id INT UNSIGNED, IN p_policy_id INT UNSIGNED, IN p_effective_from DATE
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO employee_leave_policy (employee_id,policy_id,effective_from)
  VALUES (p_employee_id,p_policy_id,p_effective_from)
  ON DUPLICATE KEY UPDATE policy_id=p_policy_id,effective_from=p_effective_from;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── LEAVE ACCRUAL RUN ─────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_accrual_run$$
CREATE PROCEDURE sp_leave_accrual_run(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_year        YEAR,
  IN p_period      INT  -- e.g. month number for monthly accrual
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  -- Credit accrual for all active employees with a policy
  INSERT INTO leave_balances (employee_id,leave_type_id,year,opening_balance,accrued)
  SELECT elp.employee_id, lpt.leave_type_id, p_year,
         IFNULL((SELECT closing_balance FROM leave_balances lb2
                 WHERE lb2.employee_id=elp.employee_id AND lb2.leave_type_id=lpt.leave_type_id
                   AND lb2.year=p_year-1),0),
         lpt.accrual_per_period
  FROM employee_leave_policy elp
  JOIN leave_policy_types lpt ON lpt.policy_id=elp.policy_id
  JOIN leave_policies lp ON lp.id=lpt.policy_id
  JOIN employees e ON e.id=elp.employee_id AND e.status='Active'
  WHERE lp.accrual_frequency='Monthly'
  ON DUPLICATE KEY UPDATE accrued=accrued+lpt.accrual_per_period;
  SELECT ROW_COUNT() AS credited;
END$$

-- ── LEAVE APPLY ───────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_apply$$
CREATE PROCEDURE sp_leave_apply(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_caller_uid         INT UNSIGNED,
  IN p_target_employee_id INT UNSIGNED,
  IN p_leave_type_id      INT UNSIGNED,
  IN p_start_date         DATE,
  IN p_end_date           DATE,
  IN p_reason             VARCHAR(1000)
)
BEGIN
  DECLARE v_id           INT UNSIGNED;
  DECLARE v_total_days   DECIMAL(5,2);
  DECLARE v_balance      DECIMAL(6,2) DEFAULT 0;
  DECLARE v_allow_neg    TINYINT(1);
  DECLARE v_emp_id       INT UNSIGNED;

  -- Employees and Managers can only apply for themselves
  IF p_caller_role IN ('Employee', 'Manager') THEN
    SET v_emp_id=p_caller_employee_id;
  ELSEIF p_caller_role='HR' THEN
    SET v_emp_id=p_target_employee_id;
  ELSE
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED';
  END IF;

  IF p_end_date < p_start_date THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start';
  END IF;

  -- Check overlap
  IF EXISTS (
    SELECT 1 FROM leave_applications
    WHERE employee_id=v_emp_id AND status IN ('Pending','Approved')
      AND NOT (end_date < p_start_date OR start_date > p_end_date)
  ) THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:overlapping_leave';
  END IF;

  -- Calculate working days (simplified: calendar days minus weekends)
  SET v_total_days = DATEDIFF(p_end_date,p_start_date)+1
    - (FLOOR((DATEDIFF(p_end_date,p_start_date)+1)/7)*2)
    - IF(DAYOFWEEK(p_start_date)=1,1,0)
    - IF(DAYOFWEEK(p_end_date)=7,1,0);
  SET v_total_days = GREATEST(v_total_days,1);

  -- Check balance
  SELECT IFNULL(lb.closing_balance,0), lt.allow_negative
  INTO v_balance, v_allow_neg
  FROM leave_types lt
  LEFT JOIN leave_balances lb ON lb.leave_type_id=lt.id
    AND lb.employee_id=v_emp_id AND lb.year=YEAR(p_start_date)
  WHERE lt.id=p_leave_type_id;

  IF v_allow_neg=0 AND v_balance < v_total_days THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:insufficient_balance';
  END IF;

  INSERT INTO leave_applications (employee_id,leave_type_id,start_date,end_date,total_days,reason,applied_by)
  VALUES (v_emp_id,p_leave_type_id,p_start_date,p_end_date,v_total_days,p_reason,p_caller_uid);
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id, v_total_days AS total_days;
END$$

-- ── LEAVE APPROVE ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_approve$$
CREATE PROCEDURE sp_leave_approve(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_app_id      INT UNSIGNED,
  IN p_remarks     VARCHAR(500)
)
BEGIN
  DECLARE v_emp_id       INT UNSIGNED;
  DECLARE v_type_id      INT UNSIGNED;
  DECLARE v_total_days   DECIMAL(5,2);
  DECLARE v_year         YEAR;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT employee_id,leave_type_id,total_days,YEAR(start_date)
  INTO v_emp_id,v_type_id,v_total_days,v_year
  FROM leave_applications WHERE id=p_app_id AND status='Pending';
  IF v_emp_id IS NULL THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:leave_application'; END IF;
  UPDATE leave_applications
    SET status='Approved',approved_by=p_caller_uid,approved_at=NOW(),approver_remarks=p_remarks
  WHERE id=p_app_id;
  -- Deduct balance
  INSERT INTO leave_balances (employee_id,leave_type_id,year,used)
  VALUES (v_emp_id,v_type_id,v_year,v_total_days)
  ON DUPLICATE KEY UPDATE used=used+v_total_days;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── LEAVE REJECT ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_reject$$
CREATE PROCEDURE sp_leave_reject(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_app_id INT UNSIGNED, IN p_remarks VARCHAR(500)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE leave_applications
    SET status='Rejected',approved_by=p_caller_uid,approved_at=NOW(),approver_remarks=p_remarks
  WHERE id=p_app_id AND status='Pending';
  SELECT ROW_COUNT() AS affected;
END$$

-- ── LEAVE CANCEL (Employee) ───────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_cancel$$
CREATE PROCEDURE sp_leave_cancel(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_app_id             INT UNSIGNED
)
BEGIN
  DECLARE v_emp_id INT UNSIGNED;
  SELECT employee_id INTO v_emp_id FROM leave_applications WHERE id=p_app_id;
  IF p_caller_role IN ('Employee', 'Manager') AND v_emp_id != p_caller_employee_id THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
  END IF;
  UPDATE leave_applications SET status='Cancelled'
  WHERE id=p_app_id AND status='Pending' AND employee_id=v_emp_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── LEAVE BALANCE SELF ────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_get_balance_self$$
CREATE PROCEDURE sp_leave_get_balance_self(
  IN p_caller_employee_id INT UNSIGNED,
  IN p_year               YEAR
)
BEGIN
  SELECT lt.id AS leave_type_id, lt.code, lt.name, lt.is_paid,
         IFNULL(lb.opening_balance,0) AS opening_balance,
         IFNULL(lb.accrued,0) AS accrued,
         IFNULL(lb.used,0) AS used,
         IFNULL(lb.closing_balance,0) AS available_balance
  FROM leave_types lt
  LEFT JOIN leave_balances lb ON lb.leave_type_id=lt.id
    AND lb.employee_id=p_caller_employee_id AND lb.year=p_year
  WHERE lt.is_active=1
  ORDER BY lt.name;
END$$

-- ── LEAVE APPLICATIONS LIST (self) ───────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_get_applications_self$$
CREATE PROCEDURE sp_leave_get_applications_self(
  IN p_caller_employee_id INT UNSIGNED,
  IN p_status             VARCHAR(20)
)
BEGIN
  SELECT la.id,lt.name AS leave_type,la.start_date,la.end_date,la.total_days,
         la.reason,la.status,la.approver_remarks,la.created_at
  FROM leave_applications la
  JOIN leave_types lt ON lt.id=la.leave_type_id
  WHERE la.employee_id=p_caller_employee_id
    AND (p_status IS NULL OR la.status=p_status)
  ORDER BY la.created_at DESC;
END$$

-- ── LEAVE APPLICATIONS LIST (HR all) ─────────────────────────
DROP PROCEDURE IF EXISTS sp_leave_get_applications_hr$$
CREATE PROCEDURE sp_leave_get_applications_hr(
  IN p_caller_role VARCHAR(30),
  IN p_status      VARCHAR(20),
  IN p_from_date   DATE,
  IN p_to_date     DATE
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT la.id, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         e.employee_code, lt.name AS leave_type,
         la.start_date, la.end_date, la.total_days, la.reason, la.status, la.created_at,
         -- current balance
         IFNULL(lb.closing_balance,0) AS current_balance
  FROM leave_applications la
  JOIN employees e ON e.id=la.employee_id
  JOIN leave_types lt ON lt.id=la.leave_type_id
  LEFT JOIN leave_balances lb ON lb.employee_id=la.employee_id
    AND lb.leave_type_id=la.leave_type_id AND lb.year=YEAR(la.start_date)
  WHERE (p_status IS NULL OR la.status=p_status)
    AND (p_from_date IS NULL OR la.start_date >= p_from_date)
    AND (p_to_date IS NULL OR la.end_date <= p_to_date)
  ORDER BY la.created_at DESC;
END$$

DELIMITER ;
