import { Router } from "express";
const express = { Router };

const router = express.Router();

import * as payrollController from "../../controllers/payroll/payrollController.js";
const {
    getOptions,
    getPayslips,
    approvePayslips,
    unapprovePayslips
} = payrollController;


// GET filter options
router.get(
    "/options",
    getOptions
);


// GET payslips
router.get(
    "/payslips",
    getPayslips
);


// Approve selected payslips
router.post(
    "/payslips/approve",
    approvePayslips
);


// Unapprove selected payslips
router.post(
    "/payslips/unapprove",
    unapprovePayslips
);


export default router;