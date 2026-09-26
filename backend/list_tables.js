import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';

async function run() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log("Tables in DB:", rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
