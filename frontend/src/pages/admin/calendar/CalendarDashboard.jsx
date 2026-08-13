import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calendarsApi } from "../../../api";
import toast from "react-hot-toast";
import { Calendar as CalendarIcon, Plus, Eye, Edit } from "lucide-react";

export default function CalendarDashboard() {
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await calendarsApi.list({ search: search || null });
      setCalendars(data);
    } catch {
      toast.error("Failed to load calendars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = calendars.length;
  const active = calendars.filter((c) => c.status === "Active").length;

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Calendar Management</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: 0 }}>Manage working days, holidays, and weekly offs</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => navigate("/admin/calendars/create")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Create Calendar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>Total Calendars</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--clr-primary)" }}>{total}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>Active Calendars</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--clr-success)" }}>{active}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Calendar List</h3>
          <input
            type="text"
            className="form-input"
            placeholder="Search calendars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={{ width: "250px" }}
          />
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Location</th>
                  <th>Holidays</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calendars.map((cal) => (
                  <tr key={cal.id}>
                    <td><span className="badge badge-gray">{cal.calendar_code}</span></td>
                    <td style={{ fontWeight: 500 }}>{cal.calendar_name}</td>
                    <td>{cal.year}</td>
                    <td>{cal.location_name || "All"}</td>
                    <td>{cal.holiday_count || 0}</td>
                    <td>
                      <span className={`badge badge-${cal.status === 'Active' ? 'success' : 'gray'}`}>
                        {cal.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn"
                        onClick={() => navigate(`/admin/calendars/${cal.id}`)}
                        style={{ padding: "0.4rem", background: "var(--clr-bg-input)" }}
                        title="View / Edit Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {calendars.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
                      No calendars found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
