import { callSP, callSPOne, q } from "../db/callProcedure.js";

export const listCalendars = async (req, res, next) => {
  try {
    const { search, status, year } = req.query;
    const data = await callSP("sp_calendar_list", [
      req.user.role,
      q(search),
      q(status),
      year ? parseInt(year) : null,
    ]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const getCalendar = async (req, res, next) => {
  try {
    const calendar = await callSPOne("sp_calendar_get", [
      req.user.role,
      parseInt(req.params.id),
    ]);
    if (!calendar)
      return res.status(404).json({ error: "NOT_FOUND", detail: "Calendar not found" });
    res.json(calendar);
  } catch (e) {
    next(e);
  }
};

export const createCalendar = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_calendar_create", [
      req.user.role,
      req.user.userId,
      b.calendar_code,
      b.calendar_name,
      b.year,
      b.location_id ?? null,
      b.description ?? null,
      b.status ?? "Active",
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateCalendar = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_calendar_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      b.calendar_name,
      b.year,
      b.location_id ?? null,
      b.description ?? null,
      b.status ?? "Active",
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const deleteCalendar = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_calendar_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getHolidays = async (req, res, next) => {
  try {
    const data = await callSP("sp_calendar_holidays_get", [
      req.user.role,
      parseInt(req.params.id),
    ]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const upsertHoliday = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_calendar_holiday_upsert", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      b.holiday_id ?? null, // if creating, send null/0
      b.holiday_date,
      b.holiday_name,
      b.holiday_type ?? 'National',
      b.is_optional ? 1 : 0,
      b.description ?? null,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_calendar_holiday_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      parseInt(req.params.holidayId),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getWeeklyOffs = async (req, res, next) => {
  try {
    const data = await callSP("sp_calendar_weekly_offs_get", [
      req.user.role,
      parseInt(req.params.id),
    ]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const updateWeeklyOffs = async (req, res, next) => {
  try {
    const { weekly_offs } = req.body;
    const result = await callSPOne("sp_calendar_weekly_offs_save", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      JSON.stringify(weekly_offs),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getOverrides = async (req, res, next) => {
  try {
    const data = await callSP("sp_calendar_overrides_get", [
      req.user.role,
      parseInt(req.params.id),
    ]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const upsertOverride = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_calendar_override_upsert", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      b.date,
      b.override_status,
      b.reason,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const deleteOverride = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_calendar_override_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      req.params.date,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};
