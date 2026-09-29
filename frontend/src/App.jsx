import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import SelfServiceLayout from "./layouts/SelfServiceLayout";

// Auth
import LoginPage from "./pages/LoginPage";

// Admin — Masters
import {
  LocationsPage,
  DepartmentsPage,
  DesignationsPage,
  CategoriesPage,
  GroupsPage,
  SubGroupsPage,
  AnnouncementsPage,
  HolidaysPage,
  SitesPage,
} from "./pages/admin/MasterPages";

import CalendarDashboard from "./pages/admin/calendar/CalendarDashboard";
import CalendarCreate from "./pages/admin/calendar/CalendarCreate";
import CalendarDetails from "./pages/admin/calendar/CalendarDetails";

// Admin — Employees
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeListPage from "./pages/admin/EmployeeListPage";
import EmployeeCreatePage from "./pages/admin/EmployeeCreatePage";
import EmployeeEditPage from "./pages/admin/EmployeeEditPage";
import EmployeeDetailPage from "./pages/admin/EmployeeDetailPage";
import UsersRolesPage from "./pages/admin/UsersRolesPage";
import AssignTaskPage from "./pages/admin/tasks/AssignTaskPage";
import TaskTrackerPage from "./pages/admin/tasks/TaskTrackerPage";

import HrMonitoringPage from "./pages/admin/HrMonitoringPage";

// Admin — Payroll
import PayrollDashboard from "./pages/admin/payroll/Dashboard";
import PayrollAdvancePayments from "./pages/admin/payroll/AdvancePayments";
import PayrollSalaryHead from "./pages/admin/payroll/SalaryHead";
import PayrollEditTimeSheets from "./pages/admin/payroll/EditTimeSheets";
import PayrollSalaryStructure from "./pages/admin/payroll/SalaryStructure";
import PayrollPayslip from "./pages/admin/payroll/payslip";
import PayrollProcessPayslip from "./pages/admin/payroll/processPayslip";
import PayrollApprovePayslip from "./pages/admin/payroll/ApprovePayslip";

// Admin — Attendance
import ShiftsPage from "./pages/admin/attendance/ShiftsPage";
import AssignShiftPage from "./pages/admin/attendance/AssignShiftPage";
import ProcessTimeCardPage from "./pages/admin/attendance/ProcessTimeCardPage";
import ManualAttendancePage from "./pages/admin/attendance/ManualAttendancePage";
import DailyAttendancePage from "./pages/admin/attendance/DailyAttendancePage";
import CorrectionRequestsPage from "./pages/admin/attendance/CorrectionRequestsPage";
import LockPeriodPage from "./pages/admin/attendance/LockPeriodPage";

// Admin — Leave
import LeaveTypesPage from "./pages/admin/leave/LeaveTypesPage";
import LeavePoliciesPage from "./pages/admin/leave/LeavePoliciesPage";
import LeaveApprovalsPage from "./pages/admin/LeaveApprovalsPage";
import ApplyOnBehalfPage from "./pages/admin/leave/ApplyOnBehalfPage";
import LeaveCalendarPage from "./pages/admin/leave/LeaveCalendarPage";



// Self-Service
import EssDashboard from "./pages/self-service/DashboardPage";
import EssProfilePage from "./pages/self-service/EssProfilePage";
import EssAttendancePage from "./pages/self-service/EssAttendancePage";
import EssLeavePage from "./pages/self-service/EssLeavePage";
import EssHolidaysPage from "./pages/self-service/EssHolidaysPage";


// Lazy placeholder for pages not yet implemented
import LazyPage from "./components/LazyPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(14,20,36,0.95)",
              color: "#f1f5f9",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#f1f5f9" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" } },
          }}
        />

        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/unauthorized"
            element={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "100vh",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <h1>⛔ Access Denied</h1>
                <p>You don't have permission to view this page.</p>
              </div>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="HR">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />
            <Route path="monitoring" element={<HrMonitoringPage />} />

            {/* Masters */}
            <Route path="masters/locations" element={<LocationsPage />} />
            <Route path="masters/departments" element={<DepartmentsPage />} />
            <Route path="masters/designations" element={<DesignationsPage />} />
            <Route path="masters/categories" element={<CategoriesPage />} />
            <Route path="masters/groups" element={<GroupsPage />} />
            <Route path="masters/sub-groups" element={<SubGroupsPage />} />
            <Route path="masters/sites" element={<SitesPage />} />
            <Route
              path="masters/announcements"
              element={<AnnouncementsPage />}
            />
            <Route
              path="masters/holidays"
              element={<HolidaysPage />}
            />

            {/* Calendars Module */}
            <Route path="calendars" element={<CalendarDashboard />} />
            <Route path="calendars/create" element={<CalendarCreate />} />
            <Route path="calendars/:id" element={<CalendarDetails />} />

            {/* Employees */}
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/create" element={<EmployeeCreatePage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />
            <Route
              path="employees/:id"
              element={<EmployeeDetailPage />}
            />
            <Route path="users" element={<UsersRolesPage />} />
            <Route path="tasks/assign" element={<AssignTaskPage />} />
            <Route path="tasks/tracker" element={<TaskTrackerPage />} />

            {/* Attendance */}
            <Route path="attendance/daily" element={<DailyAttendancePage />} />
            <Route path="attendance/shifts" element={<ShiftsPage />} />
            <Route
              path="attendance/assign-shift"
              element={<AssignShiftPage />}
            />
            <Route
              path="attendance/process"
              element={<ProcessTimeCardPage />}
            />
            <Route
              path="attendance/manual"
              element={<ManualAttendancePage />}
            />
            <Route
              path="attendance/corrections"
              element={<CorrectionRequestsPage />}
            />
            <Route path="attendance/lock" element={<LockPeriodPage />} />

            {/* Payroll */}
            <Route path="payroll/dashboard" element={<PayrollDashboard />} />
            <Route path="payroll/advance-payments" element={<PayrollAdvancePayments />} />
            <Route path="payroll/salary-head" element={<PayrollSalaryHead />} />
            <Route path="payroll/salary-structure" element={<PayrollSalaryStructure />} />
            <Route path="payroll/timesheets" element={<PayrollEditTimeSheets />} />
            <Route path="payroll/payslips" element={<PayrollPayslip />} />
            <Route path="payroll/process-payslip" element={<PayrollProcessPayslip />} />
            <Route path="payroll/approve-payslip" element={<PayrollApprovePayslip />} />
            
            {/* Leave */}
            <Route path="leave/types" element={<LeaveTypesPage />} />
            <Route path="leave/policies" element={<LeavePoliciesPage />} />
            <Route path="leave/approvals" element={<LeaveApprovalsPage />} />
            <Route path="leave/apply-behalf" element={<ApplyOnBehalfPage />} />
            <Route path="leave/calendar" element={<LeaveCalendarPage />} />



            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Self-Service Routes */}
          <Route
            path="/self-service"
            element={
              <ProtectedRoute>
                <SelfServiceLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EssDashboard />} />
            <Route path="profile" element={<EssProfilePage />} />
            <Route path="attendance" element={<EssAttendancePage />} />
            <Route path="leave" element={<EssLeavePage />} />
            <Route path="holidays" element={<EssHolidaysPage />} />

            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
