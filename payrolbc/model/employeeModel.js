const db = require("../config/db");

const EmployeeModel = {

  async getAllEmployees({ search = "", department = "All", status = "All" }) {

    let sql = `
      SELECT
        id,
        employee_id AS employeeId,
        name,
        email,
        phone,
        department AS dept,
        designation,
        DATE_FORMAT(join_date, '%d %b %Y') AS joinDate,
        status,
        esi_number AS esiNumber,
        epf_number AS epfNumber,
        bank_account AS bankAccount
      FROM employees
      WHERE 1 = 1
    `;

    const params = [];

    if (search) {
      sql += `
        AND (
          name LIKE ?
          OR email LIKE ?
          OR employee_id LIKE ?
          OR phone LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    if (department && department !== "All") {
      sql += ` AND department = ?`;
      params.push(department);
    }

    if (status && status !== "All") {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY id ASC`;

    const [rows] = await db.execute(sql, params);

    return rows;
  },


  async getEmployeeById(id) {

    const sql = `
      SELECT
        id,
        employee_id AS employeeId,
        name,
        email,
        phone,
        department AS dept,
        designation,
        DATE_FORMAT(join_date, '%Y-%m-%d') AS joinDate,
        status,
        esi_number AS esiNumber,
        epf_number AS epfNumber,
        bank_account AS bankAccount
      FROM employees
      WHERE employee_id = ?
    `;

    const [rows] = await db.execute(sql, [id]);

    return rows[0];
  },


  async createEmployee(employee) {

    const {
      employeeId,
      name,
      email,
      phone,
      dept,
      designation,
      joinDate,
      status,
      esiNumber,
      epfNumber,
      bankAccount
    } = employee;

    const sql = `
      INSERT INTO employees
      (
        employee_id,
        name,
        email,
        phone,
        department,
        designation,
        join_date,
        status,
        esi_number,
        epf_number,
        bank_account
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      employeeId,
      name,
      email,
      phone,
      dept,
      designation || null,
      joinDate || null,
      status || "Active",
      esiNumber || null,
      epfNumber || null,
      bankAccount || null
    ]);

    return result;
  },


  async updateEmployee(id, employee) {

    const {
      name,
      email,
      phone,
      dept,
      designation,
      joinDate,
      status,
      esiNumber,
      epfNumber,
      bankAccount
    } = employee;

    const sql = `
      UPDATE employees
      SET
        name = ?,
        email = ?,
        phone = ?,
        department = ?,
        designation = ?,
        join_date = ?,
        status = ?,
        esi_number = ?,
        epf_number = ?,
        bank_account = ?
      WHERE employee_id = ?
    `;

    const [result] = await db.execute(sql, [
      name,
      email,
      phone,
      dept,
      designation || null,
      joinDate || null,
      status,
      esiNumber || null,
      epfNumber || null,
      bankAccount || null,
      id
    ]);

    return result;
  },


  async deleteEmployee(id) {

    const sql = `
      DELETE FROM employees
      WHERE employee_id = ?
    `;

    const [result] = await db.execute(sql, [id]);

    return result;
  },


  async generateEmployeeId() {

    const sql = `
      SELECT employee_id
      FROM employees
      ORDER BY id DESC
      LIMIT 1
    `;

    const [rows] = await db.execute(sql);

    if (rows.length === 0) {
      return "EMP001";
    }

    const lastId = rows[0].employee_id;

    const number = parseInt(
      lastId.replace("EMP", ""),
      10
    );

    return `EMP${String(number + 1).padStart(3, "0")}`;
  }

};

module.exports = EmployeeModel;