import { callSP, callSPOne, q } from "../db/callProcedure.js";

// ── SHIFTS ────────────────────────────────────────────────────
export const listShifts = async (req, res, next) => {
  try {
    res.json(await callSP("sp_shift_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createShift = async (req, res, next) => {
  try {
    const b = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_shift_create", [
          req.user.role,
          req.user.userId,
          b.code ?? null,
          b.name ?? null,
          b.start_time ?? null,
          b.end_time ?? null,
          b.grace_late_mins ?? 0,
          b.grace_early_mins ?? 0,
          b.ot_eligible ?? 0,
          b.ot_start_after_mins ?? 0,
          b.is_night_shift ?? 0,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateShift = async (req, res, next) => {
  try {
    const b = req.body;
    res.json(
      await callSPOne("sp_shift_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        b.code ?? null,
        b.name ?? null,
        b.start_time ?? null,
        b.end_time ?? null,
        b.grace_late_mins ?? 0,
        b.grace_early_mins ?? 0,
        b.ot_eligible ?? 0,
        b.ot_start_after_mins ?? 0,
        b.is_night_shift ?? 0,
        b.is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── SHIFT ASSIGN ──────────────────────────────────────────────
export const assignShift = async (req, res, next) => {
  try {
    const { employee_ids, shift_id, effective_from, effective_to } = req.body;
    res.json(
      await callSPOne("sp_shift_assign", [
        req.user.role,
        req.user.userId,
        JSON.stringify(employee_ids) ?? null,
        shift_id ?? null,
        effective_from ?? null,
        effective_to ?? null,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── TIMECARD ─────────────────────────────────────────────────
export const processTimecard = async (req, res, next) => {
  try {
    const { employee_ids, from_date, to_date, overwrite_manual } = req.body;
    res.json(
      await callSPOne("sp_attendance_process_timecard", [
        req.user.role,
        req.user.userId,
        JSON.stringify(employee_ids) ?? null,
        from_date ?? null,
        to_date ?? null,
        overwrite_manual ?? 0,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── MANUAL UPDATE ─────────────────────────────────────────────

/**
 * Converts a plain time string (HH:MM or HH:MM:SS) into a full MySQL DATETIME
 * string (YYYY-MM-DD HH:MM:SS) by combining it with the given date.
 * Returns null if either argument is falsy.
 */
function toDatetime(date, time) {
  if (!date || !time) return null;
  // Normalise to HH:MM:SS
  const timePart = time.length === 5 ? `${time}:00` : time;
  return `${date} ${timePart}`;
}

export const manualAttendance = async (req, res, next) => {
  try {
    const {
      employee_id,
      attendance_date,
      day_status,
      check_in,
      check_out,
      remarks,
    } = req.body;

    // SP expects DATETIME ('YYYY-MM-DD HH:MM:SS'), not bare time strings
    const checkInDt  = toDatetime(attendance_date, check_in);
    const checkOutDt = toDatetime(attendance_date, check_out);

    res.json(
      await callSPOne("sp_attendance_manual_update", [
        req.user.role,
        req.user.userId,
        employee_id   ?? null,
        attendance_date ?? null,
        day_status    ?? null,
        checkInDt,
        checkOutDt,
        remarks       ?? null,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── LOCK PERIOD ───────────────────────────────────────────────
export const lockAttendance = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.body;
    res.json(
      await callSPOne("sp_attendance_lock_period", [
        req.user.role,
        req.user.userId,
        from_date ?? null,
        to_date ?? null,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── CORRECTION REQUESTS ───────────────────────────────────────
export const listCorrectionRequests = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_correction_requests_list", [
        req.user.role,
        q(req.query.status),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const approveCorrection = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    res.json(
      await callSPOne("sp_correction_approve", [
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

// ── SELF ──────────────────────────────────────────────────────
export const getAttendanceSelf = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    res.json(
      await callSP("sp_attendance_get_self", [
        req.user.role,
        req.user.employeeId,
        q(from_date),
        q(to_date),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const requestCorrection = async (req, res, next) => {
  try {
    const { attendance_date, requested_check_in, requested_check_out, reason } =
      req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_attendance_request_correction", [
          req.user.role,
          req.user.employeeId,
          req.user.userId,
          attendance_date ?? null,
          requested_check_in ?? null,
          requested_check_out ?? null,
          reason ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
