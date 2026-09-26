import { Router } from "express";
const express = { Router };

const router = express.Router();

import advancePaymentController from "../../controllers/payroll/advancePaymentController.js";
const {
  getAllPayments,
  getPaymentById,
  getOptions,
  createPayment,
  updatePayment,
  deletePayment
} = advancePaymentController;


// Dropdown options
router.get("/options", getOptions);


// Get all
router.get("/", getAllPayments);


// Get one
router.get("/:id", getPaymentById);


// Create
router.post("/", createPayment);


// Update
router.put("/:id", updatePayment);


// Delete
router.delete("/:id", deletePayment);


export default router;