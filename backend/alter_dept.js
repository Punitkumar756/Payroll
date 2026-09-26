import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';

async function run() {
  try {
    console.log("Adding payroll columns to departments table...");
    await pool.query(`
      ALTER TABLE departments 
      ADD COLUMN IF NOT EXISTS head VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payroll DECIMAL(15, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS color VARCHAR(50),
      ADD COLUMN IF NOT EXISTS icon_key VARCHAR(50);
    `);
    
    // Also seed some default values for existing departments so they look good in the UI
    await pool.query(`UPDATE departments SET color = '#6366f1', icon_key = 'Monitor' WHERE id % 4 = 1;`);
    await pool.query(`UPDATE departments SET color = '#3b82f6', icon_key = 'User' WHERE id % 4 = 2;`);
    await pool.query(`UPDATE departments SET color = '#06b6d4', icon_key = 'Wallet' WHERE id % 4 = 3;`);
    await pool.query(`UPDATE departments SET color = '#10b981', icon_key = 'TrendingUp' WHERE id % 4 = 0;`);

    console.log("Successfully added payroll columns to departments table!");
  } catch (e) {
    console.log("Error altering departments:", e.message);
  }
  process.exit(0);
}
run();
