import pool from "../../db/pool.js";

/*
=========================================================
GET OPTIONS
GET /v1/payroll/options
=========================================================
*/

export const getOptions = async (req, res, next) => {
    try {
        const [financialYearRows] = await pool.query(`
            SELECT DISTINCT financial_year
            FROM payslips
            WHERE financial_year IS NOT NULL
              AND financial_year <> ''
            ORDER BY financial_year DESC
        `);

        const [payPeriodRows] = await pool.query(`
            SELECT DISTINCT pay_period
            FROM payslips
            WHERE pay_period IS NOT NULL
              AND pay_period <> ''
            ORDER BY pay_period DESC
        `);

        const [departmentRows] = await pool.query(`
            SELECT DISTINCT department
            FROM payslips
            WHERE department IS NOT NULL
              AND department <> ''
            ORDER BY department ASC
        `);

        res.json({
            success: true,

            financialYears: financialYearRows.map(
                row => row.financial_year
            ),

            payPeriods: payPeriodRows.map(
                row => row.pay_period
            ),

            departments: departmentRows.map(
                row => row.department
            )
        });

    } catch (error) {
        next(error);
    }
};


/*
=========================================================
GET PAYSLIPS
GET /v1/payroll/payslips
=========================================================
*/

export const getPayslips = async (req, res, next) => {
    try {
        const {
            financialYear,
            payPeriod,
            department
        } = req.query;

        if (!financialYear || !payPeriod) {
            return res.status(400).json({
                success: false,
                message: "financialYear and payPeriod are required"
            });
        }

        let sql = `
            SELECT
                id,
                employee_id,
                employee_name,
                email,
                department,
                financial_year,
                pay_period,
                net_pay,
                status,
                processed_on,
                approved_on
            FROM payslips
            WHERE financial_year = ?
              AND pay_period = ?
        `;

        const params = [
            financialYear,
            payPeriod
        ];

        if (department && department !== "All") {
            sql += ` AND department = ?`;
            params.push(department);
        }

        sql += `
            ORDER BY employee_name ASC
        `;

        const [rows] = await pool.query(sql, params);

        const payslips = rows.map(row => ({
            id: row.employee_id,
            databaseId: row.id,

            name: row.employee_name,
            email: row.email,
            dept: row.department,

            financialYear: row.financial_year,
            payPeriod: row.pay_period,

            netPay: Number(row.net_pay || 0).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ),

            netPayAmount: Number(row.net_pay || 0),

            status: row.status,

            processedOn: row.processed_on,
            approvedOn: row.approved_on
        }));

        res.json({
            success: true,
            count: payslips.length,
            payslips
        });

    } catch (error) {
        next(error);
    }
};


/*
=========================================================
APPROVE PAYSLIPS
POST /v1/payroll/payslips/approve
=========================================================
*/

export const approvePayslips = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const {
            employeeIds,
            financialYear,
            payPeriod,
            action
        } = req.body;

        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "employeeIds must be a non-empty array"
            });
        }

        if (!financialYear || !payPeriod) {
            return res.status(400).json({
                success: false,
                message: "financialYear and payPeriod are required"
            });
        }

        if (action !== "APPROVE") {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        await connection.beginTransaction();

        const placeholders = employeeIds
            .map(() => "?")
            .join(",");

        const sql = `
            UPDATE payslips
            SET
                status = 'Approved',
                approved_on = NOW()
            WHERE employee_id IN (${placeholders})
              AND financial_year = ?
              AND pay_period = ?
        `;

        const params = [
            ...employeeIds,
            financialYear,
            payPeriod
        ];

        const [result] = await connection.query(
            sql,
            params
        );

        await connection.commit();

        res.json({
            success: true,
            message: `${result.affectedRows} payslip(s) approved successfully`,
            affectedRows: result.affectedRows
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};


/*
=========================================================
UNAPPROVE PAYSLIPS
POST /v1/payroll/payslips/unapprove
=========================================================
*/

export const unapprovePayslips = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const {
            employeeIds,
            financialYear,
            payPeriod,
            action
        } = req.body;

        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "employeeIds must be a non-empty array"
            });
        }

        if (!financialYear || !payPeriod) {
            return res.status(400).json({
                success: false,
                message: "financialYear and payPeriod are required"
            });
        }

        if (action !== "UNAPPROVE") {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        await connection.beginTransaction();

        const placeholders = employeeIds
            .map(() => "?")
            .join(",");

        const sql = `
            UPDATE payslips
            SET
                status = 'Pending',
                approved_on = NULL
            WHERE employee_id IN (${placeholders})
              AND financial_year = ?
              AND pay_period = ?
        `;

        const params = [
            ...employeeIds,
            financialYear,
            payPeriod
        ];

        const [result] = await connection.query(
            sql,
            params
        );

        await connection.commit();

        res.json({
            success: true,
            message: `${result.affectedRows} payslip(s) unapproved successfully`,
            affectedRows: result.affectedRows
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};