import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db/pool.js';

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslip_lines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payslip_id INT NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('Earnings', 'Deductions') NOT NULL,
        FOREIGN KEY (payslip_id) REFERENCES payslips(id) ON DELETE CASCADE
      )
    `);
    console.log("Created payslip_lines");
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
