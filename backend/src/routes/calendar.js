import { Router } from "express";
import { authenticate as requireAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/calendarController.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("HR", "Manager", "Employee"), c.listCalendars);
router.post("/", requireRole("HR"), c.createCalendar);
router.get("/:id", requireRole("HR", "Manager", "Employee"), c.getCalendar);
router.put("/:id", requireRole("HR"), c.updateCalendar);
router.delete("/:id", requireRole("HR"), c.deleteCalendar);

router.get("/:id/holidays", requireRole("HR", "Manager", "Employee"), c.getHolidays);
router.post("/:id/holidays", requireRole("HR"), c.upsertHoliday); // Using post for upserting single holiday
router.delete("/:id/holidays/:holidayId", requireRole("HR"), c.deleteHoliday);

router.get("/:id/weekly-offs", requireRole("HR", "Manager", "Employee"), c.getWeeklyOffs);
router.put("/:id/weekly-offs", requireRole("HR"), c.updateWeeklyOffs);

router.get("/:id/dates", requireRole("HR", "Manager", "Employee"), c.getOverrides);
router.post("/:id/dates", requireRole("HR"), c.upsertOverride);
router.delete("/:id/dates/:date", requireRole("HR"), c.deleteOverride);

export default router;
