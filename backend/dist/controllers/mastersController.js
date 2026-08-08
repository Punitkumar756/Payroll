"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnnouncement = exports.listAnnouncements = exports.createHoliday = exports.listHolidays = exports.updateCalendar = exports.createCalendar = exports.listCalendars = exports.updateSubGroup = exports.createSubGroup = exports.listSubGroups = exports.updateGroup = exports.createGroup = exports.listGroups = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = exports.deleteDesignation = exports.updateDesignation = exports.createDesignation = exports.listDesignations = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.listDepartments = exports.deleteLocation = exports.updateLocation = exports.createLocation = exports.listLocations = void 0;
const callProcedure_1 = require("../db/callProcedure");
// ── LOCATIONS ─────────────────────────────────────────────────
const listLocations = async (req, res, next) => {
    try {
        const data = await (0, callProcedure_1.callSP)('sp_master_location_list', [(0, callProcedure_1.q)(req.user.role)]);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
};
exports.listLocations = listLocations;
const createLocation = async (req, res, next) => {
    try {
        const { code, name, address, phone, fax, website } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_master_location_create', [req.user.role, req.user.userId, code, name, address ?? null, phone ?? null, fax ?? null, website ?? null]);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.createLocation = createLocation;
const updateLocation = async (req, res, next) => {
    try {
        const { code, name, address, phone, fax, website, is_active } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_master_location_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, address ?? null, phone ?? null, fax ?? null, website ?? null, is_active ?? 1]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.updateLocation = updateLocation;
const deleteLocation = async (req, res, next) => {
    try {
        const result = await (0, callProcedure_1.callSPOne)('sp_master_location_delete', [req.user.role, req.user.userId, parseInt(req.params.id)]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.deleteLocation = deleteLocation;
// ── DEPARTMENTS ───────────────────────────────────────────────
const listDepartments = async (req, res, next) => {
    try {
        const data = await (0, callProcedure_1.callSP)('sp_master_department_list', [req.user.role]);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
};
exports.listDepartments = listDepartments;
const createDepartment = async (req, res, next) => {
    try {
        const { code, name } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_master_department_create', [req.user.role, req.user.userId, code, name]);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.createDepartment = createDepartment;
const updateDepartment = async (req, res, next) => {
    try {
        const { code, name, is_active } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_master_department_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, is_active ?? 1]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res, next) => {
    try {
        const result = await (0, callProcedure_1.callSPOne)('sp_master_department_delete', [req.user.role, req.user.userId, parseInt(req.params.id)]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.deleteDepartment = deleteDepartment;
// ── DESIGNATIONS ──────────────────────────────────────────────
const listDesignations = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_designation_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listDesignations = listDesignations;
const createDesignation = async (req, res, next) => {
    try {
        const { code, name } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_designation_create', [req.user.role, req.user.userId, code, name]));
    }
    catch (e) {
        next(e);
    }
};
exports.createDesignation = createDesignation;
const updateDesignation = async (req, res, next) => {
    try {
        const { code, name, is_active } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_designation_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, is_active ?? 1]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateDesignation = updateDesignation;
const deleteDesignation = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_designation_delete', [req.user.role, req.user.userId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.deleteDesignation = deleteDesignation;
// ── CATEGORIES ────────────────────────────────────────────────
const listCategories = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_category_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listCategories = listCategories;
const createCategory = async (req, res, next) => {
    try {
        const { code, name } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_category_create', [req.user.role, req.user.userId, code, name]));
    }
    catch (e) {
        next(e);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { code, name, is_active } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_category_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, is_active ?? 1]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_category_delete', [req.user.role, req.user.userId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.deleteCategory = deleteCategory;
// ── GROUPS ────────────────────────────────────────────────────
const listGroups = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_group_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listGroups = listGroups;
const createGroup = async (req, res, next) => {
    try {
        const { code, name } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_group_create', [req.user.role, req.user.userId, code, name]));
    }
    catch (e) {
        next(e);
    }
};
exports.createGroup = createGroup;
const updateGroup = async (req, res, next) => {
    try {
        const { code, name, is_active } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_group_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, is_active ?? 1]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateGroup = updateGroup;
// ── SUB GROUPS ────────────────────────────────────────────────
const listSubGroups = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_subgroup_list', [req.user.role, (0, callProcedure_1.q)(req.query.group_id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listSubGroups = listSubGroups;
const createSubGroup = async (req, res, next) => {
    try {
        const { group_id, code, name } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_subgroup_create', [req.user.role, req.user.userId, group_id, code, name]));
    }
    catch (e) {
        next(e);
    }
};
exports.createSubGroup = createSubGroup;
const updateSubGroup = async (req, res, next) => {
    try {
        const { group_id, code, name, is_active } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_subgroup_update', [req.user.role, req.user.userId, parseInt(req.params.id), group_id, code, name, is_active ?? 1]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateSubGroup = updateSubGroup;
// ── CALENDARS ─────────────────────────────────────────────────
const listCalendars = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_calendar_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listCalendars = listCalendars;
const createCalendar = async (req, res, next) => {
    try {
        const { code, name } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_calendar_create', [req.user.role, req.user.userId, code, name]));
    }
    catch (e) {
        next(e);
    }
};
exports.createCalendar = createCalendar;
const updateCalendar = async (req, res, next) => {
    try {
        const { code, name, is_active } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_master_calendar_update', [req.user.role, req.user.userId, parseInt(req.params.id), code, name, is_active ?? 1]));
    }
    catch (e) {
        next(e);
    }
};
exports.updateCalendar = updateCalendar;
// ── HOLIDAYS ─────────────────────────────────────────────────
const listHolidays = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_master_holiday_list', [req.user.role, (0, callProcedure_1.q)(req.query.calendar_id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.listHolidays = listHolidays;
const createHoliday = async (req, res, next) => {
    try {
        const { code, name, start_date, end_date, is_week_off, is_optional, calendar_ids } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_master_holiday_create', [req.user.role, req.user.userId, code, name, start_date, end_date, is_week_off ?? 0, is_optional ?? 0, calendar_ids ? JSON.stringify(calendar_ids) : null]));
    }
    catch (e) {
        next(e);
    }
};
exports.createHoliday = createHoliday;
// ── ANNOUNCEMENTS ─────────────────────────────────────────────
const listAnnouncements = async (req, res, next) => {
    try {
        const active_only = (0, callProcedure_1.q)(req.query.active_only) === 'true' ? 1 : 0;
        res.json(await (0, callProcedure_1.callSP)('sp_announcement_list', [req.user.role, active_only]));
    }
    catch (e) {
        next(e);
    }
};
exports.listAnnouncements = listAnnouncements;
const createAnnouncement = async (req, res, next) => {
    try {
        const { heading, type, display_start, display_end, content } = req.body;
        res.status(201).json(await (0, callProcedure_1.callSPOne)('sp_announcement_publish', [req.user.role, req.user.userId, heading, type ?? 'General', display_start, display_end, content ?? null]));
    }
    catch (e) {
        next(e);
    }
};
exports.createAnnouncement = createAnnouncement;
//# sourceMappingURL=mastersController.js.map