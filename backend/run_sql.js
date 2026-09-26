import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import pool from './src/db/pool.js';

async function run() {
  const sql = fs.readFileSync('create_tables.sql', 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const statement of statements) {
    try {
      await pool.query(statement);
      console.log('Executed statement successfully.');
    } catch (e) {
      console.error('Error executing statement:', e.message);
    }
  }
  
  process.exit(0);
}
run();
