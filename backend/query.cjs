const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms'
  });
  const [rows] = await connection.query('SELECT id, status, approver_remarks FROM leave_applications ORDER BY id DESC LIMIT 5');
  console.log(rows);
  process.exit(0);
}
run();
