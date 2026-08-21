import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";
import { Calculator, CalendarDays, Users, AlertTriangle, PlayCircle, Settings2 } from "lucide-react";

export default function ProcessTimeCardPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    overwrite_manual: false,
    all_employees: true,
  });
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

  useEffect(() => {
    employeesApi
      .list({ status: "Active" })
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees"));
  }, []);

  const toggleEmployee = (id) => {
    const next = new Set(selectedEmployees);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmployees(next);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!formData.from_date || !formData.to_date)
      return toast.error("From and To dates are required");
    if (!formData.all_employees && selectedEmployees.size === 0)
      return toast.error("Select at least one employee");

    setLoading(true);
    try {
      await attendanceApi.processTimecard({
        from_date: formData.from_date,
        to_date: formData.to_date,
        overwrite_manual: formData.overwrite_manual ? 1 : 0,
        employee_ids: formData.all_employees
          ? employees.map((e) => e.id)
          : Array.from(selectedEmployees),
      });
      toast.success("Timecard processed successfully");
    } catch {
      toast.error("Failed to process timecard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon green" style={{ width: 42, height: 42 }}>
              <Calculator size={22} />
            </div>
            <div>
              <h1>Process Timecard</h1>
              <p>Compute attendance status, late/early flags, and OT based on shifts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={18} className="text-primary" />
            Processing Parameters
          </h2>
        </div>

        <div className="card-body">
          <form onSubmit={handleProcess} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <CalendarDays size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
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
                  <CalendarDays size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
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

            <div style={{ 
              background: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid rgba(245, 158, 11, 0.3)', 
              padding: '12px 16px', 
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--clr-warning)', marginTop: 2 }} />
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", cursor: "pointer", fontWeight: 600, color: 'var(--clr-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.overwrite_manual}
                    onChange={(e) => setFormData({ ...formData, overwrite_manual: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  Overwrite Manual Changes
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: 4, marginLeft: 24 }}>
                  Checking this will recompute and overwrite any manual attendance adjustments made by admins or HR for this period.
                </p>
              </div>
            </div>

            <div className="form-group" style={{ 
              background: 'rgba(99, 102, 241, 0.05)',
              padding: '16px',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formData.all_employees}
                  onChange={(e) => setFormData({ ...formData, all_employees: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                Process for ALL Active Employees
              </label>

              {!formData.all_employees && (
                <div style={{ marginTop: '16px', paddingLeft: '24px' }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={14} />
                    Select Specific Employees 
                    <span className="badge badge-indigo" style={{ marginLeft: 8 }}>
                      {selectedEmployees.size} selected
                    </span>
                  </label>
                  <div style={{
                    maxHeight: 250,
                    overflowY: "auto",
                    background: 'var(--clr-bg-input)',
                    border: "1px solid var(--clr-border)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--sp-sm)",
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8
                  }}>
                    {employees.map((emp) => (
                      <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", cursor: "pointer", borderRadius: '4px', background: selectedEmployees.has(emp.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                        />
                        <span style={{ fontSize: '0.85rem' }}>
                          <strong>{emp.employee_code}</strong> - {emp.first_name} {emp.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-sm)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--clr-border)" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ background: 'var(--grad-primary)', padding: '12px 32px' }}>
                <PlayCircle size={20} />
                {loading ? "Processing Data..." : "Run Processing Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
