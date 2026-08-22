import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/mastersController.js";

const router = Router();
const upload = multer({ dest: 'uploads/temp/' });

// All master routes require authentication; most require HR role
router.use(authenticate);

// Bulk Import
router.post("/import/:entity", requireRole("HR"), upload.single("file"), c.importCSV);

// Locations
router.get("/locations", c.listLocations);
router.post("/locations", requireRole("HR"), c.createLocation);
router.put("/locations/:id", requireRole("HR"), c.updateLocation);
router.delete("/locations/:id", requireRole("HR"), c.deleteLocation);

// Departments
router.get("/departments", c.listDepartments);
router.post("/departments", requireRole("HR"), c.createDepartment);
router.put("/departments/:id", requireRole("HR"), c.updateDepartment);
router.delete("/departments/:id", requireRole("HR"), c.deleteDepartment);

// Designations
router.get("/designations", c.listDesignations);
router.post("/designations", requireRole("HR"), c.createDesignation);
router.put("/designations/:id", requireRole("HR"), c.updateDesignation);
router.delete("/designations/:id", requireRole("HR"), c.deleteDesignation);

// Categories
router.get("/categories", c.listCategories);
router.post("/categories", requireRole("HR"), c.createCategory);
router.put("/categories/:id", requireRole("HR"), c.updateCategory);
router.delete("/categories/:id", requireRole("HR"), c.deleteCategory);

// Groups
router.get("/groups", c.listGroups);
router.post("/groups", requireRole("HR"), c.createGroup);
router.put("/groups/:id", requireRole("HR"), c.updateGroup);

// Sub-groups
router.get("/sub-groups", c.listSubGroups);
router.post("/sub-groups", requireRole("HR"), c.createSubGroup);
router.put("/sub-groups/:id", requireRole("HR"), c.updateSubGroup);

// Calendars
router.get("/calendars", c.listCalendars);
router.post("/calendars", requireRole("HR"), c.createCalendar);
router.put("/calendars/:id", requireRole("HR"), c.updateCalendar);

// Holidays
router.get("/holidays", c.listHolidays);
router.post("/holidays", requireRole("HR"), c.createHoliday);

// Announcements
router.get("/announcements", c.listAnnouncements);
router.post("/announcements", requireRole("HR"), c.createAnnouncement);
router.put("/announcements/:id", requireRole("HR"), c.updateAnnouncement);

export default router;
