import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/self-service/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/self-service/profile", icon: "👤", label: "My Profile" },
  { to: "/self-service/attendance", icon: "📅", label: "Attendance" },
  { to: "/self-service/leave", icon: "🌴", label: "Leave" },
  { to: "/self-service/holidays", icon: "🎉", label: "Holidays" },

];

export default function SelfServiceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">👤</div>
          <div>
            <div className="sidebar-logo-text">My Portal</div>
            <div className="sidebar-logo-sub">Employee Self-Service</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              id={`ess-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            padding: "var(--sp-md)",
            borderTop: "1px solid var(--clr-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--clr-text-muted)",
              marginBottom: "var(--sp-sm)",
              textAlign: "center",
            }}
          >
            Logged in as Employee
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn btn-ghost w-full"
            style={{ justifyContent: "center" }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="topbar-title">Employee Self-Service</div>
          </div>
          <div className="topbar-actions">
            <div className="user-badge" id="ess-user-badge">
              <div className="user-avatar">
                {user?.firstName?.[0] || "E"}
                {user?.lastName?.[0] || ""}
              </div>
              <span>
                {user?.firstName} {user?.lastName}
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
