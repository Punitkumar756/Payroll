import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';

async function run() {
  try {
    const [rows] = await pool.query("DESCRIBE employees");
    console.log("Employees table schema:");
    rows.forEach(r => console.log(r.Field, r.Type));
  } catch (e) {
    console.log("Error describing employees:", e.message);
  }
  process.exit(0);
}
run();
