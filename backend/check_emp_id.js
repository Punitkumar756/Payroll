import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db/pool.js';

async function run() {
  const tables = [
    'payslips',
    'leave_applications',
    'leave_balances',
    'employee_leave_policy',
    'attendance_correction_requests',
    'attendance_daily',
    'employee_shift_assignments',
    'users'
  ];
  
  for (const table of tables) {
    try {
      const [rows] = await pool.query(`DESCRIBE ${table}`);
      const hasEmployeeId = rows.some(r => r.Field === 'employee_id');
      if (!hasEmployeeId) {
        console.log(`Table ${table} is MISSING employee_id!`);
      }
    } catch (e) {
      console.log(`Error checking ${table}:`, e.message);
    }
  }
  process.exit(0);
}
run();
