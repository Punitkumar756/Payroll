import { callSP, callSPOne, q } from "../db/callProcedure.js";

// ── LOCATIONS ─────────────────────────────────────────────────
export const listLocations = async (req, res, next) => {
  try {
    const data = await callSP("sp_master_location_list", [q(req.user.role)]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { code, name, address, phone, fax, website } = req.body;
    const result = await callSPOne("sp_master_location_create", [
      req.user.role,
      req.user.userId,
      code,
      name,
      address ?? null,
      phone ?? null,
      fax ?? null,
      website ?? null,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { code, name, address, phone, fax, website, is_active } = req.body;
    const result = await callSPOne("sp_master_location_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      code,
      name,
      address ?? null,
      phone ?? null,
      fax ?? null,
      website ?? null,
      is_active ?? 1,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_master_location_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

// ── DEPARTMENTS ───────────────────────────────────────────────
export const listDepartments = async (req, res, next) => {
  try {
    const data = await callSP("sp_master_department_list", [req.user.role]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const result = await callSPOne("sp_master_department_create", [
      req.user.role,
      req.user.userId,
      code,
      name,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { code, name, is_active } = req.body;
    const result = await callSPOne("sp_master_department_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      code,
      name,
      is_active ?? 1,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const result = await callSPOne("sp_master_department_delete", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

// ── DESIGNATIONS ──────────────────────────────────────────────
export const listDesignations = async (req, res, next) => {
  try {
    res.json(await callSP("sp_master_designation_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createDesignation = async (req, res, next) => {
  try {
    const { code, name, location_id, department_id } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_designation_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          location_id || null,
          department_id || null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateDesignation = async (req, res, next) => {
  try {
    const { code, name, location_id, department_id, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_designation_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        location_id || null,
        department_id || null,
        is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const deleteDesignation = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_master_designation_delete", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── CATEGORIES ────────────────────────────────────────────────
export const listCategories = async (req, res, next) => {
  try {
    res.json(await callSP("sp_master_category_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createCategory = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_category_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { code, name, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_category_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    res.json(
      await callSPOne("sp_master_category_delete", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── GROUPS ────────────────────────────────────────────────────
export const listGroups = async (req, res, next) => {
  try {
    res.json(await callSP("sp_master_group_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createGroup = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_group_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateGroup = async (req, res, next) => {
  try {
    const { code, name, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_group_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── SUB GROUPS ────────────────────────────────────────────────
export const listSubGroups = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_master_subgroup_list", [
        req.user.role,
        q(req.query.group_id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const createSubGroup = async (req, res, next) => {
  try {
    const { group_id, code, name } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_subgroup_create", [
          req.user.role,
          req.user.userId,
          group_id,
          code,
          name,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateSubGroup = async (req, res, next) => {
  try {
    const { group_id, code, name, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_subgroup_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        group_id,
        code,
        name,
        is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── CALENDARS ─────────────────────────────────────────────────
export const listCalendars = async (req, res, next) => {
  try {
    res.json(await callSP("sp_master_calendar_list", [req.user.role]));
  } catch (e) {
    next(e);
  }
};
export const createCalendar = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_calendar_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateCalendar = async (req, res, next) => {
  try {
    const { code, name, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_calendar_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        is_active ?? 1,
      ]),
    );
  } catch (e) {
    next(e);
  }
};

// ── HOLIDAYS ─────────────────────────────────────────────────
export const listHolidays = async (req, res, next) => {
  try {
    res.json(
      await callSP("sp_master_holiday_list", [
        req.user.role,
        q(req.query.calendar_id),
      ]),
    );
  } catch (e) {
    next(e);
  }
};
export const createHoliday = async (req, res, next) => {
  try {
    const {
      code,
      name,
      start_date,
      end_date,
      is_week_off,
      is_optional,
      calendar_ids,
    } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_holiday_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          start_date,
          end_date,
          is_week_off ?? 0,
          is_optional ?? 0,
          calendar_ids ? JSON.stringify(calendar_ids) : null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
export const listAnnouncements = async (req, res, next) => {
  try {
    const active_only = q(req.query.active_only) === "true" ? 1 : 0;
    res.json(
      await callSP("sp_announcement_list", [req.user.role, active_only]),
    );
  } catch (e) {
    next(e);
  }
};
export const createAnnouncement = async (req, res, next) => {
  try {
    const { heading, type, display_start, display_end, content } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_announcement_publish", [
          req.user.role,
          req.user.userId,
          heading,
          type ?? "General",
          display_start,
          display_end,
          content ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
