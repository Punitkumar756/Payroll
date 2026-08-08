import { callSP, callSPOne, q } from "../db/callProcedure.js";

// ── LEAVE TYPES ───────────────────────────────────────────────
export const listLeaveTypes = async (req, res, next) => {
  try {
    res.json(await callSP("sp_leave_type_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createLeaveType = async (req, res, next) => {
  try {
    const {
      code,
      name,
      is_paid,
      allow_carry_forward,
      max_carry_forward,
      allow_negative,
      requires_document,
    } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_leave_type_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          is_paid ?? 1,
          allow_carry_forward ?? 0,
          max_carry_forward ?? 0,
          allow_negative ?? 0,
          requires_document ?? 0,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateLeaveType = async (req, res, next) => {
  try {
    const b = req.body;
    res.json(
      await callSPOne("sp_leave_type_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        b.code,
        b.name,
        b.is_paid ?? 1,
        b.allow_carry_forward ?? 0,
        b.max_carry_forward ?? 0,
        b.allow_negative ?? 0,
        b.requires_document ?? 0,
        b.is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── LEAVE POLICIES ────────────────────────────────────────────
export const listLeavePolicies = async (req, res, next) => {
  try {
    res.json(await callSP("sp_leave_policy_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createLeavePolicy = async (req, res, next) => {
  try {
    const { code, name, accrual_frequency, types } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_leave_policy_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          accrual_frequency ?? "None",
          types ? JSON.stringify(types) : null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const assignLeavePolicy = async (req, res, next) => {
  try {
    const { employee_id, policy_id, effective_from } = req.body;
    res.json(
      await callSPOne("sp_leave_policy_assign", [
        req.user.role,
        req.user.userId,
        employee_id,
        policy_id,
        effective_from,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── ACCRUAL RUN ───────────────────────────────────────────────
export const runAccrual = async (req, res, next) => {
  try {
    const { year, period } = req.body;
    res.json(
      await callSPOne("sp_leave_accrual_run", [
        req.user.role,
        req.user.userId,
        year,
        period,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── APPLY ─────────────────────────────────────────────────────
export const applyLeave = async (req, res, next) => {
  try {
    const { target_employee_id, leave_type_id, start_date, end_date, reason } =
      req.body;
    // For employees, target_employee_id is ignored (SP enforces own-record-only)
    res
      .status(201)
      .json(
        await callSPOne("sp_leave_apply", [
          req.user.role,
          req.user.employeeId ?? 0,
          req.user.userId,
          target_employee_id ?? req.user.employeeId ?? 0,
          leave_type_id,
          start_date,
          end_date,
          reason ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};

// ── APPROVE / REJECT ──────────────────────────────────────────
export const approveLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    res.json(
      await callSPOne("sp_leave_approve", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        remarks ?? null,
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const rejectLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    res.json(
      await callSPOne("sp_leave_reject", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        remarks ?? null,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── HR: all applications ──────────────────────────────────────
export const listLeaveApplicationsHR = async (req, res, next) => {
  try {
    const { status, from_date, to_date } = req.query;
    res.json(
      await callSP("sp_leave_get_applications_hr", [
        req.user.role,
        q(status),
        q(from_date),
        q(to_date),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── SELF ──────────────────────────────────────────────────────
export const getLeaveBalanceSelf = async (req, res, next) => {
  try {
    const year = q(req.query.year) ?? new Date().getFullYear();
    res.json(
      await callSP("sp_leave_get_balance_self", [req.user.employeeId, year]),
    );
  } catch (e) {
    next(e);
  }
};
export const getLeaveApplicationsSelf = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_leave_get_applications_self", [
        req.user.employeeId,
        q(req.query.status),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const cancelLeave = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_leave_cancel", [
        req.user.role,
        req.user.employeeId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
