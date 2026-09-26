require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const advancePaymentRoutes = require("./routes/advancePaymentRoutes");
const salaryHeadRoutes = require("./routes/salaryHeadRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const payslipComponentRoutes = require("./routes/payslipComponentRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// =====================================
// Middleware
// =====================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key"
    ]
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

// =====================================
// Health Check
// =====================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Payroll Backend API is running",
    version: "1.0.0"
  });
});

// =====================================
// API Routes
// =====================================

// Dashboard
app.use(
  "/api/dashboard",
  dashboardRoutes
);

// Employees
app.use(
  "/api/employees",
  employeeRoutes
);

// Advance Payments
app.use(
  "/api/advance-payments",
  advancePaymentRoutes
);

// Salary Heads
app.use(
  "/api/salary-heads",
  salaryHeadRoutes
);

// Time Sheets
app.use(
  "/api/timesheets",
  timesheetRoutes
);

// Payslips
app.use(
  "/api/payslips",
  payslipRoutes
);

// Payslip Components
app.use(
  "/api/payslip-components",
  payslipComponentRoutes
);

// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});


// =====================================
// Error Handler
// =====================================

app.use(errorMiddleware);

// =====================================
// Start Server
// =====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("       PAYROLL BACKEND SERVER");
  console.log("====================================");
  console.log(` Server:            http://localhost:${PORT}`);
  console.log(` API:               http://localhost:${PORT}/api`);
  console.log(` Dashboard:         http://localhost:${PORT}/api/dashboard`);
  console.log(` Employees:         http://localhost:${PORT}/api/employees`);
  console.log(` Advance Payments:  http://localhost:${PORT}/api/advance-payments`);
  console.log(` Salary Heads:      http://localhost:${PORT}/api/salary-heads`);
  console.log(` Time Sheets:       http://localhost:${PORT}/api/timesheets`);
  console.log(` Payslips:          http://localhost:${PORT}/api/payslips`);
  console.log("====================================");
  console.log(" Server started successfully");
  console.log("====================================");
  console.log("");
});