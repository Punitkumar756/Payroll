const express = require("express");

const router = express.Router();

const {
    getOptions,
    getPayslips,
    approvePayslips,
    unapprovePayslips
} = require("../controllers/payrollController");


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


module.exports = router;