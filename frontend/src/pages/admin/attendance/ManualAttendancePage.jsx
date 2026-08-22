import React, { useEffect, useState, useRef } from "react";
import { attendanceApi, employeesApi } from "../../../api";
import toast from "react-hot-toast";
import { UserCheck, Clock, Calendar, Save, FileText, CheckCircle2, Upload, Download, AlertCircle, X } from "lucide-react";

export default function ManualAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single"); // "single" | "bulk"

  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: "",
    day_status: "Present",
    check_in: "",
    check_out: "",
    remarks: "",
  });

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

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
      const res = await attendanceApi.bulkManualUpdate(file);
      setResult({
        successCount: res.successCount,
        failCount: res.failCount,
        errors: res.errors
      });
      if (res.failCount === 0) toast.success(`Successfully imported ${res.successCount} records!`);
      else toast.error(`Imported with some errors.`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "employee_id,attendance_date,day_status,check_in,check_out,remarks";
    const blob = new Blob([headers + "\n1,2026-08-22,Present,09:00,18:00,Forgot punch"], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_bulk_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--clr-border)', width: '100%' }}>
            <button 
              className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--r-md) var(--r-md) 0 0', borderBottom: activeTab === 'single' ? '2px solid var(--clr-primary)' : 'none' }}
              onClick={() => setActiveTab("single")}
            >
              Single Entry
            </button>
            <button 
              className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--r-md) var(--r-md) 0 0', borderBottom: activeTab === 'bulk' ? '2px solid var(--clr-primary)' : 'none' }}
              onClick={() => setActiveTab("bulk")}
            >
              Bulk Import (CSV)
            </button>
          </div>
        </div>
        
        <div className="card-body" style={{ paddingTop: '1.5rem' }}>
          {activeTab === "single" ? (
            <form onSubmit={handleUpdate} className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
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
          ) : (
            <div className="animate-fade" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Upload Attendance CSV</h4>
                  <p style={{ margin: '4px 0 0', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Columns needed: employee_id, attendance_date, day_status, check_in, check_out, remarks</p>
                </div>
                <button className="btn btn-outline" onClick={downloadTemplate}>
                  <Download size={16} /> Download Template
                </button>
              </div>

              <div 
                onDragOver={handleDragOver} 
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--clr-border)',
                  borderRadius: 'var(--r-lg)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: file ? 'rgba(99,102,241,0.05)' : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <>
                    <Upload size={48} style={{ color: 'var(--clr-border)', margin: '0 auto 1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Drag & Drop your CSV file here</h4>
                    <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>or click to browse</p>
                  </>
                ) : (
                  <>
                    <FileText size={48} className="text-primary" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--clr-primary)' }}>{file.name}</h4>
                    <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>{(file.size / 1024).toFixed(2)} KB</p>
                    
                    <button 
                      className="btn btn-ghost" 
                      style={{ marginTop: '1rem', color: 'var(--clr-danger)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Remove File
                    </button>
                  </>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button 
                  className="btn btn-primary btn-lg" 
                  disabled={!file || loading}
                  onClick={handleBulkUpload}
                >
                  {loading ? <span className="spinner" style={{ marginRight: 8 }} /> : <Upload size={18} style={{ marginRight: 8 }} />}
                  {loading ? "Processing..." : "Start Import"}
                </button>
              </div>

              {result && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: `1px solid ${result.failCount === 0 ? '#10b981' : '#ef4444'}`, borderRadius: 'var(--r-md)', background: result.failCount === 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                  <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {result.failCount === 0 ? <CheckCircle2 className="text-success" /> : <AlertCircle className="text-danger" />}
                    Import Results: {result.successCount} Success, {result.failCount} Failed
                  </h4>
                  {result.errors?.length > 0 && (
                    <ul style={{ color: '#991b1b', margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                      {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
