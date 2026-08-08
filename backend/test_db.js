import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });
  const [rows] = await conn.execute(
    "SHOW CREATE PROCEDURE sp_master_holiday_create"
  );
  console.log(rows[0]['Create Procedure']);
  process.exit(0);
}
run();
