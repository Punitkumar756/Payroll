import pool from './backend/src/db/pool.js';
async function run() {
  try {
    const [rows] = await pool.query("DESCRIBE departments");
    console.log("Departments table schema:", rows);
  } catch (e) {
    console.log("Error describing departments:", e.message);
  }
  process.exit(0);
}
run();
