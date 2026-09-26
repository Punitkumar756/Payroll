const AdvancePayment = require("../model/advancePaymentModel");


// GET /api/advance-payments
const getAllPayments = async (req, res, next) => {
  try {

    const payments = await AdvancePayment.getAll();

    res.status(200).json({
      success: true,
      payments
    });

  } catch (error) {
    next(error);
  }
};


// GET /api/advance-payments/options
const getOptions = async (req, res, next) => {
  try {

    const options = await AdvancePayment.getOptions();

    res.status(200).json({
      success: true,
      ...options
    });

  } catch (error) {
    next(error);
  }
};


// GET /api/advance-payments/:id
const getPaymentById = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }

    const payment = await AdvancePayment.getById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Advance payment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    next(error);
  }
};


// POST /api/advance-payments
const createPayment = async (req, res, next) => {
  try {

    const {
      employee,
      financialYear,
      payPeriod,
      item,
      remarks,
      amount
    } = req.body;


    // Validation
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee is required"
      });
    }

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Financial year is required"
      });
    }

    if (!payPeriod) {
      return res.status(400).json({
        success: false,
        message: "Pay period is required"
      });
    }

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item is required"
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }


    const payment = await AdvancePayment.create({
      employee,
      financialYear,
      payPeriod,
      item,
      remarks,
      amount: Number(amount)
    });


    res.status(201).json({
      success: true,
      message: "Advance payment created successfully",
      data: payment
    });

  } catch (error) {
    next(error);
  }
};


// PUT /api/advance-payments/:id
const updatePayment = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }


    const {
      employee,
      financialYear,
      payPeriod,
      item,
      remarks,
      amount
    } = req.body;


    if (!employee || !financialYear || !payPeriod || !item) {
      return res.status(400).json({
        success: false,
        message: "Employee, financial year, pay period and item are required"
      });
    }


    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }


    const payment = await AdvancePayment.update(id, {
      employee,
      financialYear,
      payPeriod,
      item,
      remarks,
      amount: Number(amount)
    });


    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Advance payment not found"
      });
    }


    res.status(200).json({
      success: true,
      message: "Advance payment updated successfully",
      data: payment
    });

  } catch (error) {
    next(error);
  }
};


// DELETE /api/advance-payments/:id
const deletePayment = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }


    const deleted = await AdvancePayment.remove(id);


    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Advance payment not found"
      });
    }


    res.status(200).json({
      success: true,
      message: "Advance payment deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllPayments,
  getPaymentById,
  getOptions,
  createPayment,
  updatePayment,
  deletePayment
};