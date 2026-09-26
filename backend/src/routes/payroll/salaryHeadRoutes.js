import { Router } from "express";
const express = { Router };

import salaryHeadController from "../../controllers/payroll/salaryHeadController.js";
const {
    getSalaryHeads,
    getSalaryHead,
    createSalaryHead,
    updateSalaryHead,
    deleteSalaryHead
} = salaryHeadController;

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


export default router;