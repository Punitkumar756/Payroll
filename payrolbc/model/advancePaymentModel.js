const db = require("../config/db");

// Get all advance payments
const getAll = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      employee,
      financial_year AS financialYear,
      pay_period AS payPeriod,
      item,
      remarks,
      amount,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM advance_payments
    ORDER BY id DESC
  `);

  return rows;
};


// Get one payment
const getById = async (id) => {
  const [rows] = await db.query(`
    SELECT
      id,
      employee,
      financial_year AS financialYear,
      pay_period AS payPeriod,
      item,
      remarks,
      amount,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM advance_payments
    WHERE id = ?
  `, [id]);

  return rows[0];
};


// Create payment
const create = async (data) => {
  const {
    employee,
    financialYear,
    payPeriod,
    item,
    remarks,
    amount
  } = data;

  const [result] = await db.query(`
    INSERT INTO advance_payments
    (
      employee,
      financial_year,
      pay_period,
      item,
      remarks,
      amount
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    employee,
    financialYear,
    payPeriod,
    item,
    remarks || "-",
    amount
  ]);

  return getById(result.insertId);
};


// Update payment
const update = async (id, data) => {
  const {
    employee,
    financialYear,
    payPeriod,
    item,
    remarks,
    amount
  } = data;

  const [result] = await db.query(`
    UPDATE advance_payments
    SET
      employee = ?,
      financial_year = ?,
      pay_period = ?,
      item = ?,
      remarks = ?,
      amount = ?
    WHERE id = ?
  `, [
    employee,
    financialYear,
    payPeriod,
    item,
    remarks || "-",
    amount,
    id
  ]);

  if (result.affectedRows === 0) {
    return null;
  }

  return getById(id);
};


// Delete payment
const remove = async (id) => {
  const [result] = await db.query(
    `DELETE FROM advance_payments WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};


// Dropdown options
const getOptions = async () => {

  // Employees
  const [employeeRows] = await db.query(`
    SELECT DISTINCT employee
    FROM advance_payments
    WHERE employee IS NOT NULL
      AND employee <> ''
    ORDER BY employee
  `);

  // Financial years
  const [financialYearRows] = await db.query(`
    SELECT DISTINCT financial_year
    FROM advance_payments
    WHERE financial_year IS NOT NULL
      AND financial_year <> ''
    ORDER BY financial_year DESC
  `);

  // Pay periods
  const [payPeriodRows] = await db.query(`
    SELECT DISTINCT pay_period
    FROM advance_payments
    WHERE pay_period IS NOT NULL
      AND pay_period <> ''
    ORDER BY pay_period DESC
  `);

  return {
    employees: employeeRows.map(row => row.employee),

    financialYears: financialYearRows.map(
      row => row.financial_year
    ),

    payPeriods: payPeriodRows.map(
      row => row.pay_period
    ),

    items: [
      "Advance Salary",
      "Travel Advance",
      "Festival Advance",
      "Medical Advance"
    ]
  };
};


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getOptions
};