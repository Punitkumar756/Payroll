const express = require("express");

const {
    getPayslipComponents,
    getPayslipComponentById,
    createPayslipComponent,
    updatePayslipComponent,
    deletePayslipComponent
} = require("../controllers/payslipController");

const router = express.Router();

// GET all components
router.get("/", getPayslipComponents);

// CREATE component
router.post("/", createPayslipComponent);

// GET one component (must come after other routes)
router.get("/:id", getPayslipComponentById);

// UPDATE component
router.put("/:id", updatePayslipComponent);

// DELETE component
router.delete("/:id", deletePayslipComponent);

module.exports = router;
