import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db/pool.js';

async function run() {
  const sql = `
CREATE PROCEDURE sp_employee_delete_patched(
  IN p_caller_role     VARCHAR(30),
  IN p_caller_uid      INT UNSIGNED,
  IN p_employee_id     INT UNSIGNED
)
BEGIN
  DECLARE v_employee_code VARCHAR(100);

  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;

  SELECT employee_code INTO v_employee_code FROM employees WHERE id = p_employee_id;
  
  IF v_employee_code IS NULL THEN
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
  
  -- 4. Payroll (using employee_code instead of employee_id)
  DELETE FROM payslip_lines WHERE payslip_id IN (SELECT id FROM payslips WHERE code = v_employee_code);
  DELETE FROM payslips WHERE code = v_employee_code;
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
END
  `;

  try {
    await pool.query("DROP PROCEDURE IF EXISTS sp_employee_delete");
    await pool.query(sql.replace('sp_employee_delete_patched', 'sp_employee_delete'));
    console.log("Patched sp_employee_delete successfully!");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
run();
