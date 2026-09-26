const express = require("express");

const router = express.Router();

const EmployeeController =
  require("../controllers/employeeController");


// GET all employees
// /api/employees
router.get(
  "/",
  EmployeeController.getEmployees
);


// GET single employee
// /api/employees/EMP001
router.get(
  "/:id",
  EmployeeController.getEmployee
);


// ADD employee
// POST /api/employees
router.post(
  "/",
  EmployeeController.createEmployee
);


// UPDATE employee
// PUT /api/employees/EMP001
router.put(
  "/:id",
  EmployeeController.updateEmployee
);


// DELETE employee
// DELETE /api/employees/EMP001
router.delete(
  "/:id",
  EmployeeController.deleteEmployee
);


module.exports = router;