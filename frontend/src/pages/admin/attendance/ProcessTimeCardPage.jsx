import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";

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
          <h1>Process Timecard</h1>
          <p>
            Compute attendance status, late/early flags, and OT based on shifts
            and raw check-ins
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: "var(--sp-xl)", maxWidth: 800, margin: "0 auto" }}
      >
        <form
          onSubmit={handleProcess}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-lg)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
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
          </div>

          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-sm)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.overwrite_manual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overwrite_manual: e.target.checked,
                  })
                }
              />

              <span>Overwrite Manual Changes (Recompute fully)</span>
            </label>
          </div>

          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-sm)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.all_employees}
                onChange={(e) =>
                  setFormData({ ...formData, all_employees: e.target.checked })
                }
              />

              <span>Process for ALL Active Employees</span>
            </label>
          </div>

          {!formData.all_employees && (
            <div>
              <label
                style={{
                  fontWeight: 600,
                  marginBottom: "var(--sp-sm)",
                  display: "block",
                }}
              >
                Select Specific Employees ({selectedEmployees.size} selected)
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
                {employees.map((emp) => (
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
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "var(--sp-md)",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "Run Processing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
