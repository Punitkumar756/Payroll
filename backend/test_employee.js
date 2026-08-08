import mysql from 'mysql2/promise';

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms',
  });

  try {
    const [rows] = await pool.query("SHOW TABLES LIKE '%document%';");
    console.log("Documents Table:", rows);
    const [rows2] = await pool.query("SHOW TABLES LIKE '%emp%';");
    console.log("Employee Tables:", rows2);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
test();
