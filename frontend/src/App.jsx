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
  CalendarsPage,
  HolidaysPage,
  AnnouncementsPage,
} from "./pages/admin/MasterPages";

// Admin — Employees
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeListPage from "./pages/admin/EmployeeListPage";
import EmployeeCreatePage from "./pages/admin/EmployeeCreatePage";
import EmployeeEditPage from "./pages/admin/EmployeeEditPage";
import EmployeeDetailPage from "./pages/admin/EmployeeDetailPage";
import UsersRolesPage from "./pages/admin/UsersRolesPage";

// Admin — Attendance
import ShiftsPage from "./pages/admin/attendance/ShiftsPage";
import AssignShiftPage from "./pages/admin/attendance/AssignShiftPage";
import ProcessTimeCardPage from "./pages/admin/attendance/ProcessTimeCardPage";
import ManualAttendancePage from "./pages/admin/attendance/ManualAttendancePage";
import CorrectionRequestsPage from "./pages/admin/attendance/CorrectionRequestsPage";
import LockPeriodPage from "./pages/admin/attendance/LockPeriodPage";

// Admin — Leave
import LeaveTypesPage from "./pages/admin/leave/LeaveTypesPage";
import LeavePoliciesPage from "./pages/admin/leave/LeavePoliciesPage";
import LeaveApprovalsPage from "./pages/admin/LeaveApprovalsPage";
import ApplyOnBehalfPage from "./pages/admin/leave/ApplyOnBehalfPage";
import LeaveCalendarPage from "./pages/admin/leave/LeaveCalendarPage";

// Admin — Payroll
import ProcessPayrollPage from "./pages/admin/ProcessPayrollPage";
import SalaryHeadsPage from "./pages/admin/payroll/SalaryHeadsPage";
import CtcTemplatesPage from "./pages/admin/payroll/CtcTemplatesPage";
import PayslipsReviewPage from "./pages/admin/payroll/PayslipsReviewPage";
import AdvancesPage from "./pages/admin/payroll/AdvancesPage";
import LoansPage from "./pages/admin/payroll/LoansPage";

// Self-Service
import EssDashboard from "./pages/self-service/DashboardPage";
import EssProfilePage from "./pages/self-service/EssProfilePage";
import EssAttendancePage from "./pages/self-service/EssAttendancePage";
import EssLeavePage from "./pages/self-service/EssLeavePage";
import EssPayslipsPage from "./pages/self-service/EssPayslipsPage";
import EssLoansPage from "./pages/self-service/EssLoansPage";

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

            {/* Masters */}
            <Route path="masters/locations" element={<LocationsPage />} />
            <Route path="masters/departments" element={<DepartmentsPage />} />
            <Route path="masters/designations" element={<DesignationsPage />} />
            <Route path="masters/categories" element={<CategoriesPage />} />
            <Route path="masters/groups" element={<GroupsPage />} />
            <Route path="masters/sub-groups" element={<SubGroupsPage />} />
            <Route path="masters/calendars" element={<CalendarsPage />} />
            <Route path="masters/holidays" element={<HolidaysPage />} />
            <Route
              path="masters/announcements"
              element={<AnnouncementsPage />}
            />

            {/* Employees */}
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/create" element={<EmployeeCreatePage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />
            <Route
              path="employees/:id"
              element={<EmployeeDetailPage />}
            />
            <Route path="users" element={<UsersRolesPage />} />

            {/* Attendance */}
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

            {/* Leave */}
            <Route path="leave/types" element={<LeaveTypesPage />} />
            <Route path="leave/policies" element={<LeavePoliciesPage />} />
            <Route path="leave/approvals" element={<LeaveApprovalsPage />} />
            <Route path="leave/apply-behalf" element={<ApplyOnBehalfPage />} />
            <Route path="leave/calendar" element={<LeaveCalendarPage />} />

            {/* Payroll */}
            <Route path="payroll/salary-heads" element={<SalaryHeadsPage />} />
            <Route
              path="payroll/ctc-templates"
              element={<CtcTemplatesPage />}
            />
            <Route path="payroll/process" element={<ProcessPayrollPage />} />
            <Route path="payroll/payslips" element={<PayslipsReviewPage />} />
            <Route path="payroll/advances" element={<AdvancesPage />} />
            <Route path="payroll/loans" element={<LoansPage />} />

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
            <Route path="payslips" element={<EssPayslipsPage />} />
            <Route path="loans" element={<EssLoansPage />} />
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
