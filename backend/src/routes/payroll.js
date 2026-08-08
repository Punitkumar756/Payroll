import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import * as c from "../controllers/payrollController.js";

const router = Router();
router.use(authenticate);

// Salary Heads (HR only)
router.get("/salary-heads", requireRole("HR"), c.listSalaryHeads);
router.post("/salary-heads", requireRole("HR"), c.createSalaryHead);
router.put("/salary-heads/:id", requireRole("HR"), c.updateSalaryHead);

// CTC Templates (HR only)
router.get("/ctc-templates", requireRole("HR"), c.listCTCTemplates);
router.post("/ctc-templates", requireRole("HR"), c.createCTCTemplate);

// Payroll Run (HR only)
router.post("/run", requireRole("HR"), c.processPayroll);
router.get("/payslips", requireRole("HR"), c.listPayslipsHR);
router.patch("/payslips/:id/line", requireRole("HR"), c.editPayslipLine);
router.post("/payslips/approve", requireRole("HR"), c.approvePayslips);

// Advances & Deductions (HR only)
router.get("/advances", requireRole("HR"), c.listAdvances);
router.post("/advances", requireRole("HR"), c.createAdvance);

// Loans (HR actions)
router.get("/loans", requireRole("HR"), c.listLoansHR);
router.post("/loans/:id/approve", requireRole("HR"), c.approveLoan);

// Self-service payslips
router.get("/self/payslips", c.getPayslipsSelf);
router.get("/self/payslips/:id/lines", c.getPayslipLinesSelf);
router.get("/self/payslips/:id/pdf", c.downloadPayslipPDF);

// Self-service loans
router.post("/self/loans", c.requestLoan);
router.get("/self/loans", c.getLoansSelf);
router.get("/self/loans/:id/schedule", c.getLoanSchedule);

export default router;
