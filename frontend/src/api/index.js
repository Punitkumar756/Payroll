import api from "./client";

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }).then((r) => r.data),
  refresh: (refreshToken) =>
    api.post("/auth/refresh", { refreshToken }).then((r) => r.data),
};

// ── Masters ───────────────────────────────────────────────────
const makeCRUD = (base) => ({
  list: (params) => api.get(base, { params }).then((r) => r.data),
  create: (data) => api.post(base, data).then((r) => r.data),
  update: (id, data) => api.put(`${base}/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`${base}/${id}`).then((r) => r.data),
});

export const locationsApi = makeCRUD("/masters/locations");
export const departmentsApi = makeCRUD("/masters/departments");
export const designationsApi = makeCRUD("/masters/designations");
export const categoriesApi = makeCRUD("/masters/categories");
export const groupsApi = makeCRUD("/masters/groups");
export const subGroupsApi = makeCRUD("/masters/sub-groups");
// calendarsApi and holidaysApi are replaced by the detailed calendars module API below
export const announcementsApi = {
  list: (params) =>
    api.get("/masters/announcements", { params }).then((r) => r.data),
  create: (data) =>
    api.post("/masters/announcements", data).then((r) => r.data),
};

// ── Calendars ──────────────────────────────────────────────────
export const calendarsApi = {
  list: (params) => api.get("/calendars", { params }).then((r) => r.data),
  get: (id) => api.get(`/calendars/${id}`).then((r) => r.data),
  create: (data) => api.post("/calendars", data).then((r) => r.data),
  update: (id, data) => api.put(`/calendars/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/calendars/${id}`).then((r) => r.data),

  getHolidays: (id) => api.get(`/calendars/${id}/holidays`).then((r) => r.data),
  upsertHoliday: (id, data) => api.post(`/calendars/${id}/holidays`, data).then((r) => r.data),
  removeHoliday: (id, holidayId) => api.delete(`/calendars/${id}/holidays/${holidayId}`).then((r) => r.data),

  getWeeklyOffs: (id) => api.get(`/calendars/${id}/weekly-offs`).then((r) => r.data),
  updateWeeklyOffs: (id, data) => api.put(`/calendars/${id}/weekly-offs`, data).then((r) => r.data),

  getOverrides: (id) => api.get(`/calendars/${id}/dates`).then((r) => r.data),
  upsertOverride: (id, data) => api.post(`/calendars/${id}/dates`, data).then((r) => r.data),
  removeOverride: (id, date) => api.delete(`/calendars/${id}/dates/${date}`).then((r) => r.data),
};

// ── Employees ─────────────────────────────────────────────────
export const employeesApi = {
  list: (params) => api.get("/employees", { params }).then((r) => r.data),
  get: (id) => api.get(`/employees/${id}`).then((r) => r.data),
  create: (data) => api.post("/employees", data).then((r) => r.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }).then((r) => r.data),
  updateStatutory: (id, data) =>
    api.put(`/employees/${id}/statutory`, data).then((r) => r.data),
  createUser: (id, data) =>
    api.post(`/employees/${id}/user`, data).then((r) => r.data),
  assignCTC: (id, data) =>
    api.post(`/employees/${id}/ctc`, data).then((r) => r.data),
  selfUpdate: (data) =>
    api.patch("/employees/self/profile", data).then((r) => r.data),
  remove: (id) => api.delete(`/employees/${id}`).then((r) => r.data),
};

export const documentsApi = {
  list: (employeeId) =>
    api.get(`/documents/${employeeId}`).then((r) => r.data),
  upload: (employeeId, formData) =>
    api.post(`/documents/${employeeId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  remove: (docId) =>
    api.delete(`/documents/${docId}`).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get("/employees/users/list").then((r) => r.data),
  activate: (id) =>
    api.patch(`/employees/users/${id}/activate`).then((r) => r.data),
  deactivate: (id) =>
    api.patch(`/employees/users/${id}/deactivate`).then((r) => r.data),
  assignRole: (id, role_id) =>
    api.patch(`/employees/users/${id}/role`, { role_id }).then((r) => r.data),
};

// ── Attendance ────────────────────────────────────────────────
export const attendanceApi = {
  listShifts: () => api.get("/attendance/shifts").then((r) => r.data),
  createShift: (data) =>
    api.post("/attendance/shifts", data).then((r) => r.data),
  updateShift: (id, data) =>
    api.put(`/attendance/shifts/${id}`, data).then((r) => r.data),
  assignShift: (data) =>
    api.post("/attendance/shifts/assign", data).then((r) => r.data),
  processTimecard: (data) =>
    api.post("/attendance/process-timecard", data).then((r) => r.data),
  manualUpdate: (data) =>
    api.post("/attendance/manual-update", data).then((r) => r.data),
  lockPeriod: (data) => api.post("/attendance/lock", data).then((r) => r.data),
  listCorrections: (params) =>
    api.get("/attendance/corrections", { params }).then((r) => r.data),
  approveCorrection: (id, data) =>
    api.post(`/attendance/corrections/${id}/approve`, data).then((r) => r.data),
  getSelf: (params) =>
    api.get("/attendance/self", { params }).then((r) => r.data),
  requestCorrection: (data) =>
    api.post("/attendance/self/correction", data).then((r) => r.data),
};

// ── Leave ─────────────────────────────────────────────────────
export const leaveApi = {
  listTypes: () => api.get("/leave/types").then((r) => r.data),
  createType: (data) => api.post("/leave/types", data).then((r) => r.data),
  updateType: (id, data) =>
    api.put(`/leave/types/${id}`, data).then((r) => r.data),
  listPolicies: () => api.get("/leave/policies").then((r) => r.data),
  createPolicy: (data) => api.post("/leave/policies", data).then((r) => r.data),
  assignPolicy: (data) =>
    api.post("/leave/policies/assign", data).then((r) => r.data),
  runAccrual: (data) => api.post("/leave/accrual", data).then((r) => r.data),
  listApplications: (params) =>
    api.get("/leave/applications", { params }).then((r) => r.data),
  applyBehalf: (data) =>
    api.post("/leave/apply-behalf", data).then((r) => r.data),
  approve: (id, data) =>
    api.post(`/leave/${id}/approve`, data).then((r) => r.data),
  reject: (id, data) =>
    api.post(`/leave/${id}/reject`, data).then((r) => r.data),
  // Self-service
  getBalance: (year) =>
    api.get("/leave/self/balance", { params: { year } }).then((r) => r.data),
  getApplications: (params) =>
    api.get("/leave/self/applications", { params }).then((r) => r.data),
  apply: (data) => api.post("/leave/self/apply", data).then((r) => r.data),
  cancel: (id) => api.delete(`/leave/self/${id}/cancel`).then((r) => r.data),
};

// ── Payroll ───────────────────────────────────────────────────
export const payrollApi = {
  listSalaryHeads: () => api.get("/payroll/salary-heads").then((r) => r.data),
  createSalaryHead: (data) =>
    api.post("/payroll/salary-heads", data).then((r) => r.data),
  updateSalaryHead: (id, data) =>
    api.put(`/payroll/salary-heads/${id}`, data).then((r) => r.data),
  listCTCTemplates: () => api.get("/payroll/ctc-templates").then((r) => r.data),
  createCTCTemplate: (data) =>
    api.post("/payroll/ctc-templates", data).then((r) => r.data),
  runPayroll: (data) => api.post("/payroll/run", data).then((r) => r.data),
  listPayslipsHR: (params) =>
    api.get("/payroll/payslips", { params }).then((r) => r.data),
  editPayslipLine: (id, data) =>
    api.patch(`/payroll/payslips/${id}/line`, data).then((r) => r.data),
  approvePayslips: (data) =>
    api.post("/payroll/payslips/approve", data).then((r) => r.data),
  listAdvances: (params) =>
    api.get("/payroll/advances", { params }).then((r) => r.data),
  createAdvance: (data) =>
    api.post("/payroll/advances", data).then((r) => r.data),
  listLoansHR: (params) =>
    api.get("/payroll/loans", { params }).then((r) => r.data),
  approveLoan: (id) =>
    api.post(`/payroll/loans/${id}/approve`).then((r) => r.data),
  // Self
  getPayslips: (params) =>
    api.get("/payroll/self/payslips", { params }).then((r) => r.data),
  getPayslipLines: (id) =>
    api.get(`/payroll/self/payslips/${id}/lines`).then((r) => r.data),
  downloadPayslip: (id) =>
    api
      .get(`/payroll/self/payslips/${id}/pdf`, { responseType: "blob" })
      .then((r) => r.data),
  requestLoan: (data) =>
    api.post("/payroll/self/loans", data).then((r) => r.data),
  getLoans: () => api.get("/payroll/self/loans").then((r) => r.data),
  getLoanSchedule: (id) =>
    api.get(`/payroll/self/loans/${id}/schedule`).then((r) => r.data),
};

export const dashboardApi = {
  getMetrics: () => api.get("/dashboard/metrics").then((r) => r.data),
  getCharts: () => api.get("/dashboard/charts").then((r) => r.data),
};
