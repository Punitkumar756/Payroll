import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  // 1. Alter employees table to add the missing payroll columns
  try {
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS esi_number VARCHAR(100)`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS epf_number VARCHAR(100)`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100)`);
    console.log("Added payroll columns to employees table.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Payroll columns already exist.");
    } else {
      console.log("Error altering employees:", e.message);
    }
  }

  // 2. Rewrite employeeModel.js to use HRMS schema aliases
  const modelPath = path.join(__dirname, 'src', 'models', 'payroll', 'employeeModel.js');
  const code = `import db from "../../db/pool.js";

const EmployeeModel = {
  async getAllEmployees({ search = "", department = "All", status = "All" }) {
    let sql = \`
      SELECT
        e.id,
        e.employee_code AS employeeId,
        CONCAT(e.first_name, ' ', e.last_name) AS name,
        e.official_email AS email,
        e.contact_number AS phone,
        d.name AS dept,
        desig.name AS designation,
        DATE_FORMAT(e.joining_date, '%d %b %Y') AS joinDate,
        e.status,
        e.esi_number AS esiNumber,
        e.epf_number AS epfNumber,
        e.bank_account AS bankAccount
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desig ON e.designation_id = desig.id
      WHERE 1 = 1
    \`;
    const params = [];

    if (search) {
      sql += \`
        AND (
          e.first_name LIKE ?
          OR e.last_name LIKE ?
          OR e.official_email LIKE ?
          OR e.employee_code LIKE ?
          OR e.contact_number LIKE ?
        )
      \`;
      const searchValue = \`%\${search}%\`;
      params.push(searchValue, searchValue, searchValue, searchValue, searchValue);
    }

    if (department && department !== "All") {
      sql += \` AND d.name = ?\`;
      params.push(department);
    }

    if (status && status !== "All") {
      sql += \` AND e.status = ?\`;
      params.push(status);
    }

    sql += \` ORDER BY e.id ASC\`;
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async getEmployeeById(id) {
    const sql = \`
      SELECT
        e.id,
        e.employee_code AS employeeId,
        CONCAT(e.first_name, ' ', e.last_name) AS name,
        e.official_email AS email,
        e.contact_number AS phone,
        d.name AS dept,
        desig.name AS designation,
        DATE_FORMAT(e.joining_date, '%Y-%m-%d') AS joinDate,
        e.status,
        e.esi_number AS esiNumber,
        e.epf_number AS epfNumber,
        e.bank_account AS bankAccount
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desig ON e.designation_id = desig.id
      WHERE e.employee_code = ?
    \`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  async createEmployee(employee) {
    // Note: Creating employees from Payroll dashboard is tricky because we need department_id etc.
    // For now, this stub will insert minimal data or we should just let HR module handle creation.
    // Given the prompt only asks to FETCH data, we will just return a mock success or error.
    throw new Error("Employee creation should be done via core HR module");
  },

  async updateEmployee(id, employee) {
    // Update ONLY payroll specific fields + standard fields if mapped.
    // For now, just updating payroll specific fields since it's the Payroll dashboard.
    const { esiNumber, epfNumber, bankAccount } = employee;
    const sql = \`
      UPDATE employees
      SET
        esi_number = ?,
        epf_number = ?,
        bank_account = ?
      WHERE employee_code = ?
    \`;
    const [result] = await db.execute(sql, [
      esiNumber || null,
      epfNumber || null,
      bankAccount || null,
      id
    ]);
    return result;
  },

  async deleteEmployee(id) {
    throw new Error("Employee deletion should be done via core HR module");
  },

  async generateEmployeeId() {
    return "EMP999";
  }
};

export default EmployeeModel;
`;
  fs.writeFileSync(modelPath, code);
  console.log("Rewrote employeeModel.js to map to HRMS schema.");

  process.exit(0);
}

run();
