const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true
  });
  
  const sql = `
DROP PROCEDURE IF EXISTS sp_leave_get_applications_hr;
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
         la.start_date, la.end_date, la.total_days, la.reason, la.approver_remarks, la.status, la.created_at,
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
END;
  `;
  await connection.query(sql);
  console.log('Done creating sp');
  process.exit(0);
}
run();
