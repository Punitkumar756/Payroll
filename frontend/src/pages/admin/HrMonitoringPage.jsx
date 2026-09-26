import { useEffect, useState } from "react";
import { dashboardApi } from "../../api";
import toast from "react-hot-toast";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { Clock, Calendar, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

export default function HrMonitoringPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timingFilter, setTimingFilter] = useState("All");

  const loadData = async (dateStr) => {
    try {
      setLoading(true);
      const data = await dashboardApi.getMonitoring({ date: dateStr });
      setRecords(data || []);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to load monitoring data");
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

  const calculateTiming = (record) => {
    if (!record.check_in || !record.shift_start_time) return { status: "N/A", text: "—", color: "gray" };

    try {
      // Assuming check_in is UTC ISO string and shift_start_time is HH:mm:ss local
      const inTime = parseISO(record.check_in);
      
      // Parse shift start time on the selected date
      const shiftStartStr = `${selectedDate}T${record.shift_start_time}`;
      const shiftStartTime = new Date(shiftStartStr);
      
      const diffMins = differenceInMinutes(inTime, shiftStartTime);

      if (diffMins > 0) {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        return { status: "Late", text: `Late by ${h > 0 ? `${h}h ` : ""}${m}m`, color: "red" };
      } else if (diffMins < 0) {
        const absMins = Math.abs(diffMins);
        const h = Math.floor(absMins / 60);
        const m = absMins % 60;
        return { status: "Early", text: `Early by ${h > 0 ? `${h}h ` : ""}${m}m`, color: "green" };
      } else {
        return { status: "On Time", text: "On Time", color: "green" };
      }
    } catch (e) {
      return { status: "Error", text: "Invalid time", color: "gray" };
    }
  };

  const uniqueDepartments = Array.from(new Set(records.map(r => r.department_name).filter(Boolean))).sort();

  const processedRecords = records.map(r => {
    return { ...r, timing: calculateTiming(r) };
  });

  const filteredRecords = processedRecords.filter(r => {
    let match = true;
    if (deptFilter !== "All" && r.department_name !== deptFilter) match = false;
    if (statusFilter !== "All" && (r.day_status || "").toLowerCase() !== statusFilter.toLowerCase()) match = false;
    if (timingFilter !== "All" && r.timing.status !== timingFilter) match = false;
    return match;
  });

  return (
    <div className="animate-fade">
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '2rem',
        borderRadius: 'var(--r-lg)',
        color: '#fff',
        boxShadow: 'var(--shadow-glow, var(--shadow-sm))'
      }}>
        <div className="page-header-left">
          <h1 style={{ color: '#fff' }}>Live HR Monitoring</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Monitor employee attendance, lateness, and leaves for any specific date</p>
        </div>
        <div className="page-header-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none', cursor: 'pointer' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All" style={{ color: '#000' }}>All Departments</option>
            {uniqueDepartments.map(d => (
              <option key={d} value={d} style={{ color: '#000' }}>{d}</option>
            ))}
          </select>
          
          <select
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All" style={{ color: '#000' }}>All Day Status</option>
            <option value="present" style={{ color: '#000' }}>Present</option>
            <option value="absent" style={{ color: '#000' }}>Absent</option>
            <option value="leave" style={{ color: '#000' }}>Leave</option>
            <option value="halfday" style={{ color: '#000' }}>Half Day</option>
            <option value="not processed" style={{ color: '#000' }}>Not Processed</option>
          </select>

          <select
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none', cursor: 'pointer' }}
            value={timingFilter}
            onChange={(e) => setTimingFilter(e.target.value)}
          >
            <option value="All" style={{ color: '#000' }}>All Timings</option>
            <option value="Late" style={{ color: '#000' }}>Late</option>
            <option value="Early" style={{ color: '#000' }}>Early</option>
            <option value="On Time" style={{ color: '#000' }}>On Time</option>
          </select>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} />
            <input
              type="date"
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              value={selectedDate}
              onChange={handleDateChange}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p className="text-muted" style={{ marginTop: '1rem' }}>Loading monitoring data...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Punch Time</th>
                  <th>Timing Status</th>
                  <th>Leave Usage</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted" style={{ padding: '3rem' }}>
                      No records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, index) => {
                    const timing = r.timing;
                    const s = r.day_status?.toLowerCase() || '';
                    let statusBadge = 'badge-gray';
                    if (s === 'present') statusBadge = 'badge-green';
                    if (s === 'absent') statusBadge = 'badge-red';
                    if (s === 'leave') statusBadge = 'badge-indigo';

                    return (
                      <tr key={r.employee_id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        <td style={{ color: "var(--clr-text-muted)" }}>{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--clr-text-primary)' }}>{r.employee_name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>
                            ID: {r.employee_code}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-primary)' }}></span>
                            {r.department_name || "—"}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${statusBadge}`}>
                            {r.day_status}
                          </span>
                        </td>
                        <td>
                          {r.check_in ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock size={14} className="text-muted" />
                              <span>{format(parseISO(r.check_in), "hh:mm a")}</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td>
                          {r.check_in ? (
                            <span style={{ 
                              color: `var(--clr-${timing.color === 'red' ? 'danger' : 'success'})`, 
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: `var(--clr-${timing.color === 'red' ? 'danger' : 'success'}-glow)`,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              width: 'fit-content'
                            }}>
                              {timing.color === 'red' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                              {timing.text}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>Remaining:</span> <strong style={{ color: 'var(--clr-primary)' }}>{r.total_leave_balance || 0}</strong> days
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>Used:</span> <strong>{r.total_leave_used || 0}</strong> days
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
