const db = require("../config/db");

const fields = [
  "name",
  "dept",
  "period",
  "month",
  "totalDays",
  "daysPresent",
  "daysAbsent",
  "holidays",
  "weekoffs",
  "holidaysWorked",
  "weekoffsWorked",
  "shortHoursWorked",
  "earlyDays",
  "lateDays",
  "paidLeaves",
  "unpaidLeaves",
  "hoursWorked",
  "hoursWorkedOnHoliday",
  "hoursWorkedOnWeekoff",
  "lateHours",
  "earlyHours",
  "otHoursWorked",
  "shortNormalHours",
  "shortOtHours",
  "shortSpecialOtHours",
  "splOtHoursWorked",
  "status"
];

async function getAllTimesheets() {
  const [rows] = await db.query(
    "SELECT * FROM timesheets ORDER BY id DESC"
  );

  return rows;
}

async function getTimesheetByCode(code) {
  const [rows] = await db.query(
    "SELECT * FROM timesheets WHERE code = ?",
    [code]
  );

  return rows[0];
}

async function createTimesheet(data) {
  const [lastRows] = await db.query(
    "SELECT code FROM timesheets ORDER BY id DESC LIMIT 1"
  );

  let nextNumber = 1;

  if (lastRows.length > 0 && lastRows[0].code) {
    const number = parseInt(
      lastRows[0].code.replace("EMP", ""),
      10
    );

    if (!isNaN(number)) {
      nextNumber = number + 1;
    }
  }

  const code = `EMP${String(nextNumber).padStart(3, "0")}`;

  const values = fields.map((field) => {
    return data[field] ?? null;
  });

  const placeholders = fields.map(() => "?").join(",");

  const sql = `
    INSERT INTO timesheets
    (code, ${fields.join(",")})
    VALUES
    (?, ${placeholders})
  `;

  await db.query(sql, [code, ...values]);

  return getTimesheetByCode(code);
}

async function updateTimesheet(code, data) {
  const setClause = fields
    .map((field) => `${field} = ?`)
    .join(", ");

  const values = fields.map((field) => {
    return data[field] ?? null;
  });

  const sql = `
    UPDATE timesheets
    SET ${setClause},
        updated = CURRENT_TIMESTAMP
    WHERE code = ?
  `;

  const [result] = await db.query(sql, [
    ...values,
    code
  ]);

  if (result.affectedRows === 0) {
    return null;
  }

  return getTimesheetByCode(code);
}

module.exports = {
  getAllTimesheets,
  getTimesheetByCode,
  createTimesheet,
  updateTimesheet
};