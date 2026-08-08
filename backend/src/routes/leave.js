import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/leaveController.js";

const router = Router();
router.use(authenticate);

// Leave Types (HR only)
router.get("/types", c.listLeaveTypes);
router.post("/types", requireRole("HR"), c.createLeaveType);
router.put("/types/:id", requireRole("HR"), c.updateLeaveType);

// Leave Policies (HR only)
router.get("/policies", c.listLeavePolicies);
router.post("/policies", requireRole("HR"), c.createLeavePolicy);
router.post("/policies/assign", requireRole("HR"), c.assignLeavePolicy);

// Accrual
router.post("/accrual", requireRole("HR"), c.runAccrual);

// Applications — HR views all
router.get("/applications", requireRole("HR"), c.listLeaveApplicationsHR);
router.post("/apply-behalf", requireRole("HR"), c.applyLeave); // HR on behalf
router.post("/:id/approve", requireRole("HR"), c.approveLeave);
router.post("/:id/reject", requireRole("HR"), c.rejectLeave);

// Self-service (all authenticated users)
router.get("/self/balance", c.getLeaveBalanceSelf);
router.get("/self/applications", c.getLeaveApplicationsSelf);
router.post("/self/apply", c.applyLeave);
router.delete("/self/:id/cancel", c.cancelLeave);

export default router;
