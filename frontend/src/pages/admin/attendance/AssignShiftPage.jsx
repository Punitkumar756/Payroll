import React, { useEffect, useState } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";
import { Users, CalendarRange, Clock, CheckSquare, Save, Download, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

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

  const [reportFilters, setReportFilters] = useState({
    shift_id: "",
    employee_id: "",
    from_date: "",
    to_date: "",
  });
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [activeTab, setActiveTab] = useState("single");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = React.useRef(null);

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

  useEffect(() => {
    setReportLoading(true);
    attendanceApi.getShiftAssignmentReport(reportFilters)
      .then(setReportData)
      .catch(() => toast.error("Failed to load assignments"))
      .finally(() => setReportLoading(false));
  }, [reportFilters]);

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

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return toast.error("Please select a file to upload");
    setLoading(true);
    setResult(null);
    try {
      const res = await attendanceApi.bulkAssignShift(file);
      setResult({
        successCount: res.successCount,
        failCount: res.failCount,
        errors: res.errors
      });
      if (res.failCount === 0) toast.success(`Successfully assigned ${res.successCount} shifts!`);
      else toast.error(`Assigned with some errors.`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "employee_id,shift_id,effective_from,effective_to";
    const blob = new Blob([headers + "\n1,2,2026-08-22,"], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shift_assignment_bulk_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadReport = async () => {
    if (reportData.length === 0) {
      toast.info("No records found for the selected filters");
      return;
    }
    
    setDownloading(true);
    try {
      const csvLines = [];
      const headers = ["Assignment ID", "Employee Code", "First Name", "Last Name", "Shift Name", "Start Time", "End Time", "Effective From", "Effective To"];
      csvLines.push(headers.join(","));
      
      reportData.forEach(row => {
        const line = [
          row.assignment_id,
          row.employee_code,
          row.first_name,
          row.last_name,
          row.shift_name,
          row.start_time,
          row.end_time,
          row.effective_from ? row.effective_from.split('T')[0] : '',
          row.effective_to ? row.effective_to.split('T')[0] : ''
        ];
        csvLines.push(line.map(val => `"${val}"`).join(","));
      });
      
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shift_assignments_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to generate CSV");
    } finally {
      setDownloading(false);
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
              <p>Assign working shifts to employees and view assigned shifts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--clr-border)', width: '100%' }}>
            <button 
              className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--r-md) var(--r-md) 0 0', borderBottom: activeTab === 'single' ? '2px solid var(--clr-primary)' : 'none' }}
              onClick={() => setActiveTab("single")}
            >
              Assign Shift
            </button>
            <button 
              className={`btn ${activeTab === 'assigned' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--r-md) var(--r-md) 0 0', borderBottom: activeTab === 'assigned' ? '2px solid var(--clr-primary)' : 'none' }}
              onClick={() => setActiveTab("assigned")}
            >
              Assigned Shifts
            </button>
          </div>
        </div>

        <div className="card-body" style={{ paddingTop: '1.5rem' }}>
          {activeTab === "single" ? (
            <form onSubmit={handleAssign} className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
              
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
          ) : (
            <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Assigned Shifts</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadReport} disabled={downloading || reportData.length === 0}>
                  <Download size={16} style={{ marginRight: '6px' }} />
                  {downloading ? "Downloading..." : "Download CSV"}
                </button>
              </div>

              <div className="form-row-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Filter by Employee</label>
                  <select
                    className="form-input"
                    value={reportFilters.employee_id}
                    onChange={(e) => setReportFilters({ ...reportFilters, employee_id: e.target.value })}
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employee_code} - {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Filter by Shift</label>
                  <select
                    className="form-input"
                    value={reportFilters.shift_id}
                    onChange={(e) => setReportFilters({ ...reportFilters, shift_id: e.target.value })}
                  >
                    <option value="">All Shifts</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reportFilters.from_date}
                    onChange={(e) => setReportFilters({ ...reportFilters, from_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reportFilters.to_date}
                    onChange={(e) => setReportFilters({ ...reportFilters, to_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Shift</th>
                      <th>Time</th>
                      <th>Effective Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading assignments...</td>
                      </tr>
                    ) : reportData.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No shift assignments found for these filters.</td>
                      </tr>
                    ) : (
                      reportData.map((row) => (
                        <tr key={row.assignment_id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{row.employee_code}</div>
                          </td>
                          <td>
                            <span className="badge badge-amber">{row.shift_name}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.9rem' }}>{row.start_time} - {row.end_time}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.9rem' }}>
                              From: {row.effective_from ? new Date(row.effective_from).toLocaleDateString() : '-'}
                            </div>
                            {row.effective_to && (
                              <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
                                To: {new Date(row.effective_to).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
