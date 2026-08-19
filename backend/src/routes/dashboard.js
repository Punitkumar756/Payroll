import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { getHRMetrics, getHRCharts, getEmployeeDashboard } from "../controllers/dashboardController.js";

const router = Router();
router.use(authenticate);

router.get("/metrics", requireRole("HR"), getHRMetrics);
router.get("/charts", requireRole("HR"), getHRCharts);
router.get("/employee", getEmployeeDashboard);

export default router;
