const express = require("express");

const router = express.Router();

const {
  getAllPayments,
  getPaymentById,
  getOptions,
  createPayment,
  updatePayment,
  deletePayment
} = require("../controllers/advancePaymentController");


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


module.exports = router;