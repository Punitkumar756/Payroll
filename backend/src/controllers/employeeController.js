import { callSP, callSPOne, q } from "../db/callProcedure.js";
import { hashPassword } from "../auth/password.js";

export const listEmployees = async (req, res, next) => {
  try {
    const { department_id, location_id, status, search, page, page_size } =
      req.query;
    const data = await callSP("sp_employee_list", [
      req.user.role,
      q(department_id),
      q(location_id),
      q(status),
      q(search),
      parseInt(page) || 1,
      parseInt(page_size) || 20,
    ]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const emp = await callSPOne("sp_employee_get_by_id", [
      req.user.role,
      req.user.employeeId ?? 0,
      parseInt(req.params.id),
    ]);
    if (!emp)
      return res
        .status(404)
        .json({ error: "NOT_FOUND", detail: "Employee not found" });
    res.json(emp);
  } catch (e) {
    next(e);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_employee_create", [
      req.user.role,
      req.user.userId,
      b.employee_code,
      b.first_name,
      b.middle_name ?? null,
      b.last_name,
      b.date_of_birth ?? null,
      b.gender ?? null,
      b.joining_date,
      b.department_id ?? null,
      b.designation_id ?? null,
      b.location_id ?? null,
      b.category_id ?? null,
      b.group_id ?? null,
      b.sub_group_id ?? null,
      b.calendar_id ?? null,
      b.reporting_manager_id ?? null,
      b.official_email ?? null,
      b.contact_number ?? null,
      b.badge_id ?? null,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_employee_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      b.first_name,
      b.middle_name ?? null,
      b.last_name,
      b.date_of_birth ?? null,
      b.gender ?? null,
      b.joining_date,
      b.confirmation_date ?? null,
      b.status ?? "Active",
      b.department_id ?? null,
      b.designation_id ?? null,
      b.location_id ?? null,
      b.category_id ?? null,
      b.group_id ?? null,
      b.sub_group_id ?? null,
      b.calendar_id ?? null,
      b.reporting_manager_id ?? null,
      b.official_email ?? null,
      b.contact_number ?? null,
      b.badge_id ?? null,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const selfUpdateEmployee = async (req, res, next) => {
  try {
    const {
      contact_number,
      current_address,
      emergency_name,
      emergency_phone,
      emergency_relation,
    } = req.body;
    const result = await callSPOne("sp_employee_self_update", [
      req.user.role,
      req.user.employeeId,
      req.user.userId,
      contact_number ?? null,
      current_address ?? null,
      emergency_name ?? null,
      emergency_phone ?? null,
      emergency_relation ?? null,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await callSPOne("sp_employee_update_status", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      status
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const updateStatutory = async (req, res, next) => {
  try {
    const b = req.body;
    const result = await callSPOne("sp_employee_statutory_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      b.pf_number ?? null,
      b.esi_number ?? null,
      b.pan ?? null,
      b.aadhaar ?? null,
      b.bank_name ?? null,
      b.bank_account ?? null,
      b.bank_ifsc ?? null,
      b.bank_branch ?? null,
      b.uan ?? null,
      process.env.AES_KEY,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const createUserForEmployee = async (req, res, next) => {
  try {
    const { username, password, role_id } = req.body;
    const hash = await hashPassword(password);
    const result = await callSPOne("sp_user_create_for_employee", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      username,
      hash,
      role_id,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const assignCTC = async (req, res, next) => {
  try {
    const { template_id, ctc_annual, effective_from } = req.body;
    const result = await callSPOne("sp_employee_ctc_assign", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      template_id,
      ctc_annual,
      effective_from,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

// ── USERS ─────────────────────────────────────────────────────
export const listUsers = async (req, res, next) => {
  try {
    res.json(await callSP("sp_user_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_user_activate", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_user_deactivate", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

export const assignRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    res.json(
      await callSPOne("sp_role_assign", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        role_id,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_employee_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};
