const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms'
  });
  const [rows] = await connection.query("SHOW CREATE PROCEDURE sp_leave_get_applications_hr");
  console.log(rows[0]['Create Procedure']);
  process.exit(0);
}
run();
