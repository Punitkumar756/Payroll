const db = require("../config/db");

const DashboardModel = {

  async getEmployeeStats() {

    const sql = `
      SELECT
        COUNT(*) AS totalEmployees,

        SUM(
          CASE
            WHEN status = 'Active'
            THEN 1
            ELSE 0
          END
        ) AS activeEmployees,

        SUM(
          CASE
            WHEN status = 'Inactive'
            THEN 1
            ELSE 0
          END
        ) AS inactiveEmployees

      FROM employees
    `;

    const [rows] = await db.execute(sql);

    return rows[0];
  },


  async getDepartmentData() {

    const sql = `
      SELECT
        d.id,
        d.name,
        d.head,
        COUNT(e.id) AS total,
        SUM(
          CASE
            WHEN e.status = 'Active'
            THEN 1
            ELSE 0
          END
        ) AS active,
        d.payroll,
        d.color,
        d.icon_key AS iconKey
      FROM departments d
      LEFT JOIN employees e
        ON e.department = d.name
      GROUP BY
        d.id,
        d.name,
        d.head,
        d.payroll,
        d.color,
        d.icon_key
      ORDER BY d.id ASC
    `;

    const [rows] = await db.execute(sql);

    const totalEmployees =
      rows.reduce(
        (sum, row) => sum + Number(row.total || 0),
        0
      );

    return rows.map(row => ({
      ...row,

      total: Number(row.total || 0),

      active: Number(row.active || 0),

      payroll:
        `₹ ${Number(row.payroll || 0).toLocaleString("en-IN")}`,

      percentage:
        totalEmployees > 0
          ? Math.round(
              (Number(row.total || 0) /
                totalEmployees) * 100
            )
          : 0
    }));
  },


  async getDashboardStats() {

    const employeeStats =
      await this.getEmployeeStats();

    return [
      {
        title: "Total Employees",
        value: Number(
          employeeStats.totalEmployees || 0
        ),
        iconKey: "Users"
      },

      {
        title: "Active Employees",
        value: Number(
          employeeStats.activeEmployees || 0
        ),
        iconKey: "UserCheck"
      },

      {
        title: "Inactive Employees",
        value: Number(
          employeeStats.inactiveEmployees || 0
        ),
        iconKey: "UserPlus"
      }
    ];
  }

};

module.exports = DashboardModel;