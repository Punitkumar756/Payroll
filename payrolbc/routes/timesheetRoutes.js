const express = require("express");

const router = express.Router();

const {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet
} = require("../controllers/timesheetController");

// GET all
router.get("/", getTimesheets);

// GET one
router.get("/:code", getTimesheet);

// CREATE
router.post("/", createTimesheet);

// UPDATE
router.put("/:code", updateTimesheet);

module.exports = router;
