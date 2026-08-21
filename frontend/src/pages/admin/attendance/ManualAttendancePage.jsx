import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";
import { UserCheck, Clock, Calendar, Save, FileText, CheckCircle2 } from "lucide-react";

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
      setFormData({ ...formData, check_in: "", check_out: "", remarks: "" }); 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon indigo" style={{ width: 42, height: 42 }}>
              <UserCheck size={22} />
            </div>
            <div>
              <h1>Manual Attendance</h1>
              <p>Override system-computed attendance for specific dates and employees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} className="text-primary" />
            Attendance Entry
          </h2>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <UserCheck size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Employee *
                </label>
                <select
                  className="form-input"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
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
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.attendance_date}
                  onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Day Status *</label>
                <select
                  className="form-input"
                  value={formData.day_status}
                  onChange={(e) => setFormData({ ...formData, day_status: e.target.value })}
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

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Check In (Optional)
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                  Check Out (Optional)
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
                Remarks
              </label>
              <textarea
                className="form-textarea"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Reason for manual update (e.g., Forgot to clock in)"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-sm)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--clr-border)" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                <Save size={18} />
                {loading ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
