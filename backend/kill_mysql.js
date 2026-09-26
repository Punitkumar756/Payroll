import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrms'
  });

  try {
    const [rows] = await pool.query("SHOW PROCESSLIST");
    for (const row of rows) {
      if (row.Command === 'Sleep' && row.Time > 10) {
        console.log(`Killing connection ${row.Id}`);
        await pool.query(`KILL ${row.Id}`);
      }
    }
    console.log("Killed sleeping connections.");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
run();
