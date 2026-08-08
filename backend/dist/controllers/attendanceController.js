"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCorrection = exports.getAttendanceSelf = exports.approveCorrection = exports.listCorrectionRequests = exports.lockAttendance = exports.manualAttendance = exports.processTimecard = exports.assignShift = exports.updateShift = exports.createShift = exports.listShifts = void 0;
const callProcedure_1 = require("../db/callProcedure");
// ── SHIFTS ────────────────────────────────────────────────────
const listShifts = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_shift_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listShifts = listShifts;
const createShift = async (req, res, next) => {
    try {
        const b = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_shift_create', [
            req.user.role, req.user.userId,
            b.code, b.name, b.start_time, b.end_time,
            b.grace_late_mins ?? 0, b.grace_early_mins ?? 0,
            b.ot_eligible ?? 0, b.ot_start_after_mins ?? 0, b.is_night_shift ?? 0,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.createShift = createShift;
const updateShift = async (req, res, next) => {
    try {
        const b = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_shift_update', [
            req.user.role, req.user.userId, parseInt(req.params.id),
            b.code, b.name, b.start_time, b.end_time,
            b.grace_late_mins ?? 0, b.grace_early_mins ?? 0,
            b.ot_eligible ?? 0, b.ot_start_after_mins ?? 0,
            b.is_night_shift ?? 0, b.is_active ?? 1,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateShift = updateShift;
// ── SHIFT ASSIGN ──────────────────────────────────────────────
const assignShift = async (req, res, next) => {
    try {
        const { employee_ids, shift_id, effective_from, effective_to } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_shift_assign', [
            req.user.role, req.user.userId,
            JSON.stringify(employee_ids), shift_id, effective_from, effective_to ?? null,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.assignShift = assignShift;
// ── TIMECARD ─────────────────────────────────────────────────
const processTimecard = async (req, res, next) => {
    try {
        const { employee_ids, from_date, to_date, overwrite_manual } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_attendance_process_timecard', [
            req.user.role, req.user.userId,
            JSON.stringify(employee_ids), from_date, to_date, overwrite_manual ?? 0,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.processTimecard = processTimecard;
// ── MANUAL UPDATE ─────────────────────────────────────────────
const manualAttendance = async (req, res, next) => {
    try {
        const { employee_id, attendance_date, day_status, check_in, check_out, remarks } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_attendance_manual_update', [
            req.user.role, req.user.userId, employee_id, attendance_date,
            day_status, check_in ?? null, check_out ?? null, remarks ?? null,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.manualAttendance = manualAttendance;
// ── LOCK PERIOD ───────────────────────────────────────────────
const lockAttendance = async (req, res, next) => {
    try {
        const { from_date, to_date } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_attendance_lock_period', [req.user.role, req.user.userId, from_date, to_date]));
    }
    catch (e) {
        next(e);
    }
};
exports.lockAttendance = lockAttendance;
// ── CORRECTION REQUESTS ───────────────────────────────────────
const listCorrectionRequests = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_correction_requests_list', [req.user.role, (0, callProcedure_1.q)(req.query.status)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listCorrectionRequests = listCorrectionRequests;
const approveCorrection = async (req, res, next) => {
    try {
        const { remarks } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_correction_approve', [req.user.role, req.user.userId, parseInt(req.params.id), remarks ?? null]));
    }
    catch (e) {
        next(e);
    }
};
exports.approveCorrection = approveCorrection;
// ── SELF ──────────────────────────────────────────────────────
const getAttendanceSelf = async (req, res, next) => {
    try {
        const { from_date, to_date } = req.query;
        res.json(await (0, callProcedure_1.callSP)('sp_attendance_get_self', [
            req.user.role, req.user.employeeId,
            (0, callProcedure_1.q)(from_date), (0, callProcedure_1.q)(to_date),
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.getAttendanceSelf = getAttendanceSelf;
const requestCorrection = async (req, res, next) => {
    try {
        const { attendance_date, requested_check_in, requested_check_out, reason } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_attendance_request_correction', [
            req.user.role, req.user.employeeId, req.user.userId,
            attendance_date, requested_check_in ?? null, requested_check_out ?? null, reason,
        ]));
    }
    catch (e) {
        next(e);
    }
};
exports.requestCorrection = requestCorrection;
//# sourceMappingURL=attendanceController.js.map