import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/employeeController.js";

const router = Router();
router.use(authenticate);

// HR-only: full employee list and CRUD
router.get("/", requireRole("HR"), c.listEmployees);
router.post("/", requireRole("HR"), c.createEmployee);
router.get("/:id", c.getEmployee); // SP enforces own-record for Employee role
router.put("/:id", requireRole("HR"), c.updateEmployee);
router.patch("/:id/status", requireRole("HR"), c.updateEmployeeStatus);
router.put("/:id/statutory", requireRole("HR"), c.updateStatutory);
router.post("/:id/user", requireRole("HR"), c.createUserForEmployee);
router.post("/:id/ctc", requireRole("HR"), c.assignCTC);
router.delete("/:id", requireRole("HR"), c.deleteEmployee);

// Self-service: restricted update
router.patch("/self/profile", c.selfUpdateEmployee);

// Users & Roles (HR only)
router.get("/users/list", requireRole("HR"), c.listUsers);
router.patch("/users/:id/activate", requireRole("HR"), c.activateUser);
router.patch("/users/:id/deactivate", requireRole("HR"), c.deactivateUser);
router.patch("/users/:id/role", requireRole("HR"), c.assignRole);

export default router;
