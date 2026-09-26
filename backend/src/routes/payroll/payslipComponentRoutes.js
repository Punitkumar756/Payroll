import { Router } from "express";
const express = { Router };

import * as payslipController from "../../controllers/payroll/payslipController.js";
const {
    getPayslipComponents,
    getPayslipComponentById,
    createPayslipComponent,
    updatePayslipComponent,
    deletePayslipComponent
} = payslipController;

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

export default router;
