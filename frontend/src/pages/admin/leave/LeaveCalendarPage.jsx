import React, { useEffect, useState } from "react";
import { leaveApi } from "../../../api";
import toast from "react-hot-toast";

export default function LeaveCalendarPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = async () => {
    setLoading(true);
    try {
      // For a real calendar, we would filter by month. For now, fetch all approved leaves.
      const data = await leaveApi.listApplications({ status: "Approved" });
      setLeaves(data);
    } catch {
      toast.error("Failed to load leave calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  // A very basic calendar visualization: just listing them out for the selected month
  const filteredLeaves = leaves.filter((l) => {
    return l.start_date.startsWith(month) || l.end_date.startsWith(month);
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leave Calendar</h1>
          <p>View approved leaves across the organization</p>
        </div>
        <div>
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
            <span className="spinner" />
          </div>
        ) : (
          <div style={{ padding: "var(--sp-md)" }}>
            {filteredLeaves.length === 0 ? (
              <p
                className="text-muted text-center"
                style={{ margin: "var(--sp-xl) 0" }}
              >
                No approved leaves found for {month}.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-sm)",
                }}
              >
                {filteredLeaves.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "var(--sp-md)",
                      background: "var(--clr-bg-alt)",
                      borderRadius: "var(--r-md)",
                      borderLeft: "4px solid var(--clr-primary)",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 var(--sp-xs) 0" }}>
                        {l.employee_name} ({l.employee_code})
                      </h4>
                      <p className="text-muted text-sm" style={{ margin: 0 }}>
                        {l.leave_type_name} — {l.start_date} to {l.end_date}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="badge badge-green">Approved</span>
                      <p
                        className="text-sm text-muted"
                        style={{ margin: "var(--sp-xs) 0 0 0" }}
                      >
                        {l.total_days} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
