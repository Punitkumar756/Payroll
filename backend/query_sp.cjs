const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms'
  });
  const [rows] = await connection.query('CALL sp_leave_get_applications_hr("HR", NULL, NULL, NULL)');
  console.log(rows[0]);
  process.exit(0);
}
run();
