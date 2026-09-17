const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms'
  });
  const [rows] = await connection.query('CALL sp_master_holiday_list("HR", NULL)');
  console.log(JSON.stringify(rows[0], null, 2));
  process.exit(0);
}
run();
