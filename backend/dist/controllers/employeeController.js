"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRole = exports.deactivateUser = exports.activateUser = exports.listUsers = exports.assignCTC = exports.createUserForEmployee = exports.updateStatutory = exports.selfUpdateEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployee = exports.listEmployees = void 0;
const callProcedure_1 = require("../db/callProcedure");
const password_1 = require("../auth/password");
const listEmployees = async (req, res, next) => {
    try {
        const { department_id, location_id, status, search, page, page_size } = req.query;
        const data = await (0, callProcedure_1.callSP)('sp_employee_list', [
            req.user.role,
            (0, callProcedure_1.q)(department_id), (0, callProcedure_1.q)(location_id), (0, callProcedure_1.q)(status), (0, callProcedure_1.q)(search),
            parseInt(page) || 1, parseInt(page_size) || 20,
        ]);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
};
exports.listEmployees = listEmployees;
const getEmployee = async (req, res, next) => {
    try {
        const emp = await (0, callProcedure_1.callSPOne)('sp_employee_get_by_id', [
            req.user.role, req.user.employeeId ?? 0, parseInt(req.params.id),
        ]);
        if (!emp)
            return res.status(404).json({ error: 'NOT_FOUND', detail: 'Employee not found' });
        res.json(emp);
    }
    catch (e) {
        next(e);
    }
};
exports.getEmployee = getEmployee;
const createEmployee = async (req, res, next) => {
    try {
        const b = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_employee_create', [
            req.user.role, req.user.userId,
            b.employee_code, b.first_name, b.middle_name ?? null, b.last_name,
            b.date_of_birth ?? null, b.gender ?? null, b.joining_date,
            b.department_id ?? null, b.designation_id ?? null, b.location_id ?? null,
            b.category_id ?? null, b.group_id ?? null, b.sub_group_id ?? null,
            b.calendar_id ?? null, b.reporting_manager_id ?? null,
            b.official_email ?? null, b.contact_number ?? null, b.badge_id ?? null,
        ]);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res, next) => {
    try {
        const b = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_employee_update', [
            req.user.role, req.user.userId, parseInt(req.params.id),
            b.first_name, b.middle_name ?? null, b.last_name,
            b.date_of_birth ?? null, b.gender ?? null, b.joining_date,
            b.confirmation_date ?? null, b.status ?? 'Active',
            b.department_id ?? null, b.designation_id ?? null, b.location_id ?? null,
            b.category_id ?? null, b.group_id ?? null, b.sub_group_id ?? null,
            b.calendar_id ?? null, b.reporting_manager_id ?? null,
            b.official_email ?? null, b.contact_number ?? null, b.badge_id ?? null,
        ]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.updateEmployee = updateEmployee;
const selfUpdateEmployee = async (req, res, next) => {
    try {
        const { contact_number, current_address, emergency_name, emergency_phone, emergency_relation } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_employee_self_update', [
            req.user.role, req.user.employeeId, req.user.userId,
            contact_number ?? null, current_address ?? null,
            emergency_name ?? null, emergency_phone ?? null, emergency_relation ?? null,
        ]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.selfUpdateEmployee = selfUpdateEmployee;
const updateStatutory = async (req, res, next) => {
    try {
        const b = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_employee_statutory_update', [
            req.user.role, req.user.userId, parseInt(req.params.id),
            b.pf_number ?? null, b.esi_number ?? null, b.pan ?? null,
            b.aadhaar ?? null, b.bank_name ?? null, b.bank_account ?? null,
            b.bank_ifsc ?? null, b.bank_branch ?? null, b.uan ?? null,
            process.env.AES_KEY,
        ]);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.updateStatutory = updateStatutory;
const createUserForEmployee = async (req, res, next) => {
    try {
        const { username, password, role_id } = req.body;
        const hash = await (0, password_1.hashPassword)(password);
        const result = await (0, callProcedure_1.callSPOne)('sp_user_create_for_employee', [
            req.user.role, req.user.userId, parseInt(req.params.id), username, hash, role_id,
        ]);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.createUserForEmployee = createUserForEmployee;
const assignCTC = async (req, res, next) => {
    try {
        const { template_id, ctc_annual, effective_from } = req.body;
        const result = await (0, callProcedure_1.callSPOne)('sp_employee_ctc_assign', [
            req.user.role, req.user.userId, parseInt(req.params.id),
            template_id, ctc_annual, effective_from,
        ]);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
};
exports.assignCTC = assignCTC;
// ── USERS ─────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSP)('sp_user_list', [req.user.role]));
    }
    catch (e) {
        next(e);
    }
};
exports.listUsers = listUsers;
const activateUser = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSPOne)('sp_user_activate', [req.user.role, req.user.userId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.activateUser = activateUser;
const deactivateUser = async (req, res, next) => {
    try {
        res.json(await (0, callProcedure_1.callSPOne)('sp_user_deactivate', [req.user.role, req.user.userId, parseInt(req.params.id)]));
    }
    catch (e) {
        next(e);
    }
};
exports.deactivateUser = deactivateUser;
const assignRole = async (req, res, next) => {
    try {
        const { role_id } = req.body;
        res.json(await (0, callProcedure_1.callSPOne)('sp_role_assign', [req.user.role, req.user.userId, parseInt(req.params.id), role_id]));
    }
    catch (e) {
        next(e);
    }
};
exports.assignRole = assignRole;
//# sourceMappingURL=employeeController.js.map