import { Router } from "express";
import { assignTask, getTasksByEmployeeId, getAllTasks, updateTaskStatus, updateSelfTaskStatus } from "../controllers/tasksController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Assign a task - Only HR/Admin can do this
router.post("/", requireRole("HR", "Admin"), assignTask);

// Get all tasks - Only HR/Admin can do this
router.get("/", requireRole("HR", "Admin"), getAllTasks);

// Update task status - Only HR/Admin can do this
router.patch("/:id/status", requireRole("HR", "Admin"), updateTaskStatus);

// Update self task status - Any logged in employee
router.patch("/self/:id/status", updateSelfTaskStatus);

// Get tasks for an employee - Both the employee and Admin/HR can view tasks
router.get("/employee/:id", getTasksByEmployeeId);

export default router;
