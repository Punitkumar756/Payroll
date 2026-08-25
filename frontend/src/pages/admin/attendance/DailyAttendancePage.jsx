import { useEffect, useState } from "react";
import { attendanceApi } from "../../../api";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function DailyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [shiftFilter, setShiftFilter] = useState("All");

  const loadData = async (dateStr) => {
    try {
      setLoading(true);
      const data = await attendanceApi.getDaily({ date: dateStr });
      setRecords(data || []);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to load daily attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'present') return 'badge-green';
    if (s === 'absent') return 'badge-red';
    if (s === 'leave') return 'badge-indigo';
    if (s === 'holiday') return 'badge-amber';
    if (s === 'weekoff') return 'badge-gray';
    if (s === 'halfday') return 'badge-amber';
    return 'badge-gray';
  };

  const uniqueDepartments = Array.from(new Set(records.map(r => r.department_name).filter(Boolean))).sort();
  const uniqueShifts = Array.from(new Set(records.map(r => r.shift_name).filter(Boolean))).sort();

  const filteredRecords = records.filter(r => {
    let match = true;
    if (statusFilter !== "All" && (r.day_status || "").toLowerCase() !== statusFilter.toLowerCase()) match = false;
    if (deptFilter !== "All" && r.department_name !== deptFilter) match = false;
    if (shiftFilter !== "All" && r.shift_name !== shiftFilter) match = false;
    return match;
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Daily Attendance</h1>
          <p className="text-muted">View who is present and absent on a specific day</p>
        </div>
        <div className="page-header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="input"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Depts</option>
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            className="input"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
          >
            <option value="All">All Shifts</option>
            {uniqueShifts.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">On Leave</option>
            <option value="HalfDay">Half Day</option>
            <option value="Holiday">Holiday</option>
            <option value="WeekOff">Week Off</option>
            <option value="Not Processed">Not Processed</option>
          </select>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={handleDateChange}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th>Emp ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, index) => (
                    <tr key={r.employee_id}>
                      <td style={{ color: "var(--clr-text-muted)" }}>{index + 1}</td>
                      <td>
                        <span className="badge badge-gray">{r.employee_code}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.employee_name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>
                          {r.designation_name}
                        </div>
                      </td>
                      <td>{r.department_name || "—"}</td>
                      <td>{r.shift_name || "—"}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(r.day_status)}`}>
                          {r.day_status}
                        </span>
                      </td>
                      <td>
                        {r.check_in ? format(new Date(r.check_in), "hh:mm a") : "—"}
                      </td>
                      <td>
                        {r.check_out ? format(new Date(r.check_out), "hh:mm a") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
