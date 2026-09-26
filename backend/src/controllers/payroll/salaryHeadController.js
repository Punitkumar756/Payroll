import * as SalaryHead from "../../models/payroll/salaryHeadModel.js";

// ========================================
// Allowed Values
// ========================================

const allowedSalaryTypes = [
    "Earnings",
    "Deductions",
    "Employer Contribution"
];

const allowedCategories = [
    "Basic",
    "DA",
    "HRA",
    "Conveyance"
];


// ========================================
// Validation
// ========================================

const validateSalaryHead = (data, isUpdate = false) => {

    const errors = [];

    // Code
    if (!isUpdate) {

        if (!data.code || !String(data.code).trim()) {

            errors.push("Code is required");

        }

    }

    // Name
    if (!data.name || !String(data.name).trim()) {

        errors.push("Name is required");

    }


    // Salary Type
    if (!allowedSalaryTypes.includes(data.salaryType)) {

        errors.push(
            "salaryType must be Earnings, Deductions, or Employer Contribution"
        );

    }


    // Head Category
    if (!allowedCategories.includes(data.headCategory)) {

        errors.push(
            "headCategory must be Basic, DA, HRA, or Conveyance"
        );

    }


    // Expression
    if (
        !data.expression ||
        !String(data.expression).trim()
    ) {

        errors.push("Expression is required");

    }


    // Expression length
    if (
        data.expression &&
        String(data.expression).length > 500
    ) {

        errors.push(
            "Expression cannot exceed 500 characters"
        );

    }


    // Description length
    if (
        data.description &&
        String(data.description).length > 500
    ) {

        errors.push(
            "Description cannot exceed 500 characters"
        );

    }

    return errors;
};


// ========================================
// GET ALL
// GET /api/salary-heads
// ========================================

const getSalaryHeads = async (req, res, next) => {

    try {

        const salaryHeads =
            await SalaryHead.getAllSalaryHeads();

        res.status(200).json({

            success: true,

            count: salaryHeads.length,

            salaryHeads

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET BY ID
// GET /api/salary-heads/:id
// ========================================

const getSalaryHead = async (req, res, next) => {

    try {

        const { id } = req.params;

        const salaryHead =
            await SalaryHead.getSalaryHeadById(id);

        if (!salaryHead) {

            return res.status(404).json({

                success: false,

                message: "Salary head not found"

            });

        }

        res.status(200).json({

            success: true,

            salaryHead

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// CREATE
// POST /api/salary-heads
// ========================================

const createSalaryHead = async (req, res, next) => {

    try {

        const errors =
            validateSalaryHead(req.body);

        if (errors.length > 0) {

            return res.status(400).json({

                success: false,

                message: errors.join(", "),

                errors

            });

        }


        const code =
            String(req.body.code).trim().toUpperCase();


        // Check duplicate code
        const existing =
            await SalaryHead.getSalaryHeadByCode(code);

        if (existing) {

            return res.status(409).json({

                success: false,

                message:
                    `Salary head code '${code}' already exists`

            });

        }


        const data = {

            code,

            name:
                String(req.body.name).trim(),

            salaryType:
                req.body.salaryType,

            headCategory:
                req.body.headCategory,

            expression:
                String(req.body.expression).trim(),

            description:
                req.body.description
                    ? String(req.body.description).trim()
                    : null

        };


        const salaryHead =
            await SalaryHead.createSalaryHead(data);


        res.status(201).json({

            success: true,

            message:
                "Salary head created successfully",

            salaryHead

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// UPDATE
// PUT /api/salary-heads/:id
// ========================================

const updateSalaryHead = async (req, res, next) => {

    try {

        const { id } = req.params;


        const errors =
            validateSalaryHead(
                req.body,
                true
            );


        if (errors.length > 0) {

            return res.status(400).json({

                success: false,

                message: errors.join(", "),

                errors

            });

        }


        // Check record
        const existing =
            await SalaryHead.getSalaryHeadById(id);


        if (!existing) {

            return res.status(404).json({

                success: false,

                message:
                    "Salary head not found"

            });

        }


        const data = {

            name:
                String(req.body.name).trim(),

            salaryType:
                req.body.salaryType,

            headCategory:
                req.body.headCategory,

            expression:
                String(req.body.expression).trim(),

            description:
                req.body.description
                    ? String(req.body.description).trim()
                    : null

        };


        const updated =
            await SalaryHead.updateSalaryHead(
                id,
                data
            );


        res.status(200).json({

            success: true,

            message:
                "Salary head updated successfully",

            salaryHead: updated

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// DELETE
// DELETE /api/salary-heads/:id
// ========================================

const deleteSalaryHead = async (req, res, next) => {

    try {

        const { id } = req.params;


        const deleted =
            await SalaryHead.deleteSalaryHead(id);


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message:
                    "Salary head not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Salary head deleted successfully"

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// EXPORT
// ========================================

export default {

    getSalaryHeads,

    getSalaryHead,

    createSalaryHead,

    updateSalaryHead,

    deleteSalaryHead

};