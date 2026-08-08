import React, { useEffect, useState } from "react";
import { leaveApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";

export default function ApplyOnBehalfPage() {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    target_employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    Promise.all([employeesApi.list({ status: "Active" }), leaveApi.listTypes()])
      .then(([emps, types]) => {
        setEmployees(emps);
        setLeaveTypes(types.filter((t) => t.is_active));
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (
      !formData.target_employee_id ||
      !formData.leave_type_id ||
      !formData.start_date ||
      !formData.end_date
    ) {
      return toast.error("Please fill required fields");
    }

    setLoading(true);
    try {
      await leaveApi.applyBehalf({
        target_employee_id: parseInt(formData.target_employee_id),
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || undefined,
      });
      toast.success("Leave applied successfully");
      setFormData({
        target_employee_id: "",
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
    } catch {
      toast.error("Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Apply on Behalf</h1>
          <p>Submit a leave application for an employee directly</p>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: "var(--sp-xl)", maxWidth: 600, margin: "0 auto" }}
      >
        <form
          onSubmit={handleApply}
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
              value={formData.target_employee_id}
              onChange={(e) =>
                setFormData({ ...formData, target_employee_id: e.target.value })
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
            <label>Leave Type *</label>
            <select
              className="form-control"
              value={formData.leave_type_id}
              onChange={(e) =>
                setFormData({ ...formData, leave_type_id: e.target.value })
              }
              required
            >
              <option value="">-- Choose Leave Type --</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--sp-md)",
            }}
          >
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
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              className="form-control"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Reason for leave"
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
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Applying..." : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
