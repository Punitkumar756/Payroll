import React, { useState } from "react";
import { attendanceApi } from "../../../api";
import toast from "react-hot-toast";
import { LockKeyhole, AlertOctagon, CalendarSearch, ShieldAlert } from "lucide-react";

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon red" style={{ width: 42, height: 42 }}>
              <LockKeyhole size={22} />
            </div>
            <div>
              <h1>Lock Attendance Period</h1>
              <p>Prevent further timecard processing or manual edits for a finalized date range</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700, margin: "0 auto", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
        
        <div className="card-header" style={{ background: "rgba(239, 68, 68, 0.05)", borderBottom: "1px solid rgba(239, 68, 68, 0.1)" }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-danger)' }}>
            <ShieldAlert size={18} />
            Danger Zone
          </h2>
        </div>

        <div className="card-body">
          <div style={{
            padding: "var(--sp-md) var(--sp-lg)",
            background: "linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)",
            color: "var(--clr-text-secondary)",
            borderLeft: "4px solid var(--clr-danger)",
            borderRadius: "0 var(--r-md) var(--r-md) 0",
            marginBottom: "var(--sp-xl)",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start"
          }}>
            <AlertOctagon size={24} style={{ color: 'var(--clr-danger)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--clr-danger)', marginBottom: 4 }}>Irreversible Action</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                Locking an attendance period is used immediately before finalizing payroll. Once locked, the system completely restricts any further modifications, manual updates, or timecard reprocessing for the selected dates.
              </p>
            </div>
          </div>

          <form onSubmit={handleLock} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <CalendarSearch size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  From Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.from_date}
                  onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <CalendarSearch size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  To Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.to_date}
                  onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-sm)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--clr-border)" }}>
              <button 
                type="submit" 
                className="btn btn-danger btn-lg" 
                disabled={loading}
                style={{ padding: '12px 32px' }}
              >
                <LockKeyhole size={18} />
                {loading ? "Locking Period..." : "Confirm & Lock Period"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
