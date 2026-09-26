import { Router } from "express";
const express = { Router };

const router = express.Router();

import DashboardController from "../../controllers/payroll/dashboardController.js";


router.get(
  "/",
  DashboardController.getDashboard
);


export default router;