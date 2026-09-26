const db = require("../config/db");

// ========================================
// Get All Salary Heads
// ========================================

const getAllSalaryHeads = async () => {

    const [rows] = await db.query(`
        SELECT
            id,
            code,
            name,
            salaryType,
            headCategory,
            expression,
            description,
            created_at,
            updated_at
        FROM salary_heads
        ORDER BY id DESC
    `);

    return rows;
};


// ========================================
// Get Salary Head By ID
// ========================================

const getSalaryHeadById = async (id) => {

    const [rows] = await db.query(`
        SELECT
            id,
            code,
            name,
            salaryType,
            headCategory,
            expression,
            description,
            created_at,
            updated_at
        FROM salary_heads
        WHERE id = ?
        LIMIT 1
    `, [id]);

    return rows[0] || null;
};


// ========================================
// Get Salary Head By Code
// ========================================

const getSalaryHeadByCode = async (code) => {

    const [rows] = await db.query(`
        SELECT
            id,
            code,
            name,
            salaryType,
            headCategory,
            expression,
            description,
            created_at,
            updated_at
        FROM salary_heads
        WHERE code = ?
        LIMIT 1
    `, [code]);

    return rows[0] || null;
};


// ========================================
// Create Salary Head
// ========================================

const createSalaryHead = async (data) => {

    const sql = `
        INSERT INTO salary_heads
        (
            code,
            name,
            salaryType,
            headCategory,
            expression,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [

        data.code,

        data.name,

        data.salaryType,

        data.headCategory,

        data.expression,

        data.description || null

    ]);

    return await getSalaryHeadById(result.insertId);
};


// ========================================
// Update Salary Head
// ========================================

const updateSalaryHead = async (id, data) => {

    const sql = `
        UPDATE salary_heads
        SET
            name = ?,
            salaryType = ?,
            headCategory = ?,
            expression = ?,
            description = ?
        WHERE id = ?
    `;

    const [result] = await db.query(sql, [

        data.name,

        data.salaryType,

        data.headCategory,

        data.expression,

        data.description || null,

        id

    ]);

    if (result.affectedRows === 0) {
        return null;
    }

    return await getSalaryHeadById(id);
};


// ========================================
// Delete Salary Head
// ========================================

const deleteSalaryHead = async (id) => {

    const [result] = await db.query(
        `
        DELETE FROM salary_heads
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
};


// ========================================
// Export
// ========================================

module.exports = {

    getAllSalaryHeads,

    getSalaryHeadById,

    getSalaryHeadByCode,

    createSalaryHead,

    updateSalaryHead,

    deleteSalaryHead

};