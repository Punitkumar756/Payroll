import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";

export default function ManualAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: "",
    day_status: "Present",
    check_in: "",
    check_out: "",
    remarks: "",
  });

  useEffect(() => {
    employeesApi
      .list({ status: "Active" })
      .then(setEmployees)
      .catch(() => toast.error("Failed to load employees"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !formData.employee_id ||
      !formData.attendance_date ||
      !formData.day_status
    )
      return toast.error("Please fill required fields");

    setLoading(true);
    try {
      await attendanceApi.manualUpdate({
        employee_id: parseInt(formData.employee_id),
        attendance_date: formData.attendance_date,
        day_status: formData.day_status,
        check_in: formData.check_in || undefined,
        check_out: formData.check_out || undefined,
        remarks: formData.remarks || undefined,
      });
      toast.success("Attendance updated manually");
      setFormData({ ...formData, check_in: "", check_out: "", remarks: "" }); // keep emp/date for quick entry
    } catch {
      toast.error("Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Manual Attendance</h1>
          <p>
            Override system-computed attendance for specific dates and employees
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: "var(--sp-xl)", maxWidth: 600, margin: "0 auto" }}
      >
        <form
          onSubmit={handleUpdate}
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
            <label>Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.attendance_date}
              onChange={(e) =>
                setFormData({ ...formData, attendance_date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Day Status *</label>
            <select
              className="form-control"
              value={formData.day_status}
              onChange={(e) =>
                setFormData({ ...formData, day_status: e.target.value })
              }
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
              <option value="Week Off">Week Off</option>
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
              <label>Check In (HH:MM) Optional</label>
              <input
                type="time"
                className="form-control"
                value={formData.check_in}
                onChange={(e) =>
                  setFormData({ ...formData, check_in: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Check Out (HH:MM) Optional</label>
              <input
                type="time"
                className="form-control"
                value={formData.check_out}
                onChange={(e) =>
                  setFormData({ ...formData, check_out: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              className="form-control"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Reason for manual update"
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
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
