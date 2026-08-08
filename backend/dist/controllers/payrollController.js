"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanSchedule = exports.getLoansSelf = exports.requestLoan = exports.downloadPayslipPDF = exports.getPayslipLinesSelf = exports.getPayslipsSelf = exports.approveLoan = exports.listLoansHR = exports.createAdvance = exports.listAdvances = exports.approvePayslips = exports.editPayslipLine = exports.listPayslipsHR = exports.processPayroll = exports.createCTCTemplate = exports.listCTCTemplates = exports.updateSalaryHead = exports.createSalaryHead = exports.listSalaryHeads = void 0;
const callProcedure_1 = require("../db/callProcedure");
const pdfkit_1 = __importDefault(require("pdfkit"));
// ── SALARY HEADS ──────────────────────────────────────────────
const listSalaryHeads = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_salary_head_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listSalaryHeads = listSalaryHeads;
const createSalaryHead = async (req, res, next) => {
    try {
        const { code, name, head_type, calculation_type, calculation_basis, is_taxable, sort_order } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_salary_head_create', [
            req.user.role, req.user.userId, code, name, head_type,
            calculation_type ?? 'Fixed', calculation_basis ?? null, is_taxable ?? 0, sort_order ?? 0,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.createSalaryHead = createSalaryHead;
const updateSalaryHead = async (req, res, next) => {
    try {
        const b = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_salary_head_update', [
            req.user.role, req.user.userId, parseInt(req.params.id),
            b.code, b.name, b.head_type, b.calculation_type ?? 'Fixed',
            b.calculation_basis ?? null, b.is_taxable ?? 0, b.sort_order ?? 0, b.is_active ?? 1,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateSalaryHead = updateSalaryHead;
// ── CTC TEMPLATES ─────────────────────────────────────────────
const listCTCTemplates = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_ctc_template_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listCTCTemplates = listCTCTemplates;
const createCTCTemplate = async (req, res, next) => {
    try {
        const { code, name, heads } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_ctc_template_create', [
            req.user.role, req.user.userId, code, name, heads ? JSON.stringify(heads) : null,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.createCTCTemplate = createCTCTemplate;
// ── PAYROLL RUN ───────────────────────────────────────────────
const processPayroll = async (req, res, next) => {
    try {
        const { year, month } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_payroll_process_run', [req.user.role, req.user.userId, year, month]));
    }
    catch (e) {
        next(e);
    }
};
exports.processPayroll = processPayroll;
// ── PAYSLIP REVIEW (HR) ───────────────────────────────────────
const listPayslipsHR = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        res.json(await (0, callProcedure_1.callSP)('sp_payslip_list_hr', [req.user.role, (0, callProcedure_1.q)(year), (0, callProcedure_1.q)(month)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listPayslipsHR = listPayslipsHR;
const editPayslipLine = async (req, res, next) => {
    try {
        const { line_id, amount } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_payslip_edit', [req.user.role, req.user.userId, parseInt(req.params.id), line_id, amount]));
    }
    catch (e) {
        next(e);
    }
};
exports.editPayslipLine = editPayslipLine;
const approvePayslips = async (req, res, next) => {
    try {
        const { year, month } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_payslip_approve', [req.user.role, req.user.userId, year, month]));
    }
    catch (e) {
        next(e);
    }
};
exports.approvePayslips = approvePayslips;
// ── ADVANCES ─────────────────────────────────────────────────
const listAdvances = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_advance_list', [req.user.role, (0, callProcedure_1.q)(req.query.employee_id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listAdvances = listAdvances;
const createAdvance = async (req, res, next) => {
    try {
        const { employee_id, type, amount, month, year, description } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_advance_create', [
            req.user.role, req.user.userId, employee_id, type, amount, month, year, description ?? null,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.createAdvance = createAdvance;
// ── LOANS ─────────────────────────────────────────────────────
const listLoansHR = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_loan_list_hr', [req.user.role, (0, callProcedure_1.q)(req.query.status)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listLoansHR = listLoansHR;
const approveLoan = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSPOne)('sp_loan_approve', [req.user.role, req.user.userId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.approveLoan = approveLoan;
// ── SELF: payslips ────────────────────────────────────────────
const getPayslipsSelf = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        res.json(await (0, callProcedure_1.callSP)('sp_payslip_get_self', [req.user.employeeId, (0, callProcedure_1.q)(year), (0, callProcedure_1.q)(month)]));
    }
    catch (e) {
        next(e);
    }
};
exports.getPayslipsSelf = getPayslipsSelf;
const getPayslipLinesSelf = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_payslip_get_lines', [req.user.role, req.user.employeeId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.getPayslipLinesSelf = getPayslipLinesSelf;
const downloadPayslipPDF = async (req, res, next) => {
    try {
        const payslipId = parseInt(req.params.id);
        // Get payslip + lines
        const [payslip] = await (0, callProcedure_1.callSP)('sp_payslip_get_self', [req.user.employeeId, null, null]);
        const lines = await (0, callProcedure_1.callSP)('sp_payslip_get_lines', [req.user.role, req.user.employeeId, payslipId]);
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="payslip-${payslipId}.pdf"`);
        doc.pipe(res);
        // PDF Content
        doc.fontSize(20).text('ANKIT INFOTECH AND SOLUTION', { align: 'center' });
        doc.fontSize(14).text(`Payslip — ${payslip?.pay_period_month}/${payslip?.pay_period_year}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(11).text(`Gross Earnings: ₹${payslip?.gross_earnings}`);
        doc.text(`Total Deductions: ₹${payslip?.total_deductions}`);
        doc.text(`Net Pay: ₹${payslip?.net_pay}`);
        doc.moveDown();
        lines.forEach((line) => {
            doc.text(`${line.head_name || 'Adjustment'}: ₹${line.amount} (${line.head_type})`);
        });
        doc.end();
    }
    catch (e) {
        next(e);
    }
};
exports.downloadPayslipPDF = downloadPayslipPDF;
// ── SELF: loans ───────────────────────────────────────────────
const requestLoan = async (req, res, next) => {
    try {
        const { loan_amount, tenure_months, start_month, start_year, reason } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_loan_request', [
            req.user.role, req.user.employeeId, loan_amount, tenure_months, start_month, start_year, reason ?? null,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.requestLoan = requestLoan;
const getLoansSelf = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_loan_list_self', [req.user.employeeId]));
    }
    catch (e) {
        next(e);
    }
};
exports.getLoansSelf = getLoansSelf;
const getLoanSchedule = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_loan_repayment_schedule', [req.user.role, req.user.employeeId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.getLoanSchedule = getLoanSchedule;
//# sourceMappingURL=payrollController.js.map