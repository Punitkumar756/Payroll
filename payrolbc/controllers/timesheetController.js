const Timesheet = require("../model/timesheetModel");

const getTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.getAllTimesheets();

    res.status(200).json({
      success: true,
      timesheets
    });
  } catch (error) {
    console.error("GET TIMESHEETS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch timesheets",
      error: error.message
    });
  }
};

const getTimesheet = async (req, res) => {
  try {
    const { code } = req.params;

    const timesheet = await Timesheet.getTimesheetByCode(code);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found"
      });
    }

    res.status(200).json(timesheet);
  } catch (error) {
    console.error("GET TIMESHEET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch timesheet",
      error: error.message
    });
  }
};

const createTimesheet = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee name is required"
      });
    }

    if (!data.dept) {
      return res.status(400).json({
        success: false,
        message: "Department is required"
      });
    }

    const timesheet = await Timesheet.createTimesheet(data);

    res.status(201).json(timesheet);
  } catch (error) {
    console.error("CREATE TIMESHEET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create timesheet",
      error: error.message
    });
  }
};

const updateTimesheet = async (req, res) => {
  try {
    const { code } = req.params;

    const existing = await Timesheet.getTimesheetByCode(code);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Timesheet ${code} not found`
      });
    }

    const updated = await Timesheet.updateTimesheet(
      code,
      req.body
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE TIMESHEET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update timesheet",
      error: error.message
    });
  }
};

module.exports = {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet
};