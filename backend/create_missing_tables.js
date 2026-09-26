import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db/pool.js';

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        employee_id INT UNSIGNED NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loan_repayments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        loan_id INT UNSIGNED NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        repayment_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS advances_deductions (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        employee_id INT UNSIGNED NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslip_lines (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payslip_id INT UNSIGNED NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('Earnings', 'Deductions') NOT NULL,
        FOREIGN KEY (payslip_id) REFERENCES payslips(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_ctc (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        employee_id INT UNSIGNED NOT NULL,
        ctc_amount DECIMAL(12,2) NOT NULL,
        effective_date DATE NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    console.log("Missing tables created successfully.");
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
