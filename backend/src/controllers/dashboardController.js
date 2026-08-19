import { callSP, callSPOne } from "../db/callProcedure.js";

export const getHRMetrics = async (req, res, next) => {
  try {
    const metrics = await callSPOne("sp_dashboard_hr_metrics", [req.user.role]);
    res.json(metrics);
  } catch (e) {
    next(e);
  }
};

export const getHRCharts = async (req, res, next) => {
  try {
    const charts = await callSP("sp_dashboard_hr_charts", [req.user.role]);
    res.json(charts);
  } catch (e) {
    next(e);
  }
};

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;
    const empId = req.user.employeeId;
    const today = new Date().toISOString().split("T")[0];
    const year = new Date().getFullYear();

    const announcements = await callSP("sp_announcement_list", [role, 1]);
    const attendance = await callSP("sp_attendance_get_self", [role, empId, today, today]);
    const leaveBalances = await callSP("sp_leave_get_balance_self", [empId, year]);

    // Get employee calendar for holidays
    const emp = await callSPOne("sp_employee_get_by_id", [role, empId, empId]);
    const holidays = await callSP("sp_master_holiday_list", [role, emp?.calendar_id || null]);

    res.json({
      announcements: announcements || [],
      todayAttendance: (attendance && attendance[0]) || null,
      leaveBalances: leaveBalances || [],
      upcomingHolidays: (holidays || [])
        .filter(h => h.start_date >= today)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))
        .slice(0, 5)
    });
  } catch (e) {
    next(e);
  }
};
