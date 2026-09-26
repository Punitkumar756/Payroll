import { Router } from "express";
const express = { Router };

const router = express.Router();

import timesheetController from "../../controllers/payroll/timesheetController.js";
const {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet
} = timesheetController;

// GET all
router.get("/", getTimesheets);

// GET one
router.get("/:code", getTimesheet);

// CREATE
router.post("/", createTimesheet);

// UPDATE
router.put("/:code", updateTimesheet);

export default router;
