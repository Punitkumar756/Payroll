import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";

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
          <h1>Assign Shifts</h1>
          <p>Bulk assign shifts to employees for a specific date range</p>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--sp-xl)" }}>
        <form
          onSubmit={handleAssign}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-lg)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Select Shift *</label>
              <select
                className="form-control"
                value={formData.shift_id}
                onChange={(e) =>
                  setFormData({ ...formData, shift_id: e.target.value })
                }
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
              <label>Effective From *</label>
              <input
                type="date"
                className="form-control"
                value={formData.effective_from}
                onChange={(e) =>
                  setFormData({ ...formData, effective_from: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Effective To (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={formData.effective_to}
                onChange={(e) =>
                  setFormData({ ...formData, effective_to: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "var(--sp-sm)",
                display: "block",
              }}
            >
              Select Employees ({selectedEmployees.size} selected)
            </label>
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid var(--clr-border)",
                borderRadius: "var(--r-md)",
                padding: "var(--sp-sm)",
              }}
            >
              {employees.length === 0 ? (
                <p className="text-muted">No active employees found.</p>
              ) : (
                employees.map((emp) => (
                  <label
                    key={emp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-sm)",
                      padding: "var(--sp-xs)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                    />

                    <span>
                      {emp.employee_code} - {emp.first_name} {emp.last_name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
