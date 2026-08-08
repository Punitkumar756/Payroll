-- =============================================================
--  Stored Procedures: Payroll Module
-- =============================================================
DELIMITER $$

-- ── SALARY HEADS ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_salary_head_list$$
CREATE PROCEDURE sp_salary_head_list(IN p_caller_role VARCHAR(30))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT id,code,name,head_type,calculation_type,calculation_basis,is_taxable,is_active,sort_order
  FROM salary_heads ORDER BY sort_order,name;
END$$

DROP PROCEDURE IF EXISTS sp_salary_head_create$$
CREATE PROCEDURE sp_salary_head_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_head_type VARCHAR(20), IN p_calc_type VARCHAR(20),
  IN p_calc_basis VARCHAR(100), IN p_is_taxable TINYINT(1),
  IN p_sort_order INT UNSIGNED
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO salary_heads (code,name,head_type,calculation_type,calculation_basis,is_taxable,sort_order)
  VALUES (TRIM(p_code),TRIM(p_name),p_head_type,p_calc_type,p_calc_basis,p_is_taxable,p_sort_order);
  SET v_id=LAST_INSERT_ID();
  SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_salary_head_update$$
CREATE PROCEDURE sp_salary_head_update(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_head_type VARCHAR(20), IN p_calc_type VARCHAR(20),
  IN p_calc_basis VARCHAR(100), IN p_is_taxable TINYINT(1),
  IN p_sort_order INT UNSIGNED, IN p_is_active TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE salary_heads SET code=TRIM(p_code),name=TRIM(p_name),head_type=p_head_type,
    calculation_type=p_calc_type,calculation_basis=p_calc_basis,
    is_taxable=p_is_taxable,sort_order=p_sort_order,is_active=p_is_active
  WHERE id=p_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── CTC TEMPLATES ─────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_ctc_template_list$$
CREATE PROCEDURE sp_ctc_template_list(IN p_caller_role VARCHAR(30))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT ct.id,ct.code,ct.name,ct.is_active,
         COUNT(cth.id) AS head_count
  FROM ctc_templates ct
  LEFT JOIN ctc_template_heads cth ON cth.template_id=ct.id
  GROUP BY ct.id ORDER BY ct.name;
END$$

DROP PROCEDURE IF EXISTS sp_ctc_template_create$$
CREATE PROCEDURE sp_ctc_template_create(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(100),
  IN p_heads_json JSON
)
BEGIN
  -- p_heads_json: [{"salary_head_id":1,"value_type":"Percentage","value":40}, ...]
  DECLARE v_id  INT UNSIGNED;
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_len INT;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  START TRANSACTION;
    INSERT INTO ctc_templates (code,name) VALUES (TRIM(p_code),TRIM(p_name));
    SET v_id=LAST_INSERT_ID();
    IF p_heads_json IS NOT NULL THEN
      SET v_len=JSON_LENGTH(p_heads_json);
      WHILE v_idx < v_len DO
        INSERT INTO ctc_template_heads (template_id,salary_head_id,value_type,value)
        VALUES (
          v_id,
          JSON_UNQUOTE(JSON_EXTRACT(p_heads_json,CONCAT('$[',v_idx,'].salary_head_id'))),
          JSON_UNQUOTE(JSON_EXTRACT(p_heads_json,CONCAT('$[',v_idx,'].value_type'))),
          JSON_UNQUOTE(JSON_EXTRACT(p_heads_json,CONCAT('$[',v_idx,'].value')))
        );
        SET v_idx=v_idx+1;
      END WHILE;
    END IF;
  COMMIT;
  SELECT v_id AS id;
END$$

-- ── ASSIGN CTC TO EMPLOYEE ────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_employee_ctc_assign$$
CREATE PROCEDURE sp_employee_ctc_assign(
  IN p_caller_role   VARCHAR(30),
  IN p_caller_uid    INT UNSIGNED,
  IN p_employee_id   INT UNSIGNED,
  IN p_template_id   INT UNSIGNED,
  IN p_ctc_annual    DECIMAL(14,2),
  IN p_effective_from DATE
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  -- Close previous record
  UPDATE employee_ctc SET effective_to=DATE_SUB(p_effective_from,INTERVAL 1 DAY)
  WHERE employee_id=p_employee_id AND effective_to IS NULL;
  INSERT INTO employee_ctc (employee_id,template_id,ctc_annual,effective_from)
  VALUES (p_employee_id,p_template_id,p_ctc_annual,p_effective_from);
  SELECT LAST_INSERT_ID() AS id;
END$$

-- ── PAYROLL PROCESS RUN ───────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_payroll_process_run$$
CREATE PROCEDURE sp_payroll_process_run(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_year        YEAR,
  IN p_month       TINYINT UNSIGNED
)
BEGIN
  DECLARE done          INT DEFAULT FALSE;
  DECLARE v_emp_id      INT UNSIGNED;
  DECLARE v_tmpl_id     INT UNSIGNED;
  DECLARE v_ctc_annual  DECIMAL(14,2);
  DECLARE v_ctc_monthly DECIMAL(14,2);
  DECLARE v_payslip_id  INT UNSIGNED;
  DECLARE v_working_days INT UNSIGNED;
  DECLARE v_paid_days   DECIMAL(5,2);
  DECLARE v_absent_days DECIMAL(5,2);
  DECLARE v_gross       DECIMAL(14,2);
  DECLARE v_deductions  DECIMAL(14,2);
  DECLARE v_net         DECIMAL(14,2);
  DECLARE v_lop         DECIMAL(5,2);

  DECLARE emp_cur CURSOR FOR
    SELECT ec.employee_id, ec.template_id, ec.ctc_annual
    FROM employee_ctc ec
    JOIN employees e ON e.id=ec.employee_id AND e.status='Active'
    WHERE ec.effective_from <= LAST_DAY(CONCAT(p_year,'-',p_month,'-01'))
      AND (ec.effective_to IS NULL OR ec.effective_to >= CONCAT(p_year,'-',p_month,'-01'));

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=TRUE;

  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_month < 1 OR p_month > 12 THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:invalid_month'; END IF;

  OPEN emp_cur;

  read_loop: LOOP
    FETCH emp_cur INTO v_emp_id, v_tmpl_id, v_ctc_annual;
    IF done THEN LEAVE read_loop; END IF;

    -- Working days in month
    SET v_working_days = DAY(LAST_DAY(CONCAT(p_year,'-',p_month,'-01')));

    -- Count paid days from attendance
    SELECT COUNT(*) INTO v_paid_days
    FROM attendance_daily
    WHERE employee_id=v_emp_id
      AND YEAR(attendance_date)=p_year AND MONTH(attendance_date)=p_month
      AND day_status IN ('Present','HalfDay','Holiday','Leave','PaidLeave');

    -- LOP = absent days
    SELECT COUNT(*) INTO v_absent_days
    FROM attendance_daily
    WHERE employee_id=v_emp_id
      AND YEAR(attendance_date)=p_year AND MONTH(attendance_date)=p_month
      AND day_status='Absent';

    SET v_lop = v_absent_days;

    -- Monthly CTC
    SET v_ctc_monthly = ROUND(v_ctc_annual / 12, 2);

    -- Compute per-head amounts from CTC template
    SET v_gross = 0; SET v_deductions = 0;

    -- Create/update draft payslip
    INSERT INTO payslips (employee_id,pay_period_year,pay_period_month,gross_earnings,total_deductions,net_pay,working_days,paid_days,lop_days,status)
    VALUES (v_emp_id,p_year,p_month,0,0,0,v_working_days,v_paid_days,v_lop,'Draft')
    ON DUPLICATE KEY UPDATE working_days=v_working_days,paid_days=v_paid_days,lop_days=v_lop,status='Draft';

    SELECT id INTO v_payslip_id FROM payslips WHERE employee_id=v_emp_id AND pay_period_year=p_year AND pay_period_month=p_month;

    -- Delete existing draft lines
    DELETE FROM payslip_lines WHERE payslip_id=v_payslip_id;

    -- Insert lines from CTC template heads
    INSERT INTO payslip_lines (payslip_id,salary_head_id,head_type,amount)
    SELECT v_payslip_id, sh.id, sh.head_type,
      CASE cth.value_type
        WHEN 'Fixed'      THEN ROUND(cth.value * (v_paid_days/v_working_days), 2)
        WHEN 'Percentage' THEN ROUND((cth.value/100) * (v_ctc_monthly) * (v_paid_days/v_working_days), 2)
        ELSE 0
      END AS amount
    FROM ctc_template_heads cth
    JOIN salary_heads sh ON sh.id=cth.salary_head_id AND sh.is_active=1
    WHERE cth.template_id=v_tmpl_id;

    -- Add advances/deductions for this period
    INSERT INTO payslip_lines (payslip_id,salary_head_id,head_type,amount)
    SELECT v_payslip_id, 0, 'Deduction', amount
    FROM advances_deductions
    WHERE employee_id=v_emp_id AND deduct_in_year=p_year AND deduct_in_month=p_month AND is_processed=0;

    -- Mark advances processed
    UPDATE advances_deductions SET is_processed=1
    WHERE employee_id=v_emp_id AND deduct_in_year=p_year AND deduct_in_month=p_month AND is_processed=0;

    -- Add loan EMIs due this period
    INSERT INTO payslip_lines (payslip_id,salary_head_id,head_type,amount)
    SELECT v_payslip_id, 0, 'Deduction', lr.amount
    FROM loan_repayments lr
    JOIN loans l ON l.id=lr.loan_id AND l.employee_id=v_emp_id AND l.status='Approved'
    WHERE lr.due_year=p_year AND lr.due_month=p_month AND lr.is_paid=0;

    -- Mark loan installments paid
    UPDATE loan_repayments lr
    JOIN loans l ON l.id=lr.loan_id AND l.employee_id=v_emp_id
    SET lr.is_paid=1, lr.payslip_id=v_payslip_id
    WHERE lr.due_year=p_year AND lr.due_month=p_month AND lr.is_paid=0;

    -- Recalculate totals
    SELECT
      SUM(CASE WHEN head_type='Earning' THEN amount ELSE 0 END),
      SUM(CASE WHEN head_type IN ('Deduction','Statutory') THEN amount ELSE 0 END)
    INTO v_gross, v_deductions
    FROM payslip_lines WHERE payslip_id=v_payslip_id;

    SET v_net = GREATEST(IFNULL(v_gross,0) - IFNULL(v_deductions,0), 0);

    UPDATE payslips SET gross_earnings=IFNULL(v_gross,0), total_deductions=IFNULL(v_deductions,0), net_pay=v_net
    WHERE id=v_payslip_id;

  END LOOP;
  CLOSE emp_cur;
  SELECT 'Payroll run complete' AS message;
END$$

-- ── PAYSLIP EDIT (HR, Draft only) ────────────────────────────
DROP PROCEDURE IF EXISTS sp_payslip_edit$$
CREATE PROCEDURE sp_payslip_edit(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_payslip_id   INT UNSIGNED,
  IN p_line_id      INT UNSIGNED,
  IN p_new_amount   DECIMAL(14,2)
)
BEGIN
  DECLARE v_status VARCHAR(10);
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT status INTO v_status FROM payslips WHERE id=p_payslip_id;
  IF v_status != 'Draft' THEN SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:payslip_already_approved'; END IF;
  UPDATE payslip_lines SET amount=p_new_amount WHERE id=p_line_id AND payslip_id=p_payslip_id;
  -- Recalculate totals
  UPDATE payslips ps SET
    gross_earnings=(SELECT IFNULL(SUM(amount),0) FROM payslip_lines WHERE payslip_id=p_payslip_id AND head_type='Earning'),
    total_deductions=(SELECT IFNULL(SUM(amount),0) FROM payslip_lines WHERE payslip_id=p_payslip_id AND head_type IN ('Deduction','Statutory')),
    net_pay=GREATEST(
      (SELECT IFNULL(SUM(amount),0) FROM payslip_lines WHERE payslip_id=p_payslip_id AND head_type='Earning') -
      (SELECT IFNULL(SUM(amount),0) FROM payslip_lines WHERE payslip_id=p_payslip_id AND head_type IN ('Deduction','Statutory')),0)
  WHERE ps.id=p_payslip_id;
  SELECT ROW_COUNT() AS affected;
END$$

-- ── PAYSLIP APPROVE ───────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_payslip_approve$$
CREATE PROCEDURE sp_payslip_approve(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_year        YEAR,
  IN p_month       TINYINT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  UPDATE payslips SET status='Approved',approved_by=p_caller_uid,approved_at=NOW()
  WHERE pay_period_year=p_year AND pay_period_month=p_month AND status='Draft';
  SELECT ROW_COUNT() AS approved;
END$$

-- ── PAYSLIP GET SELF ──────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_payslip_get_self$$
CREATE PROCEDURE sp_payslip_get_self(
  IN p_caller_employee_id INT UNSIGNED,
  IN p_year               YEAR,
  IN p_month              TINYINT UNSIGNED
)
BEGIN
  -- List of payslips (no month filter = all)
  SELECT ps.id,ps.pay_period_year,ps.pay_period_month,
         ps.gross_earnings,ps.total_deductions,ps.net_pay,
         ps.working_days,ps.paid_days,ps.lop_days,ps.status,ps.pdf_path
  FROM payslips ps
  WHERE ps.employee_id=p_caller_employee_id
    AND ps.status='Approved'
    AND (p_year IS NULL OR ps.pay_period_year=p_year)
    AND (p_month IS NULL OR ps.pay_period_month=p_month)
  ORDER BY ps.pay_period_year DESC,ps.pay_period_month DESC;
END$$

-- ── PAYSLIP LINES (detail) ────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_payslip_get_lines$$
CREATE PROCEDURE sp_payslip_get_lines(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_payslip_id         INT UNSIGNED
)
BEGIN
  DECLARE v_ps_emp INT UNSIGNED;
  SELECT employee_id INTO v_ps_emp FROM payslips WHERE id=p_payslip_id;
  -- Employees can only see their own payslip lines
  IF p_caller_role='Employee' AND v_ps_emp!=p_caller_employee_id THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
  END IF;
  SELECT pl.id,sh.name AS head_name,pl.head_type,pl.amount
  FROM payslip_lines pl
  LEFT JOIN salary_heads sh ON sh.id=pl.salary_head_id
  WHERE pl.payslip_id=p_payslip_id
  ORDER BY pl.head_type,sh.sort_order;
END$$

-- ── PAYSLIP LIST HR ───────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_payslip_list_hr$$
CREATE PROCEDURE sp_payslip_list_hr(
  IN p_caller_role VARCHAR(30),
  IN p_year        YEAR,
  IN p_month       TINYINT UNSIGNED
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT ps.id, CONCAT(e.first_name,' ',e.last_name) AS employee_name, e.employee_code,
         ps.pay_period_year, ps.pay_period_month,
         ps.gross_earnings, ps.total_deductions, ps.net_pay,
         ps.working_days, ps.paid_days, ps.lop_days, ps.status
  FROM payslips ps
  JOIN employees e ON e.id=ps.employee_id
  WHERE ps.pay_period_year=p_year AND ps.pay_period_month=p_month
  ORDER BY e.first_name;
END$$

-- ── ADVANCES ─────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_advance_create$$
CREATE PROCEDURE sp_advance_create(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_employee_id  INT UNSIGNED,
  IN p_type         VARCHAR(20),
  IN p_amount       DECIMAL(14,2),
  IN p_month        TINYINT UNSIGNED,
  IN p_year         YEAR,
  IN p_description  VARCHAR(500)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  INSERT INTO advances_deductions (employee_id,type,amount,deduct_in_month,deduct_in_year,description,created_by)
  VALUES (p_employee_id,p_type,p_amount,p_month,p_year,p_description,p_caller_uid);
  SET v_id=LAST_INSERT_ID(); SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_advance_list$$
CREATE PROCEDURE sp_advance_list(IN p_caller_role VARCHAR(30), IN p_employee_id INT UNSIGNED)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT ad.id,CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         ad.type,ad.amount,ad.deduct_in_month,ad.deduct_in_year,ad.description,ad.is_processed
  FROM advances_deductions ad JOIN employees e ON e.id=ad.employee_id
  WHERE (p_employee_id IS NULL OR ad.employee_id=p_employee_id)
  ORDER BY ad.deduct_in_year DESC,ad.deduct_in_month DESC;
END$$

-- ── LOANS ────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_loan_request$$
CREATE PROCEDURE sp_loan_request(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_loan_amount        DECIMAL(14,2),
  IN p_tenure_months      INT UNSIGNED,
  IN p_start_month        TINYINT UNSIGNED,
  IN p_start_year         YEAR,
  IN p_reason             VARCHAR(1000)
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role NOT IN ('HR','Employee') THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED'; END IF;
  IF p_loan_amount <= 0 THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:invalid_amount'; END IF;
  INSERT INTO loans (employee_id,loan_amount,tenure_months,start_month,start_year,reason)
  VALUES (p_caller_employee_id,p_loan_amount,p_tenure_months,p_start_month,p_start_year,p_reason);
  SET v_id=LAST_INSERT_ID(); SELECT v_id AS id;
END$$

DROP PROCEDURE IF EXISTS sp_loan_approve$$
CREATE PROCEDURE sp_loan_approve(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid  INT UNSIGNED,
  IN p_loan_id     INT UNSIGNED
)
BEGIN
  DECLARE v_emp_id  INT UNSIGNED;
  DECLARE v_amount  DECIMAL(14,2);
  DECLARE v_tenure  INT UNSIGNED;
  DECLARE v_month   TINYINT UNSIGNED;
  DECLARE v_year    YEAR;
  DECLARE v_emi     DECIMAL(14,2);
  DECLARE v_i       INT DEFAULT 1;
  DECLARE v_cur_month TINYINT UNSIGNED;
  DECLARE v_cur_year  YEAR;

  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;

  SELECT employee_id,loan_amount,tenure_months,start_month,start_year
  INTO v_emp_id,v_amount,v_tenure,v_month,v_year
  FROM loans WHERE id=p_loan_id AND status='Requested';

  IF v_emp_id IS NULL THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:loan'; END IF;

  SET v_emi=ROUND(v_amount/v_tenure,2);
  UPDATE loans SET status='Approved',emi_amount=v_emi,approved_by=p_caller_uid,approved_at=NOW()
  WHERE id=p_loan_id;

  -- Generate repayment schedule
  SET v_cur_month=v_month; SET v_cur_year=v_year;
  WHILE v_i <= v_tenure DO
    INSERT INTO loan_repayments (loan_id,installment_no,due_year,due_month,amount)
    VALUES (p_loan_id,v_i,v_cur_year,v_cur_month,v_emi);
    SET v_cur_month=v_cur_month+1;
    IF v_cur_month>12 THEN SET v_cur_month=1; SET v_cur_year=v_cur_year+1; END IF;
    SET v_i=v_i+1;
  END WHILE;
  SELECT v_emi AS emi_amount, v_tenure AS installments;
END$$

DROP PROCEDURE IF EXISTS sp_loan_list_self$$
CREATE PROCEDURE sp_loan_list_self(IN p_caller_employee_id INT UNSIGNED)
BEGIN
  SELECT l.id,l.loan_amount,l.emi_amount,l.tenure_months,l.start_month,l.start_year,
         l.reason,l.status,l.approved_at,
         (SELECT COUNT(*) FROM loan_repayments WHERE loan_id=l.id AND is_paid=1) AS paid_installments,
         (SELECT COUNT(*) FROM loan_repayments WHERE loan_id=l.id AND is_paid=0) AS pending_installments
  FROM loans l
  WHERE l.employee_id=p_caller_employee_id
  ORDER BY l.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS sp_loan_repayment_schedule$$
CREATE PROCEDURE sp_loan_repayment_schedule(
  IN p_caller_role        VARCHAR(30),
  IN p_caller_employee_id INT UNSIGNED,
  IN p_loan_id            INT UNSIGNED
)
BEGIN
  DECLARE v_emp_id INT UNSIGNED;
  SELECT employee_id INTO v_emp_id FROM loans WHERE id=p_loan_id;
  IF p_caller_role='Employee' AND v_emp_id!=p_caller_employee_id THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
  END IF;
  SELECT installment_no,due_year,due_month,amount,is_paid
  FROM loan_repayments WHERE loan_id=p_loan_id ORDER BY installment_no;
END$$

DROP PROCEDURE IF EXISTS sp_loan_list_hr$$
CREATE PROCEDURE sp_loan_list_hr(IN p_caller_role VARCHAR(30), IN p_status VARCHAR(20))
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  SELECT l.id, CONCAT(e.first_name,' ',e.last_name) AS employee_name, e.employee_code,
         l.loan_amount,l.emi_amount,l.tenure_months,l.reason,l.status,l.created_at
  FROM loans l JOIN employees e ON e.id=l.employee_id
  WHERE (p_status IS NULL OR l.status=p_status)
  ORDER BY l.created_at DESC;
END$$

DELIMITER ;
