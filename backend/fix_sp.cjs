const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms',
    multipleStatements: true
  });
  
  try {
    await connection.query(`
      DROP PROCEDURE IF EXISTS sp_attendance_get_self;
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
          AND (p_from_date IS NULL OR ad.attendance_date >= p_from_date)
          AND (p_to_date IS NULL OR ad.attendance_date <= p_to_date)
        ORDER BY ad.attendance_date DESC;
      END
    `);
    console.log("SP updated!");
  } catch (err) {
    console.error(err);
  }
  
  await connection.end();
}

main().catch(console.error);
