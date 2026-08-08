import React, { useState } from "react";
import { attendanceApi } from "../../../api";
import toast from "react-hot-toast";

export default function LockPeriodPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
  });

  const handleLock = async (e) => {
    e.preventDefault();
    if (!formData.from_date || !formData.to_date)
      return toast.error("From and To dates are required");
    if (
      !window.confirm(
        "Are you sure you want to lock this period? It cannot be reprocessed or manually edited afterwards.",
      )
    )
      return;

    setLoading(true);
    try {
      await attendanceApi.lockPeriod({
        from_date: formData.from_date,
        to_date: formData.to_date,
      });
      toast.success("Period locked successfully");
      setFormData({ from_date: "", to_date: "" });
    } catch {
      toast.error("Failed to lock period");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Lock Attendance Period</h1>
          <p>
            Prevent further timecard processing or manual edits for a specific
            date range
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: "var(--sp-xl)", maxWidth: 600, margin: "0 auto" }}
      >
        <div
          style={{
            padding: "var(--sp-md)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--r-md)",
            marginBottom: "var(--sp-lg)",
          }}
        >
          <strong>⚠️ Warning:</strong> Locking an attendance period is an
          irreversible action used before finalizing payroll. It prevents any
          further modifications.
        </div>
        <form
          onSubmit={handleLock}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-md)",
          }}
        >
          <div className="form-group">
            <label>From Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.from_date}
              onChange={(e) =>
                setFormData({ ...formData, from_date: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>To Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.to_date}
              onChange={(e) =>
                setFormData({ ...formData, to_date: e.target.value })
              }
              required
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "var(--sp-sm)",
            }}
          >
            <button
              type="submit"
              className="btn"
              style={{ background: "#ef4444", color: "white" }}
              disabled={loading}
            >
              {loading ? "Locking..." : "Lock Period"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
