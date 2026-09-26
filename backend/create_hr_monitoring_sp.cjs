const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({ 
    host: 'localhost', 
    user: 'root', 
    password: 'Punit@12', 
    database: 'hrms', 
    multipleStatements: true 
  });
  
  await pool.query('DROP PROCEDURE IF EXISTS sp_dashboard_hr_monitoring;');
  await pool.query(`
    CREATE PROCEDURE sp_dashboard_hr_monitoring(IN p_caller_role VARCHAR(30), IN p_date DATE)
    BEGIN
      IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
      
      SELECT 
        e.id AS employee_id, 
        e.employee_code, 
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name, 
        d.name AS department_name, 
        COALESCE(ad.day_status, 'Not Processed') AS day_status, 
        ad.check_in, 
        ad.check_out,
        s.start_time AS shift_start_time,
        s.end_time AS shift_end_time,
        (
          SELECT SUM(lb.closing_balance)
          FROM leave_balances lb
          WHERE lb.employee_id = e.id AND lb.year = YEAR(p_date)
        ) AS total_leave_balance,
        (
          SELECT SUM(lb.used)
          FROM leave_balances lb
          WHERE lb.employee_id = e.id AND lb.year = YEAR(p_date)
        ) AS total_leave_used
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      LEFT JOIN attendance_daily ad ON e.id = ad.employee_id AND ad.attendance_date = p_date 
      LEFT JOIN shifts s ON s.id = ad.shift_id 
      WHERE e.status = 'Active' 
      ORDER BY d.name, e.first_name;
    END;
  `);
  console.log('SP sp_dashboard_hr_monitoring created');
  pool.end();
}
run();
