const express = require("express");

const {
    getSalaryHeads,
    getSalaryHead,
    createSalaryHead,
    updateSalaryHead,
    deleteSalaryHead
} = require("../controllers/salaryHeadController");

const router = express.Router();


// ========================================
// GET ALL
// ========================================

router.get(
    "/",
    getSalaryHeads
);


// ========================================
// GET ONE
// ========================================

router.get(
    "/:id",
    getSalaryHead
);


// ========================================
// CREATE
// ========================================

router.post(
    "/",
    createSalaryHead
);


// ========================================
// UPDATE
// ========================================

router.put(
    "/:id",
    updateSalaryHead
);


// ========================================
// DELETE
// ========================================

router.delete(
    "/:id",
    deleteSalaryHead
);


module.exports = router;