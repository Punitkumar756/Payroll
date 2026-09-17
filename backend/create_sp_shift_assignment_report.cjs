const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });

  const sql1 = `DROP PROCEDURE IF EXISTS sp_shift_assignment_report;`;
  const sql2 = `
CREATE PROCEDURE sp_shift_assignment_report(
  IN p_role VARCHAR(50),
  IN p_shift_id INT,
  IN p_employee_id INT,
  IN p_from_date DATE,
  IN p_to_date DATE
)
BEGIN
  -- We assume only HR or Admin uses this, but leaving p_role for consistency
  SELECT 
    esa.id AS assignment_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    s.name AS shift_name,
    s.start_time,
    s.end_time,
    esa.effective_from,
    esa.effective_to
  FROM employee_shift_assignments esa
  JOIN employees e ON esa.employee_id = e.id
  JOIN shifts s ON esa.shift_id = s.id
  WHERE (p_shift_id IS NULL OR esa.shift_id = p_shift_id)
    AND (p_employee_id IS NULL OR esa.employee_id = p_employee_id)
    AND (
      p_from_date IS NULL OR 
      (esa.effective_to IS NULL OR esa.effective_to >= p_from_date)
    )
    AND (
      p_to_date IS NULL OR 
      esa.effective_from <= p_to_date
    )
  ORDER BY esa.effective_from DESC, e.first_name ASC;
END;
  `;

  await connection.query(sql1);
  await connection.query(sql2);
  console.log("Stored procedure sp_shift_assignment_report created successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
