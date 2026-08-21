import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";
import { Users, CalendarRange, Clock, CheckSquare, Save } from "lucide-react";

export default function AssignShiftPage() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shift_id: "",
    effective_from: "",
    effective_to: "",
  });
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

  useEffect(() => {
    attendanceApi
      .listShifts()
      .then(setShifts)
      .catch(() => toast.error("Failed to load shifts"));
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

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.shift_id || !formData.effective_from)
      return toast.error("Shift and Effective From are required");
    if (selectedEmployees.size === 0)
      return toast.error("Select at least one employee");

    setLoading(true);
    try {
      await attendanceApi.assignShift({
        shift_id: parseInt(formData.shift_id),
        employee_ids: Array.from(selectedEmployees),
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || undefined,
      });
      toast.success("Shift assigned successfully");
      setFormData({ shift_id: "", effective_from: "", effective_to: "" });
      setSelectedEmployees(new Set());
    } catch {
      toast.error("Failed to assign shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon amber" style={{ width: 42, height: 42 }}>
              <Clock size={22} />
            </div>
            <div>
              <h1>Assign Shifts</h1>
              <p>Bulk assign working shifts to employees for specific date ranges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={18} className="text-primary" />
            Shift Assignment
          </h2>
        </div>

        <div className="card-body">
          <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
            
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Select Shift *
                </label>
                <select
                  className="form-input"
                  value={formData.shift_id}
                  onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Shift --</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.start_time} - {s.end_time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CalendarRange size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Effective From *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.effective_from}
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CalendarRange size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Effective To (Optional)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.effective_to}
                  onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                />
              </div>
            </div>

            <div style={{ 
              background: 'rgba(99, 102, 241, 0.05)',
              padding: '20px',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Users size={16} />
                Select Employees
                <span className="badge badge-indigo" style={{ marginLeft: 8 }}>
                  {selectedEmployees.size} selected
                </span>
              </label>

              <div style={{
                maxHeight: 300,
                overflowY: "auto",
                background: 'var(--clr-bg-input)',
                border: "1px solid var(--clr-border)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-md)",
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 10
              }}>
                {employees.length === 0 ? (
                  <p className="text-muted" style={{ padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>No active employees found.</p>
                ) : (
                  employees.map((emp) => (
                    <label key={emp.id} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      padding: "8px 12px", 
                      cursor: "pointer", 
                      borderRadius: 'var(--r-sm)',
                      background: selectedEmployees.has(emp.id) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: selectedEmployees.has(emp.id) ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.85rem' }}>
                        <strong>{emp.employee_code}</strong> - {emp.first_name} {emp.last_name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-sm)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--clr-border)" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ background: 'var(--grad-primary)', padding: '10px 24px' }}>
                <Save size={18} />
                {loading ? "Assigning..." : "Assign Shift"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
