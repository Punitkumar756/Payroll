const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true });
  await pool.query('DROP PROCEDURE IF EXISTS sp_attendance_daily_list;');
  await pool.query(`
    CREATE PROCEDURE sp_attendance_daily_list(IN p_caller_role VARCHAR(30), IN p_date DATE)
    BEGIN
      IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
      SELECT e.id AS employee_id, e.employee_code, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, d.name AS department_name, ds.name AS designation_name, 
      COALESCE(s.name, (
        SELECT s2.name
        FROM employee_shift_assignments esa
        JOIN shifts s2 ON esa.shift_id = s2.id
        WHERE esa.employee_id = e.id 
          AND esa.effective_from <= p_date
          AND (esa.effective_to IS NULL OR esa.effective_to >= p_date)
        ORDER BY esa.effective_from DESC LIMIT 1
      )) AS shift_name, 
      COALESCE(ad.day_status, 'Not Processed') AS day_status, ad.check_in, ad.check_out, ad.is_manual FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN designations ds ON e.designation_id = ds.id LEFT JOIN attendance_daily ad ON e.id = ad.employee_id AND ad.attendance_date = p_date LEFT JOIN shifts s ON s.id = ad.shift_id WHERE e.status = 'Active' ORDER BY d.name, e.first_name;
    END;
  `);
  console.log('SP applied');
  pool.end();
}
run();
