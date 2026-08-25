const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });
  
  try {
    const [rows] = await connection.query(`CALL sp_attendance_get_self('EMPLOYEE', 2, NULL, NULL)`);
    console.log(rows[0]);
  } catch (err) {
    console.error(err);
  }
  
  await connection.end();
}

main().catch(console.error);
