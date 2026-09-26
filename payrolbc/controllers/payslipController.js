const db = require("../config/db");

// ============================================
// GET ALL PAYSLIPS
// GET /api/payslips
// ============================================

exports.getPayslips = async (req, res, next) => {
    try {
        const {
            financialYear,
            payPeriod
        } = req.query;

        let sql = `
            SELECT
                id,
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                DATE_FORMAT(date, '%d %b %Y, %h:%i %p') AS date
            FROM payslips
            WHERE 1 = 1
        `;

        const params = [];

        if (financialYear) {
            sql += ` AND financialYear = ?`;
            params.push(financialYear);
        }

        if (payPeriod) {
            sql += ` AND period = ?`;
            params.push(payPeriod);
        }

        sql += ` ORDER BY id DESC`;

        const [rows] = await db.execute(sql, params);

        res.status(200).json(rows);

    } catch (error) {
        next(error);
    }
};


// ============================================
// GET SINGLE PAYSLIP
// GET /api/payslips/:id
// ============================================

exports.getPayslipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `
            SELECT
                id,
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                DATE_FORMAT(date, '%d %b %Y, %h:%i %p') AS date
            FROM payslips
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip record not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }
};


// ============================================
// CREATE PAYSLIP
// POST /api/payslips
// ============================================

exports.createPayslip = async (req, res, next) => {
    try {
        const {
            code,
            name,
            dept,
            financialYear,
            period,
            status,
            message
        } = req.body;

        // Validation
        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: "Employee code and name are required"
            });
        }

        const finalDept = dept || "IT Department";
        const finalFinancialYear = financialYear || "2024 - 2025";
        const finalPeriod = period || "";
        const finalStatus = status || "Pending";
        const finalMessage =
            message || "Payslip processing pending.";

        const [result] = await db.execute(
            `
            INSERT INTO payslips
            (
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
                code,
                name,
                finalDept,
                finalFinancialYear,
                finalPeriod,
                finalStatus,
                finalMessage
            ]
        );

        const insertedId = result.insertId;

        const [rows] = await db.execute(
            `
            SELECT
                id,
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                DATE_FORMAT(date, '%d %b %Y, %h:%i %p') AS date
            FROM payslips
            WHERE id = ?
            `,
            [insertedId]
        );

        res.status(201).json(rows[0]);

    } catch (error) {
        next(error);
    }
};


// ============================================
// UPDATE PAYSLIP
// PUT /api/payslips/:id
// ============================================

exports.updatePayslip = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            code,
            name,
            dept,
            financialYear,
            period,
            status,
            message
        } = req.body;

        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: "Employee code and name are required"
            });
        }

        const [existing] = await db.execute(
            `SELECT id FROM payslips WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip record not found"
            });
        }

        await db.execute(
            `
            UPDATE payslips
            SET
                code = ?,
                name = ?,
                dept = ?,
                financialYear = ?,
                period = ?,
                status = ?,
                message = ?
            WHERE id = ?
            `,
            [
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                id
            ]
        );

        const [rows] = await db.execute(
            `
            SELECT
                id,
                code,
                name,
                dept,
                financialYear,
                period,
                status,
                message,
                DATE_FORMAT(date, '%d %b %Y, %h:%i %p') AS date
            FROM payslips
            WHERE id = ?
            `,
            [id]
        );

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }
};


// ============================================
// DELETE PAYSLIP
// DELETE /api/payslips/:id
// ============================================

exports.deletePayslip = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `DELETE FROM payslips WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payslip deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// APPROVE PAYSLIPS
// POST /api/payslips/approve
// ============================================

exports.approvePayslips = async (req, res, next) => {
    try {
        const { employeeIds, financialYear, payPeriod } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid employee IDs"
            });
        }

        // Build placeholders for SQL IN clause
        const placeholders = employeeIds.map(() => '?').join(',');
        const params = [...employeeIds, 'Approved'];

        await db.execute(
            `
            UPDATE payslips
            SET status = ?
            WHERE id IN (${placeholders})
            `,
            params
        );

        res.status(200).json({
            success: true,
            message: `${employeeIds.length} payslip(s) approved successfully`
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// UNAPPROVE PAYSLIPS
// POST /api/payslips/unapprove
// ============================================

exports.unapprovePayslips = async (req, res, next) => {
    try {
        const { employeeIds, financialYear, payPeriod } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid employee IDs"
            });
        }

        // Build placeholders for SQL IN clause
        const placeholders = employeeIds.map(() => '?').join(',');
        const params = [...employeeIds, 'Pending'];

        await db.execute(
            `
            UPDATE payslips
            SET status = ?
            WHERE id IN (${placeholders})
            `,
            params
        );

        res.status(200).json({
            success: true,
            message: `${employeeIds.length} payslip(s) unapproved successfully`
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// GET PAYSLIP OPTIONS
// GET /api/payslips/options
// ============================================

exports.getPayslipOptions = async (req, res, next) => {
    try {
        const [financialYears] = await db.execute(
            `SELECT DISTINCT financialYear FROM payslips ORDER BY financialYear DESC`
        );

        const [payPeriods] = await db.execute(
            `SELECT DISTINCT period FROM payslips ORDER BY period DESC`
        );

        const [departments] = await db.execute(
            `SELECT DISTINCT dept FROM payslips ORDER BY dept ASC`
        );

        res.status(200).json({
            financialYears: financialYears.map(row => row.financialYear),
            payPeriods: payPeriods.map(row => row.period),
            departments: departments.map(row => row.dept)
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// PAYSLIP COMPONENTS - GET ALL
// GET /api/payslip-components
// ============================================

exports.getPayslipComponents = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT id, code, name, description, type, amount, status
            FROM payslip_components
            ORDER BY id DESC
            `
        );

        res.status(200).json(rows);

    } catch (error) {
        next(error);
    }
};

// ============================================
// PAYSLIP COMPONENTS - GET ONE
// GET /api/payslip-components/:id
// ============================================

exports.getPayslipComponentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `
            SELECT id, code, name, description, type, amount, status
            FROM payslip_components
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip component not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }
};

// ============================================
// PAYSLIP COMPONENTS - CREATE
// POST /api/payslip-components
// ============================================

exports.createPayslipComponent = async (req, res, next) => {
    try {
        const { code, name, description, type, amount } = req.body;

        if (!code || !name || !type) {
            return res.status(400).json({
                success: false,
                message: "Code, name, and type are required"
            });
        }

        const [result] = await db.execute(
            `
            INSERT INTO payslip_components (code, name, description, type, amount, status)
            VALUES (?, ?, ?, ?, ?, 'Active')
            `,
            [code, name, description || '', type, amount || 0]
        );

        const [rows] = await db.execute(
            `SELECT id, code, name, description, type, amount, status FROM payslip_components WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json(rows[0]);

    } catch (error) {
        next(error);
    }
};

// ============================================
// PAYSLIP COMPONENTS - UPDATE
// PUT /api/payslip-components/:id
// ============================================

exports.updatePayslipComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, name, description, type, amount } = req.body;

        if (!code || !name || !type) {
            return res.status(400).json({
                success: false,
                message: "Code, name, and type are required"
            });
        }

        const [existing] = await db.execute(
            `SELECT id FROM payslip_components WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip component not found"
            });
        }

        await db.execute(
            `
            UPDATE payslip_components
            SET code = ?, name = ?, description = ?, type = ?, amount = ?
            WHERE id = ?
            `,
            [code, name, description || '', type, amount || 0, id]
        );

        const [rows] = await db.execute(
            `SELECT id, code, name, description, type, amount, status FROM payslip_components WHERE id = ?`,
            [id]
        );

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }
};

// ============================================
// PAYSLIP COMPONENTS - DELETE
// DELETE /api/payslip-components/:id
// ============================================

exports.deletePayslipComponent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `DELETE FROM payslip_components WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payslip component not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payslip component deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};