import mysql from 'mysql2/promise';
async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true });
  const sql = `
    DROP PROCEDURE IF EXISTS sp_dashboard_hr_metrics;
    CREATE PROCEDURE sp_dashboard_hr_metrics(
      IN p_caller_role VARCHAR(30)
    )
    BEGIN
      IF p_caller_role != 'HR' THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
      END IF;
      
      SELECT 
        (SELECT COUNT(*) FROM employees) AS total_employees,
        (SELECT COUNT(*) FROM employees WHERE status = 'Active') AS active_employees,
        (SELECT COUNT(*) FROM departments) AS total_departments,
        (SELECT COUNT(*) FROM leave_applications WHERE status = 'Pending') AS pending_leaves,
        (SELECT COUNT(*) FROM attendance_correction_requests WHERE status = 'Pending') AS pending_corrections,
        (SELECT COALESCE(SUM(net_pay), 0) FROM payslips WHERE status != 'Draft') AS total_payroll_expense;
    END;

    DROP PROCEDURE IF EXISTS sp_dashboard_hr_charts;
    CREATE PROCEDURE sp_dashboard_hr_charts(
      IN p_caller_role VARCHAR(30)
    )
    BEGIN
      IF p_caller_role != 'HR' THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
      END IF;

      SELECT d.name AS name, COUNT(e.id) AS value
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      GROUP BY d.id;
    END;
  `;
  await pool.query(sql);
  console.log('SPs created');
  pool.end();
}
run();
