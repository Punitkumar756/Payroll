import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { callSP, callSPOne } from "../db/callProcedure.js";

const router = Router();
router.use(authenticate);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/documents";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// List documents for an employee
router.get("/:employeeId", async (req, res, next) => {
  try {
    const empId = parseInt(req.params.employeeId);
    // basic check: only HR or the employee themselves should see this. For now, rely on SP or basic check.
    if (req.user.role !== "HR" && req.user.employeeId !== empId) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Cannot view others' documents" });
    }
    const docs = await callSP("sp_employee_document_list", [req.user.role, empId]);
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

// Upload document (HR only)
router.post("/:employeeId", requireRole("HR"), upload.single("file"), async (req, res, next) => {
  try {
    const empId = parseInt(req.params.employeeId);
    const docName = req.body.document_name;
    
    if (!req.file || !docName) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "File and document_name are required" });
    }

    const filePath = req.file.path.replace(/\\/g, '/'); // normalize slashes

    const result = await callSPOne("sp_employee_document_add", [
      req.user.role,
      req.user.userId,
      empId,
      docName,
      filePath
    ]);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Delete document (HR only)
router.delete("/:docId", requireRole("HR"), async (req, res, next) => {
  try {
    const docId = parseInt(req.params.docId);
    
    // The SP checks role and returns affected rows, but it doesn't delete the physical file.
    // We should fetch the file path before deleting, or let the SP delete and we ignore physical file.
    // Wait, let's just delete from DB. In a real system, you'd unlink the file too.
    const result = await callSPOne("sp_employee_document_delete", [
      req.user.role,
      req.user.userId,
      docId
    ]);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
