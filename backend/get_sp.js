import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db/pool.js';

async function run() {
  try {
    const [rows] = await pool.query("SHOW CREATE PROCEDURE sp_employee_delete");
    console.log(rows[0]['Create Procedure']);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
