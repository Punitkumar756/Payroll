const express = require("express");

const {
    getPayslips,
    getPayslipById,
    createPayslip,
    updatePayslip,
    deletePayslip,
    approvePayslips,
    unapprovePayslips,
    getPayslipOptions
} = require("../controllers/payslipController");

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

module.exports = router;