import fs from "fs";
import csv from "csv-parser";
import { callSP, callSPOne, q } from "../db/callProcedure.js";

// ── SITES ─────────────────────────────────────────────────
export const listSites = async (req, res, next) => {
  try {
    const data = await callSP("sp_master_site_list", [q(req.user.role)]);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const createSite = async (req, res, next) => {
  try {
    const { code, name, lat, lng, radius, remark, details } = req.body;
    const result = await callSPOne("sp_master_site_create", [
      req.user.role,
      req.user.userId,
      code,
      name,
      lat ?? null,
      lng ?? null,
      radius ?? null,
      remark ?? null,
      details ?? null,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateSite = async (req, res, next) => {
  try {
    const { code, name, lat, lng, radius, remark, details, is_active } = req.body;
    const result = await callSPOne("sp_master_site_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      code,
      name,
      lat ?? null,
      lng ?? null,
      radius ?? null,
      remark ?? null,
      details ?? null,
      is_active ?? 1,
    ]);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

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
    const { code, name, address, phone, fax, website, remark, details } = req.body;
    const result = await callSPOne("sp_master_location_create", [
      req.user.role,
      req.user.userId,
      code,
      name,
      address ?? null,
      phone ?? null,
      fax ?? null,
      website ?? null,
      remark ?? null,
      details ?? null,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { code, name, address, phone, fax, website, remark, details, is_active } = req.body;
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
      remark ?? null,
      details ?? null,
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
    const { code, name, remark, details } = req.body;
    const result = await callSPOne("sp_master_department_create", [
      req.user.role,
      req.user.userId,
      code,
      name,
      remark ?? null,
      details ?? null,
    ]);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { code, name, remark, details, is_active } = req.body;
    const result = await callSPOne("sp_master_department_update", [
      req.user.role,
      req.user.userId,
      parseInt(req.params.id),
      code,
      name,
      remark ?? null,
      details ?? null,
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
    const { code, name, location_id, department_id, remark, details } = req.body;
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
          remark ?? null,
          details ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateDesignation = async (req, res, next) => {
  try {
    const { code, name, location_id, department_id, remark, details, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_designation_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        location_id || null,
        department_id || null,
        remark ?? null,
        details ?? null,
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
    const { code, name, remark, details } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_category_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          remark ?? null,
          details ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { code, name, remark, details, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_category_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        remark ?? null,
        details ?? null,
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
    const { code, name, remark, details } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_group_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          remark ?? null,
          details ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateGroup = async (req, res, next) => {
  try {
    const { code, name, remark, details, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_group_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        remark ?? null,
        details ?? null,
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
    const { group_id, code, name, remark, details } = req.body;
    res
      .status(201)
      .json(
        await callSPOne("sp_master_subgroup_create", [
          req.user.role,
          req.user.userId,
          code,
          name,
          group_id,
          remark ?? null,
          details ?? null,
        ]),
      );
  } catch (e) {
    next(e);
  }
};
export const updateSubGroup = async (req, res, next) => {
  try {
    const { group_id, code, name, remark, details, is_active } = req.body;
    res.json(
      await callSPOne("sp_master_subgroup_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        code,
        name,
        group_id,
        remark ?? null,
        details ?? null,
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

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { heading, type, display_start, display_end, content } = req.body;
    res.json(
      await callSPOne("sp_announcement_update", [
        req.user.role,
        req.user.userId,
        parseInt(req.params.id),
        heading,
        type ?? "General",
        display_start,
        display_end,
        content ?? null,
      ])
    );
  } catch (e) {
    next(e);
  }
};

// ── BULK IMPORT ────────────────────────────────────────────────
export const importCSV = async (req, res, next) => {
  try {
    const { entity } = req.params;
    if (!req.file) {
      return res.status(400).json({ detail: "No CSV file uploaded." });
    }

    const results = [];
    const validEntities = {
      locations: "sp_master_location_create",
      departments: "sp_master_department_create",
      designations: "sp_master_designation_create",
      categories: "sp_master_category_create",
      groups: "sp_master_group_create",
      "sub-groups": "sp_master_subgroup_create"
    };

    const spName = validEntities[entity];
    if (!spName) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ detail: `Invalid entity for import: ${entity}` });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const row of results) {
          try {
            let params = [];
            if (entity === "locations") {
              params = [req.user.role, req.user.userId, row.code, row.name, row.address || null, row.phone || null, row.fax || null, row.website || null, row.remark || null, null];
            } else if (entity === "departments") {
              params = [req.user.role, req.user.userId, row.code, row.name, row.remark || null, null];
            } else if (entity === "categories" || entity === "groups" || entity === "sub-groups") {
              params = [req.user.role, req.user.userId, row.code, row.name, row.remark || null];
            } else if (entity === "designations") {
              params = [req.user.role, req.user.userId, row.code, row.name, row.location_id ? parseInt(row.location_id) : null, row.department_id ? parseInt(row.department_id) : null, row.remark || null];
            }

            await callSPOne(spName, params);
            successCount++;
          } catch (err) {
            failCount++;
            errors.push(`Row Error (${row.code || row.name}): ${err.message}`);
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
