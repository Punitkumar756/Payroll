import { callSP, callSPOne, q } from "../db/callProcedure.js";
import PDFDocument from "pdfkit";

// ── SALARY HEADS ──────────────────────────────────────────────
export const listSalaryHeads = async (req, res, next) => {
  try {
    res.json(await callSP("sp_salary_head_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createSalaryHead = async (req, res, next) => {
  try {
    const {
      code,
      name,
      head_type,
      calculation_type,
      calculation_basis,
      is_taxable,
      sort_order,
    } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_salary_head_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          head_type,
          calculation_type ?? "Fixed",
          calculation_basis ?? null,
          is_taxable ?? 0,
          sort_order ?? 0,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateSalaryHead = async (req, res, next) => {
  try {
    const b = req.body;
    res.json(
      await callSPOne("sp_salary_head_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        b.code,
        b.name,
        b.head_type,
        b.calculation_type ?? "Fixed",
        b.calculation_basis ?? null,
        b.is_taxable ?? 0,
        b.sort_order ?? 0,
        b.is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── CTC TEMPLATES ─────────────────────────────────────────────
export const listCTCTemplates = async (req, res, next) => {
  try {
    res.json(await callSP("sp_ctc_template_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createCTCTemplate = async (req, res, next) => {
  try {
    const { code, name, heads } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_ctc_template_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          heads ? JSON.stringify(heads) : null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};

// ── PAYROLL RUN ───────────────────────────────────────────────
export const processPayroll = async (req, res, next) => {
  try {
    const { year, month } = req.body;
    res.json(
      await callSPOne("sp_payroll_process_run", [
        req.user.role,
        req.user.userId,
        year,
        month,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── PAYSLIP REVIEW (HR) ───────────────────────────────────────
export const listPayslipsHR = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    res.json(
      await callSP("sp_payslip_list_hr", [req.user.role, q(year), q(month)]),
    );
  } catch (e) {
    next(e);
  }
};
export const editPayslipLine = async (req, res, next) => {
  try {
    const { line_id, amount } = req.body;
    res.json(
      await callSPOne("sp_payslip_edit", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        line_id,
        amount,
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const approvePayslips = async (req, res, next) => {
  try {
    const { year, month } = req.body;
    res.json(
      await callSPOne("sp_payslip_approve", [
        req.user.role,
        req.user.userId,
        year,
        month,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── ADVANCES ─────────────────────────────────────────────────
export const listAdvances = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_advance_list", [
        req.user.role,
        q(req.query.employee_id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const createAdvance = async (req, res, next) => {
  try {
    const { employee_id, type, amount, month, year, description } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_advance_create", [
          req.user.role,
          req.user.userId,
          employee_id,
          type,
          amount,
          month,
          year,
          description ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};

// ── LOANS ─────────────────────────────────────────────────────
export const listLoansHR = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_loan_list_hr", [req.user.role, q(req.query.status)]),
    );
  } catch (e) {
    next(e);
  }
};
export const approveLoan = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_loan_approve", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── SELF: payslips ────────────────────────────────────────────
export const getPayslipsSelf = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    res.json(
      await callSP("sp_payslip_get_self", [
        req.user.employeeId,
        q(year),
        q(month),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

export const getPayslipLinesSelf = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_payslip_get_lines", [
        req.user.role,
        req.user.employeeId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

export const downloadPayslipPDF = async (req, res, next) => {
  try {
    const payslipId = parseInt(req.params.id);
    // Get payslip + lines
    const [payslip] = await callSP("sp_payslip_get_self", [
      req.user.employeeId,
      null,
      null,
    ]);
    const lines = await callSP("sp_payslip_get_lines", [
      req.user.role,
      req.user.employeeId,
      payslipId,
    ]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payslip-${payslipId}.pdf"`,
    );
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text("ANKIT INFOTECH AND SOLUTION", { align: "center" });
    doc
      .fontSize(14)
      .text(
        `Payslip — ${payslip?.pay_period_month}/${payslip?.pay_period_year}`,
        { align: "center" },
      );
    doc.moveDown();
    doc.fontSize(11).text(`Gross Earnings: ₹${payslip?.gross_earnings}`);
    doc.text(`Total Deductions: ₹${payslip?.total_deductions}`);
    doc.text(`Net Pay: ₹${payslip?.net_pay}`);
    doc.moveDown();

    lines.forEach((line) => {
      doc.text(
        `${line.head_name || "Adjustment"}: ₹${line.amount} (${line.head_type})`,
      );
    });

    doc.end();
  } catch (e) {
    next(e);
  }
};

// ── SELF: loans ───────────────────────────────────────────────
export const requestLoan = async (req, res, next) => {
  try {
    const { loan_amount, tenure_months, start_month, start_year, reason } =
      req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_loan_request", [
          req.user.role,
          req.user.employeeId,
          loan_amount,
          tenure_months,
          start_month,
          start_year,
          reason ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const getLoansSelf = async (req, res, next) => {
  try {
    res.json(await callSP("sp_loan_list_self", [req.user.employeeId]));
  } catch (e) {
    next(e);
  }
};
export const getLoanSchedule = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_loan_repayment_schedule", [
        req.user.role,
        req.user.employeeId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
