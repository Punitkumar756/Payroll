"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const requireRole_1 = require("../middleware/requireRole");
const c = __importStar(require("../controllers/payrollController"));
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// Salary Heads (HR only)
router.get('/salary-heads', (0, requireRole_1.requireRole)('HR'), c.listSalaryHeads);
router.post('/salary-heads', (0, requireRole_1.requireRole)('HR'), c.createSalaryHead);
router.put('/salary-heads/:id', (0, requireRole_1.requireRole)('HR'), c.updateSalaryHead);
// CTC Templates (HR only)
router.get('/ctc-templates', (0, requireRole_1.requireRole)('HR'), c.listCTCTemplates);
router.post('/ctc-templates', (0, requireRole_1.requireRole)('HR'), c.createCTCTemplate);
// Payroll Run (HR only)
router.post('/run', (0, requireRole_1.requireRole)('HR'), c.processPayroll);
router.get('/payslips', (0, requireRole_1.requireRole)('HR'), c.listPayslipsHR);
router.patch('/payslips/:id/line', (0, requireRole_1.requireRole)('HR'), c.editPayslipLine);
router.post('/payslips/approve', (0, requireRole_1.requireRole)('HR'), c.approvePayslips);
// Advances & Deductions (HR only)
router.get('/advances', (0, requireRole_1.requireRole)('HR'), c.listAdvances);
router.post('/advances', (0, requireRole_1.requireRole)('HR'), c.createAdvance);
// Loans (HR actions)
router.get('/loans', (0, requireRole_1.requireRole)('HR'), c.listLoansHR);
router.post('/loans/:id/approve', (0, requireRole_1.requireRole)('HR'), c.approveLoan);
// Self-service payslips
router.get('/self/payslips', c.getPayslipsSelf);
router.get('/self/payslips/:id/lines', c.getPayslipLinesSelf);
router.get('/self/payslips/:id/pdf', c.downloadPayslipPDF);
// Self-service loans
router.post('/self/loans', c.requestLoan);
router.get('/self/loans', c.getLoansSelf);
router.get('/self/loans/:id/schedule', c.getLoanSchedule);
exports.default = router;
//# sourceMappingURL=payroll.js.map