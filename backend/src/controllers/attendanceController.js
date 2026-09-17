import fs from "fs";
import csv from "csv-parser";
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

export const getShiftAssignmentReport = async (req, res, next) => {
  try {
    const { shift_id, employee_id, from_date, to_date } = req.query;
    res.json(
      await callSP("sp_shift_assignment_report", [
        req.user.role,
        shift_id || null,
        employee_id || null,
        from_date || null,
        to_date || null,
      ])
    );
  } catch (e) {
    next(e);
  }
};

export const bulkAssignShift = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No CSV file uploaded." });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const row of results) {
          try {
            const empId = parseInt(row.employee_id);
            if (!empId) throw new Error("Missing or invalid employee_id");
            const shiftId = parseInt(row.shift_id);
            if (!shiftId) throw new Error("Missing or invalid shift_id");
            const effectiveFrom = row.effective_from;
            if (!effectiveFrom) throw new Error("Missing or invalid effective_from");

            await callSPOne("sp_shift_assign", [
              req.user.role,
              req.user.userId,
              JSON.stringify([empId]),
              shiftId,
              effectiveFrom,
              row.effective_to || null,
            ]);
            successCount++;
          } catch (err) {
            failCount++;
            errors.push(`Row Error (Emp ${row.employee_id || '?'}): ${err.message}`);
          }
        }
        
        fs.unlinkSync(req.file.path);
        res.json({
          message: "Import complete",
          successCount,
          failCount,
          errors: errors.slice(0, 10)
        });
      });
  } catch (e) {
    if (req.file) fs.unlinkSync(req.file.path);
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
  // If date is 8 consecutive digits (YYYYMMDD), convert to YYYY-MM-DD
  let parsedDate = date;
  if (/^\d{8}$/.test(date)) {
    parsedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
  
  let parsedTime = time;
  if (/^\d{4}$/.test(time)) { // HHMM
    parsedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}:00`;
  } else if (/^\d{6}$/.test(time)) { // HHMMSS
    parsedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
  } else if (time.length === 5) {
    parsedTime = `${time}:00`;
  }
  
  return `${parsedDate} ${parsedTime}`;
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

    const checkInDt = toDatetime(attendance_date, requested_check_in);
    const checkOutDt = toDatetime(attendance_date, requested_check_out);

    res
      .status(201)
      .json(
        await callSPOne("sp_attendance_request_correction", [
          req.user.role,
          req.user.employeeId,
          req.user.userId,
          attendance_date ?? null,
          checkInDt,
          checkOutDt,
          reason ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};

export const getDailyAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split("T")[0];

    res.json(
      await callSP("sp_attendance_daily_list", [
        req.user.role,
        targetDate,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const selfPunch = async (req, res, next) => {
  try {
    const { type, lat, lng } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ detail: "Photo is required for punch" });
    }
    if (!lat || !lng) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ detail: "Location (latitude and longitude) is required" });
    }

    const employeeLat = parseFloat(lat);
    const employeeLng = parseFloat(lng);

    // 1. Get Employee's Site Geofence
    const [site] = await callSP("sp_employee_get_site_geofence", [req.user.employeeId]);
    
    if (!site || !site.id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ detail: "You are not assigned to any site. Cannot punch." });
    }
    
    if (!site.lat || !site.lng || !site.radius) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ detail: "Your assigned site does not have geofencing configured." });
    }

    // 2. Validate Distance
    const distance = getDistanceFromLatLonInM(site.lat, site.lng, employeeLat, employeeLng);
    
    if (distance > site.radius) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ 
        detail: `You are too far from your assigned site. Distance: ${Math.round(distance)}m, Allowed: ${site.radius}m`
      });
    }

    // 3. Save Punch
    const photoUrl = `/uploads/attendance/${req.file.filename}`;
    const result = await callSPOne("sp_attendance_self_punch", [
      req.user.employeeId,
      type === 'OUT' ? 'CHECK_OUT' : 'CHECK_IN',
      photoUrl,
      employeeLat,
      employeeLng
    ]);

    res.json({ message: "Punch recorded successfully", result });
  } catch (e) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(e);
  }
};

// ── BULK MANUAL UPDATE ──────────────────────────────────────────
export const bulkManualAttendance = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No CSV file uploaded." });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const row of results) {
          try {
            const empId = parseInt(row.employee_id);
            if (!empId) throw new Error("Missing or invalid employee_id");

            const checkInDt = toDatetime(row.attendance_date, row.check_in);
            const checkOutDt = toDatetime(row.attendance_date, row.check_out);

            await callSPOne("sp_attendance_manual_update", [
              req.user.role,
              req.user.userId,
              empId,
              row.attendance_date || null,
              row.day_status || null,
              checkInDt,
              checkOutDt,
              row.remarks || null,
            ]);
            successCount++;
          } catch (err) {
            failCount++;
            errors.push(`Row Error (Emp ${row.employee_id || '?'} on ${row.attendance_date || '?'}): ${err.message}`);
          }
        }
        
        fs.unlinkSync(req.file.path);
        res.json({
          message: "Import complete",
          successCount,
          failCount,
          errors: errors.slice(0, 10)
        });
      });
  } catch (e) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(e);
  }
};
