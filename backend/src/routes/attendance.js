import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/attendanceController.js";

const router = Router();
const upload = multer({ dest: 'uploads/temp/' });
router.use(authenticate);

// Shifts (HR only)
router.get("/shifts", c.listShifts);
router.post("/shifts", requireRole("HR"), c.createShift);
router.put("/shifts/:id", requireRole("HR"), c.updateShift);
router.post("/shifts/assign", requireRole("HR"), c.assignShift);

// Timecard (HR only)
router.post("/process-timecard", requireRole("HR"), c.processTimecard);
router.post("/manual-update", requireRole("HR"), c.manualAttendance);
router.post("/manual-update/bulk", requireRole("HR"), upload.single("file"), c.bulkManualAttendance);
router.post("/lock", requireRole("HR"), c.lockAttendance);

// Correction requests
router.get("/corrections", requireRole("HR"), c.listCorrectionRequests);
router.post("/corrections/:id/approve", requireRole("HR"), c.approveCorrection);

// Self-service
router.get("/self", c.getAttendanceSelf);
router.post("/self/correction", c.requestCorrection);

export default router;
