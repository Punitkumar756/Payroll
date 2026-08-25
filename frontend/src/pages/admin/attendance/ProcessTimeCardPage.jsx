import React, { useEffect, useState, useMemo } from "react";
import { attendanceApi, employeesApi, departmentsApi, locationsApi } from "../../../api";
import toast from "react-hot-toast";
import { Calculator, CalendarDays, Users, AlertTriangle, PlayCircle, Settings2, CheckCircle, RefreshCcw, Filter, Search } from "lucide-react";

export default function ProcessTimeCardPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [locFilter, setLocFilter] = useState("");

  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    overwrite_manual: false,
    all_employees: true,
  });
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

  useEffect(() => {
    Promise.all([
      employeesApi.list({ status: "Active" }),
      departmentsApi.list().catch(()=>[]),
      locationsApi.list().catch(()=>[])
    ])
      .then(([emps, depts, locs]) => {
        setEmployees(Array.isArray(emps) ? emps : []);
        setDepartments(Array.isArray(depts) ? depts : []);
        setLocations(Array.isArray(locs) ? locs : []);
      })
      .catch(() => toast.error("Failed to load initial data"));
  }, []);

  const setQuickDate = (type) => {
    const today = new Date();
    let from, to;
    if (type === 'current_month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (type === 'last_month') {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0);
    }
    
    if (from && to) {
      // Format as YYYY-MM-DD local time
      const fmt = (d) => {
        const offset = d.getTimezoneOffset();
        const adjusted = new Date(d.getTime() - (offset*60*1000));
        return adjusted.toISOString().split('T')[0];
      };
      setFormData(f => ({ ...f, from_date: fmt(from), to_date: fmt(to) }));
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = (emp.first_name + " " + (emp.last_name||"") + " " + emp.employee_code).toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter ? String(emp.department_id) === String(deptFilter) : true;
      const matchLoc = locFilter ? String(emp.location_id) === String(locFilter) : true;
      return matchSearch && matchDept && matchLoc;
    });
  }, [employees, searchQuery, deptFilter, locFilter]);

  const toggleEmployee = (id) => {
    const next = new Set(selectedEmployees);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmployees(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedEmployees);
    const allSelected = filteredEmployees.every(e => next.has(e.id));
    if (allSelected) {
      filteredEmployees.forEach(e => next.delete(e.id));
    } else {
      filteredEmployees.forEach(e => next.add(e.id));
    }
    setSelectedEmployees(next);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!formData.from_date || !formData.to_date)
      return toast.error("From and To dates are required");
    if (!formData.all_employees && selectedEmployees.size === 0)
      return toast.error("Select at least one employee");

    setLoading(true);
    setResult(null);
    try {
      const res = await attendanceApi.processTimecard({
        from_date: formData.from_date,
        to_date: formData.to_date,
        overwrite_manual: formData.overwrite_manual ? 1 : 0,
        employee_ids: formData.all_employees
          ? employees.map((e) => e.id)
          : Array.from(selectedEmployees),
      });
      toast.success("Timecard processed successfully");
      setResult({
        recordsProcessed: res?.records_processed || 0,
        fromDate: formData.from_date,
        toDate: formData.to_date,
      });
    } catch {
      toast.error("Failed to process timecard");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-icon" style={{ width: 48, height: 48, background: 'var(--grad-primary)', color: 'white', border: 'none' }}>
              <Calculator size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700 }}>Process Timecard</h1>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--clr-text-muted)', fontSize: '0.95rem' }}>
                Run the attendance engine to compute statuses, OT, and penalties for payroll.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {result ? (
          <div className="card animate-slide" style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ 
              width: 80, height: 80, 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--clr-text-primary)' }}>Processing Complete</h2>
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              Successfully finalized attendance from <strong>{result.fromDate}</strong> to <strong>{result.toDate}</strong>.
            </p>
            
            <div style={{ 
              background: 'var(--clr-bg-input)', 
              borderRadius: '12px',
              padding: '2rem',
              display: 'inline-block',
              marginBottom: '2.5rem',
              minWidth: 250
            }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--clr-primary)', lineHeight: 1 }}>
                {result.recordsProcessed}
              </div>
              <div style={{ color: 'var(--clr-text-muted)', marginTop: '0.75rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Daily Records Finalized
              </div>
            </div>
            
            <div>
              <button className="btn btn-outline" onClick={resetForm} style={{ padding: '0.75rem 1.5rem', borderRadius: '100px' }}>
                <RefreshCcw size={18} /> Process Another Period
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'var(--clr-bg-alt)', borderBottom: '1px solid var(--clr-border)' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings2 size={20} className="text-primary" />
                Processing Parameters
              </h2>
            </div>

            <div style={{ padding: '2rem' }}>
              <form onSubmit={handleProcess} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                
                {/* 1. Date Selection */}
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--clr-text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={18} /> 1. Select Pay Period
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '8px' }} onClick={() => setQuickDate('last_month')}>Last Month</button>
                    <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '8px' }} onClick={() => setQuickDate('current_month')}>Current Month</button>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">From Date *</label>
                      <input type="date" className="form-input" value={formData.from_date} onChange={(e) => setFormData({ ...formData, from_date: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">To Date *</label>
                      <input type="date" className="form-input" value={formData.to_date} onChange={(e) => setFormData({ ...formData, to_date: e.target.value })} required />
                    </div>
                  </div>
                </div>

                {/* 2. Overwrite Policy */}
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--clr-text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} /> 2. Exception Handling
                  </h3>
                  <div style={{ 
                    background: formData.overwrite_manual ? 'rgba(245, 158, 11, 0.1)' : 'var(--clr-bg-input)', 
                    border: `1px solid ${formData.overwrite_manual ? 'rgba(245, 158, 11, 0.3)' : 'var(--clr-border)'}`, 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px',
                    transition: 'all 0.2s'
                  }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.overwrite_manual}
                        onChange={(e) => setFormData({ ...formData, overwrite_manual: e.target.checked })}
                        style={{ width: 18, height: 18, marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: formData.overwrite_manual ? 'var(--clr-warning)' : 'var(--clr-text-primary)' }}>
                          Overwrite Manual Corrections
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                          If checked, the engine will strictly recalculate based on shifts and punches, completely erasing any manual tweaks HR has made for this period.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Target Employees */}
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--clr-text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} /> 3. Target Population
                  </h3>
                  
                  <div style={{ 
                    background: formData.all_employees ? 'rgba(99, 102, 241, 0.05)' : 'var(--clr-bg-input)',
                    border: `1px solid ${formData.all_employees ? 'rgba(99, 102, 241, 0.3)' : 'var(--clr-border)'}`,
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    marginBottom: formData.all_employees ? 0 : '1rem'
                  }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.all_employees}
                        onChange={(e) => setFormData({ ...formData, all_employees: e.target.checked })}
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ fontWeight: 600, color: formData.all_employees ? 'var(--clr-primary)' : 'var(--clr-text-primary)' }}>
                        Process for ALL Active Employees
                      </span>
                    </label>
                  </div>

                  {!formData.all_employees && (
                    <div style={{ border: '1px solid var(--clr-border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', background: 'var(--clr-bg-alt)', borderBottom: '1px solid var(--clr-border)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="input-wrapper" style={{ margin: 0, flex: '1 1 200px' }}>
                          <Search size={16} />
                          <input type="text" className="form-input" placeholder="Search employee..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
                          <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ margin: 0 }}>
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <select className="form-select" value={locFilter} onChange={e => setLocFilter(e.target.value)} style={{ margin: 0 }}>
                            <option value="">All Locations</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-primary)' }}>
                          {selectedEmployees.size} selected of {filteredEmployees.length} filtered
                        </span>
                        <button type="button" className="btn btn-link" onClick={selectAllFiltered} style={{ padding: 0, fontSize: '0.85rem' }}>
                          Select / Deselect All Filtered
                        </button>
                      </div>

                      <div style={{ maxHeight: 300, overflowY: "auto", padding: "0.5rem" }}>
                        {filteredEmployees.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No employees match filters.</div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                            {filteredEmployees.map((emp) => (
                              <label key={emp.id} style={{ 
                                display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", cursor: "pointer", 
                                borderRadius: '8px', 
                                background: selectedEmployees.has(emp.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                border: `1px solid ${selectedEmployees.has(emp.id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}`
                              }}>
                                <input type="checkbox" checked={selectedEmployees.has(emp.id)} onChange={() => toggleEmployee(emp.id)} />
                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{emp.first_name} {emp.last_name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{emp.employee_code}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--clr-border)" }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ background: 'var(--grad-primary)', padding: '12px 40px', borderRadius: '100px', fontSize: '1.05rem' }}>
                    <PlayCircle size={22} />
                    {loading ? "Processing..." : "Run Timecard Processor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
