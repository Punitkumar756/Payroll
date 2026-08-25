const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms',
    multipleStatements: true
  });
  const sql = fs.readFileSync('../db/procedures/04_leave.sql', 'utf8');
  await connection.query(sql);
  console.log('Done');
  process.exit(0);
}
run();
