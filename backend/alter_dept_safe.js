import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';

async function run() {
  const columns = [
    { name: 'head', def: 'VARCHAR(255)' },
    { name: 'payroll', def: 'DECIMAL(15, 2) DEFAULT 0.00' },
    { name: 'color', def: 'VARCHAR(50)' },
    { name: 'icon_key', def: 'VARCHAR(50)' }
  ];

  console.log("Adding payroll columns to departments table...");
  for (const col of columns) {
    try {
      await pool.query(`ALTER TABLE departments ADD COLUMN ${col.name} ${col.def};`);
      console.log(`Added ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Column ${col.name} already exists`);
      } else {
        console.log(`Error adding ${col.name}:`, e.message);
      }
    }
  }

  try {
    await pool.query(`UPDATE departments SET color = '#6366f1', icon_key = 'Monitor' WHERE id % 4 = 1;`);
    await pool.query(`UPDATE departments SET color = '#3b82f6', icon_key = 'User' WHERE id % 4 = 2;`);
    await pool.query(`UPDATE departments SET color = '#06b6d4', icon_key = 'Wallet' WHERE id % 4 = 3;`);
    await pool.query(`UPDATE departments SET color = '#10b981', icon_key = 'TrendingUp' WHERE id % 4 = 0;`);
    console.log("Seeded colors/icons");
  } catch (e) {}

  process.exit(0);
}
run();
