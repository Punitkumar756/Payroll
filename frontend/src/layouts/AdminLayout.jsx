import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/admin/dashboard", icon: "🏠", label: "Dashboard" }],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/masters/locations", icon: "📍", label: "Locations" },
      { to: "/admin/masters/departments", icon: "🏗️", label: "Departments" },
      { to: "/admin/masters/designations", icon: "💼", label: "Designations" },
      { to: "/admin/masters/categories", icon: "🏷️", label: "Categories" },
      { to: "/admin/masters/groups", icon: "👥", label: "Groups" },
      { to: "/admin/masters/calendars", icon: "📅", label: "Calendars" },
      { to: "/admin/masters/holidays", icon: "🎉", label: "Holidays" },
      {
        to: "/admin/masters/announcements",
        icon: "📢",
        label: "Announcements",
      },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/admin/employees", icon: "👤", label: "Employees" },
      { to: "/admin/users", icon: "🔑", label: "Users & Roles" },
    ],
  },
  {
    label: "Attendance",
    items: [
      { to: "/admin/attendance/shifts", icon: "⏰", label: "Shifts" },
      {
        to: "/admin/attendance/assign-shift",
        icon: "🔄",
        label: "Assign Shifts",
      },
      {
        to: "/admin/attendance/process",
        icon: "⚙️",
        label: "Process Timecard",
      },
      { to: "/admin/attendance/manual", icon: "✏️", label: "Manual Entry" },
      { to: "/admin/attendance/corrections", icon: "🔔", label: "Corrections" },
      { to: "/admin/attendance/lock", icon: "🔒", label: "Lock Period" },
    ],
  },
  {
    label: "Leave",
    items: [
      { to: "/admin/leave/types", icon: "📋", label: "Leave Types" },
      { to: "/admin/leave/policies", icon: "📜", label: "Leave Policies" },
      { to: "/admin/leave/approvals", icon: "✅", label: "Approvals" },
      { to: "/admin/leave/apply-behalf", icon: "📝", label: "Apply On Behalf" },
      { to: "/admin/leave/calendar", icon: "📆", label: "Leave Calendar" },
    ],
  },
  {
    label: "Payroll",
    items: [
      { to: "/admin/payroll/salary-heads", icon: "💰", label: "Salary Heads" },
      {
        to: "/admin/payroll/ctc-templates",
        icon: "📊",
        label: "CTC Templates",
      },
      { to: "/admin/payroll/process", icon: "▶️", label: "Process Payroll" },
      { to: "/admin/payroll/payslips", icon: "📄", label: "Payslips" },
      { to: "/admin/payroll/advances", icon: "💳", label: "Advances" },
      { to: "/admin/payroll/loans", icon: "🏦", label: "Loans" },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏢</div>
          <div>
            <div className="sidebar-logo-text">HRMS Admin</div>
            <div className="sidebar-logo-sub">
              Dayton Natural Resource Pvt Ltd
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: "var(--sp-sm)" }}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={closeSidebar}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div
          style={{
            padding: "var(--sp-md)",
            borderTop: "1px solid var(--clr-border)",
          }}
        >
          <button
            onClick={handleLogout}
            className="btn btn-ghost w-full"
            style={{ justifyContent: "center" }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="topbar-title">HR Management System</div>
          </div>
          <div className="topbar-actions">
            <div className="user-badge" id="user-badge">
              <div className="user-avatar">
                {user?.firstName?.[0] || "A"}
                {user?.lastName?.[0] || ""}
              </div>
              <span>
                {user?.firstName} {user?.lastName}
              </span>
              <span
                className="badge badge-indigo"
                style={{ padding: "2px 8px", fontSize: "0.7rem" }}
              >
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="page-content animate-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
