import React, { useEffect, useState } from "react";
import { leaveApi } from "../../api";
import toast from "react-hot-toast";

export default function EssLeavePage() {
  const [balance, setBalance] = useState([]);
  const [applications, setApplications] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [balData, appData, typesData] = await Promise.all([
        leaveApi.getBalance(),
        leaveApi.getApplications(),
        leaveApi.listTypes(),
      ]);
      setBalance(balData);
      setApplications(appData);
      setLeaveTypes(typesData.filter((t) => t.is_active));
    } catch {
      toast.error("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date)
      return toast.error("Fill required fields");

    try {
      await leaveApi.apply({
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      });
      toast.success("Leave applied successfully");
      setFormData({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      load();
    } catch {
      toast.error("Failed to apply for leave");
    }
  };

  const handleCancel = async (id) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave application?")
    )
      return;
    try {
      await leaveApi.cancel(id);
      toast.success("Leave cancelled");
      load();
    } catch {
      toast.error("Failed to cancel leave");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Leave</h1>
          <p>View balances and apply for time off</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sp-md)",
          marginBottom: "var(--sp-lg)",
        }}
      >
        {balance.map((b) => (
          <div
            key={b.leave_type_id}
            className="card"
            style={{
              padding: "var(--sp-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4
              style={{
                margin: "0 0 var(--sp-sm) 0",
                color: "var(--clr-muted)",
              }}
            >
              {b.leave_type_name}
            </h4>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--clr-primary)",
              }}
            >
              {b.balance}
            </div>
            <span className="text-sm text-muted">Days Available</span>
          </div>
        ))}
        {balance.length === 0 && !loading && (
          <div className="card" style={{ padding: "var(--sp-md)" }}>
            <p className="text-muted m-0">No leave balances found.</p>
          </div>
        )}
      </div>

      <div
        className="grid-2"
        style={{
          gap: "var(--sp-lg)",
          alignItems: "start",
        }}
      >
        <div className="card">
          <div className="table-responsive">
            <table className="table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>HR Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>{a.leave_type_name}</td>
                  <td>
                    {a.start_date} to {a.end_date}
                  </td>
                  <td>{a.total_days}</td>
                  <td>
                    <span
                      className={`badge ${a.status === "Pending" ? "badge-amber" : a.status === "Approved" ? "badge-green" : "badge-gray"}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--clr-text-muted)" }}>
                      {a.approver_remarks || "—"}
                    </span>
                  </td>
                  <td>
                    {a.status === "Pending" && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => handleCancel(a.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No leave applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--sp-md)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-md)" }}>
            Apply for Leave
          </h3>
          <form
            onSubmit={handleApply}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Leave Type *</label>
              <select
                className="form-control"
                value={formData.leave_type_id}
                onChange={(e) =>
                  setFormData({ ...formData, leave_type_id: e.target.value })
                }
                required
              >
                <option value="">-- Choose Type --</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                className="form-control"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "var(--sp-sm)" }}
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
