const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms',
  });

  try {
    const [rows] = await pool.query("SHOW PROCEDURE STATUS WHERE Db = 'hrms';");
    console.log('Stored Procedures:', rows.map(r => r.Name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
test();
