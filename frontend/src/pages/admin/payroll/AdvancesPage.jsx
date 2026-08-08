import React, { useEffect, useState } from "react";
import { payrollApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";

export default function AdvancesPage() {
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_id: "",
    amount: "",
    type: "Advance",
    reason: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [advData, empData] = await Promise.all([
        payrollApi.listAdvances(),
        employeesApi.list({ status: "Active" }),
      ]);
      setAdvances(advData);
      setEmployees(empData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.amount)
      return toast.error("Employee and amount are required");

    try {
      await payrollApi.createAdvance({
        employee_id: parseInt(formData.employee_id),
        amount: parseFloat(formData.amount),
        type: formData.type,
        reason: formData.reason || undefined,
      });
      toast.success("Record created successfully");
      setFormData({ employee_id: "", amount: "", type: "Advance", reason: "" });
      load();
    } catch {
      toast.error("Failed to create record");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Advances & Deductions</h1>
          <p>Record one-off monetary adjustments for the upcoming payroll</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "var(--sp-lg)",
          alignItems: "start",
        }}
      >
        <div className="card">
          {loading ? (
            <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
              <span className="spinner" />
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((a) => (
                  <tr key={a.id}>
                    <td>{a.created_at?.split("T")[0]}</td>
                    <td>
                      {a.employee_name} ({a.employee_code})
                    </td>
                    <td>{a.type}</td>
                    <td>₹ {a.amount}</td>
                    <td>
                      <span
                        className={`badge ${a.status === "Pending" ? "badge-amber" : "badge-green"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {advances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: "var(--sp-md)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-md)" }}>
            New Record
          </h3>
          <form
            onSubmit={handleCreate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Employee *</label>
              <select
                className="form-control"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                required
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="Advance">Advance (Deducted next payroll)</option>
                <option value="Arrear">Arrear (Added next payroll)</option>
                <option value="Deduction">Other Deduction</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
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
              Save Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
