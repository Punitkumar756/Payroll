import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';

async function run() {
  const columns = [
    { name: 'esi_number', def: 'VARCHAR(100)' },
    { name: 'epf_number', def: 'VARCHAR(100)' },
    { name: 'bank_account', def: 'VARCHAR(100)' }
  ];

  for (const col of columns) {
    try {
      await pool.query(`ALTER TABLE employees ADD COLUMN ${col.name} ${col.def};`);
      console.log(`Added ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Column ${col.name} already exists`);
      } else {
        console.log(`Error adding ${col.name}:`, e.message);
      }
    }
  }
  process.exit(0);
}
run();
