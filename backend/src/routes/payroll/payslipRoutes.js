import { Router } from "express";
const express = { Router };

import * as payslipController from "../../controllers/payroll/payslipController.js";
const {
    getPayslips,
    getPayslipById,
    createPayslip,
    updatePayslip,
    deletePayslip,
    approvePayslips,
    unapprovePayslips,
    getPayslipOptions
} = payslipController;

const router = express.Router();

// GET options (must come before /:id)
router.get("/options", getPayslipOptions);

// Approve payslips (must come before /:id)
router.post("/approve", approvePayslips);

// Unapprove payslips (must come before /:id)
router.post("/unapprove", unapprovePayslips);

// GET all
router.get("/", getPayslips);

// GET one
router.get("/:id", getPayslipById);

// CREATE
router.post("/", createPayslip);

// UPDATE
router.put("/:id", updatePayslip);

// DELETE
router.delete("/:id", deletePayslip);

export default router;