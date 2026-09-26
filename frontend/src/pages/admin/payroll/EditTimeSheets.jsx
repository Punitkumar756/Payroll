import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, RotateCcw, Download, 
  Calendar, Clock, ArrowLeft, X, FileText, FileSpreadsheet, Loader, AlertCircle
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/payroll';
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export default function EditTimeSheets({ onBack }) {
  const [payPeriod, setPayPeriod] = useState('May 2025 (01 May 2025 - 31 May 2025)');
  const [month, setMonth] = useState('May 2025');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [activeEmployee, setActiveEmployee] = useState('EMP001');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // API States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Comprehensive mock database for all employees (stored as mutable state)
  const [employeeDataMap, setEmployeeDataMap] = useState({});

  const [formData, setFormData] = useState(employeeDataMap['EMP001']);

  // New Timesheet Form State (Includes all input properties)
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    dept: 'IT Department',
    period: payPeriod,
    month: month,
    totalDays: '31.00', 
    daysPresent: '22.00', 
    daysAbsent: '0.00', 
    holidays: '2.00', 
    weekoffs: '4.00',
    holidaysWorked: '0.00', 
    weekoffsWorked: '0.00', 
    shortHoursWorked: '0.00', 
    earlyDays: '0.00', 
    lateDays: '0.00',
    paidLeaves: '0.00', 
    unpaidLeaves: '0.00', 
    hoursWorked: '176.00', 
    hoursWorkedOnHoliday: '0.00', 
    hoursWorkedOnWeekoff: '0.00',
    lateHours: '0.00', 
    earlyHours: '0.00', 
    otHoursWorked: '0.00', 
    shortNormalHours: '0.00', 
    shortOtHours: '0.00',
    shortSpecialOtHours: '0.00', 
    splOtHoursWorked: '0.00',
    status: 'Processed'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewEmpInputChange = (field, value) => {
    setNewEmpData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectEmployee = (empCode) => {
    setActiveEmployee(empCode);
    if (employeeDataMap[empCode]) {
      setFormData(employeeDataMap[empCode]);
    }
    setIsModalOpen(true);
  };

  const handleResetEditForm = () => {
    const originalData = employeeDataMap[activeEmployee];
    if (originalData) {
      setFormData(originalData);
    }
  };

  // Compute filtered records dynamically with empty checks for All button support
  const allRecords = Object.values(employeeDataMap);
  const query = searchEmployee.trim().toLowerCase();

  const records = allRecords.filter(emp => {
    const matchesPeriod = !payPeriod || emp.period === payPeriod;
    const matchesMonth = !month || emp.month === month;
    const matchesQuery = !query || 
      emp.name.toLowerCase().includes(query) || 
      emp.code.toLowerCase().includes(query) || 
      emp.dept.toLowerCase().includes(query);

    return matchesPeriod && matchesMonth && matchesQuery;
  });

  const handleShowAll = () => {
    setSearchEmployee('');
    setPayPeriod('');
    setMonth('');
  };

  const handleReset = () => {
    setSearchEmployee('');
    setPayPeriod('May 2025 (01 May 2025 - 31 May 2025)');
    setMonth('May 2025');
  };

  // Show Toast Message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. FETCH API: Get all timesheets from backend
  useEffect(() => {
    const fetchTimeSheets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/timesheets`, {
          method: 'GET',
          headers: API_HEADERS
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch timesheets`);
        }
        const data = await response.json();
        // Update employeeDataMap with fetched data
        const dataMap = {};
        (data.timesheets || data).forEach(ts => {
          dataMap[ts.code] = ts;
        });
        if (Object.keys(dataMap).length > 0) {
          setEmployeeDataMap(dataMap);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching timesheets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeSheets();
  }, []);

  // 2. PUT API: Update timesheet record
  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/timesheets/${activeEmployee}`, {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to update timesheet`);
      }

      const updatedData = await response.json();
      setEmployeeDataMap(prev => ({
        ...prev,
        [activeEmployee]: updatedData
      }));

      showToast(`Time sheet for ${formData.name} (${activeEmployee}) updated successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error updating timesheet:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. POST API: Create new timesheet
  const handleCreateNewSubmit = async (e) => {
    e.preventDefault();
    if (!newEmpData.name.trim()) {
      showToast('Please enter a valid employee name.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/timesheets`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          ...newEmpData,
          period: payPeriod || 'May 2025 (01 May 2025 - 31 May 2025)',
          month: month || 'May 2025'
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to create timesheet`);
      }

      const createdRecord = await response.json();
      setEmployeeDataMap(prev => ({
        ...prev,
        [createdRecord.code]: createdRecord
      }));

      showToast(`New timesheet created successfully for ${newEmpData.name}!`);
      setIsCreateModalOpen(false);
      setNewEmpData({
        name: '',
        dept: 'IT Department',
        period: payPeriod,
        month: month,
        totalDays: '31.00', 
        daysPresent: '22.00', 
        daysAbsent: '0.00', 
        holidays: '2.00', 
        weekoffs: '4.00',
        holidaysWorked: '0.00', 
        weekoffsWorked: '0.00', 
        shortHoursWorked: '0.00', 
        earlyDays: '0.00', 
        lateDays: '0.00',
        paidLeaves: '0.00', 
        unpaidLeaves: '0.00', 
        hoursWorked: '176.00', 
        hoursWorkedOnHoliday: '0.00', 
        hoursWorkedOnWeekoff: '0.00',
        lateHours: '0.00', 
        earlyHours: '0.00', 
        otHoursWorked: '0.00', 
        shortNormalHours: '0.00', 
        shortOtHours: '0.00',
        shortSpecialOtHours: '0.00', 
        splOtHoursWorked: '0.00',
        status: 'Processed'
      });
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error creating timesheet:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Export Function
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("No records available to export for the selected filter.");
      return;
    }

    const headers = ['Employee Code', 'Employee Name', 'Department', 'Pay Period', 'Month', 'Total Days', 'Days Present', 'Days Absent', 'Total Hours', 'Status', 'Last Updated'];
    const rows = records.map(r => [
      r.code,
      `"${r.name}"`,
      `"${r.dept}"`,
      `"${r.period}"`,
      r.month,
      r.totalDays,
      r.daysPresent,
      r.daysAbsent,
      r.hoursWorked,
      r.status,
      `"${r.updated}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Timesheets_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Function (Generates a clean text/HTML formatted print layout)
  const handleExportPDF = () => {
    if (records.length === 0) {
      alert("No records available to export for the selected filter.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export the PDF report.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timesheets Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #0f172a; }
            h2 { margin-bottom: 4px; }
            p { font-size: 12px; color: #64748b; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Employee Timesheets Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Pay Period</th>
                <th>Total Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(r => `
                <tr>
                  <td>${r.code}</td>
                  <td>${r.name}</td>
                  <td>${r.dept}</td>
                  <td>${r.period}</td>
                  <td>${r.totalDays}</td>
                  <td>${r.daysPresent}</td>
                  <td>${r.daysAbsent}</td>
                  <td>${r.hoursWorked}</td>
                  <td>${r.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const inputStyle = {
    width: '100%', 
    padding: '8px 10px', 
    borderRadius: '6px', 
    border: '1px solid #cbd5e1', 
    fontSize: '12px', 
    outline: 'none', 
    boxSizing: 'border-box', 
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      {onBack && (
        <button 
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
            color: 'var(--clr-primary)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      )}

      {/* Main Card Container */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <div style={{ padding: 'clamp(16px, 3vw, 24px)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px, 2.2vw, 20px)', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Edit Time Sheets</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Click on any row to open the update popup for days and hours worked details.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ backgroundColor: 'var(--clr-primary)', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> Create New Time Sheet
          </button>
        </div>

        {/* Filter Toolbar Controls */}
        <div style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Pay Period *</label>
            <select 
              value={payPeriod} 
              onChange={(e) => setPayPeriod(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Periods</option>
              <option>May 2025 (01 May 2025 - 31 May 2025)</option>
              <option>June 2025 (01 Jun 2025 - 30 Jun 2025)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Month *</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Months</option>
              <option>May 2025</option>
              <option>June 2025</option>
            </select>
          </div>

          {/* Search Box with Action Buttons Placed Right Beside It */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Search Employee & Export Actions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 200px', minWidth: 0 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '32px' }}
                />
              </div>

              <button 
                onClick={handleShowAll} 
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                👥 All
              </button>
              <button 
                onClick={handleReset} 
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <RotateCcw size={14} /> Reset
              </button>
              
              {/* PDF Export Button */}
              <button 
                onClick={handleExportPDF}
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <FileText size={14} /> PDF
              </button>

              {/* CSV Export Button */}
              <button 
                onClick={handleExportCSV}
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <FileSpreadsheet size={14} /> CSV
              </button>
            </div>
          </div>

        </div>

        {/* Data Table with Vertical Scroll */}
        {error && (
          <div role="status" style={{ margin: '12px 16px 0', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '12px' }}>
            Live data is unavailable. Showing the available local records. You can retry by refreshing the page.
          </div>
        )}
        <div style={{ width: '100%', maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', minWidth: '900px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Employee Code</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Employee Name</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Pay Period</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Month</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Total Days</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Days Present</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Days Absent</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Total Hours</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc' }}>Last Updated On</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((rec, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => handleSelectEmployee(rec.code)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelectEmployee(rec.code);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Edit timesheet for ${rec.name}`}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{rec.code}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1e293b' }}>{rec.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.dept}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.period}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.month}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.totalDays}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.daysPresent}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.daysAbsent}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{rec.hoursWorked}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                        backgroundColor: rec.status === 'Processed' ? '#dcfce7' : '#fef3c7',
                        color: rec.status === 'Processed' ? '#16a34a' : '#d97706'
                      }}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{rec.updated}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Record Count */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing {records.length} of {Object.keys(employeeDataMap).length} records</span>
        </div>

      </div>

      {/* Modal Popup for Editing Time Sheet Details */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '850px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex', flexDirection: 'column'
          }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                  Update Time Sheet - {formData.code} ({formData.name})
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  {formData.dept} • {formData.period}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Days Worked Details Box */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--clr-primary)', fontWeight: '700', fontSize: '13px' }}>
                    <Calendar size={16} /> Days Worked Details
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                    {[
                      { label: 'Total Days', key: 'totalDays' },
                      { label: 'Days Present', key: 'daysPresent' },
                      { label: 'Days Absent', key: 'daysAbsent' },
                      { label: 'Holidays', key: 'holidays' },
                      { label: 'Weekoffs', key: 'weekoffs' },
                      { label: 'Holidays Worked', key: 'holidaysWorked' },
                      { label: 'Weekoffs Worked', key: 'weekoffsWorked' },
                      { label: 'Short Hours Worked', key: 'shortHoursWorked' },
                      { label: 'Early Days', key: 'earlyDays' },
                      { label: 'Late Days', key: 'lateDays' },
                      { label: 'Paid Leaves', key: 'paidLeaves' },
                      { label: 'Unpaid Leaves', key: 'unpaidLeaves' }
                    ].map((field, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>{field.label}</label>
                        <input 
                          type="text" 
                          value={formData[field.key] || ''} 
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hours Worked Details Box */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--clr-primary)', fontWeight: '700', fontSize: '13px' }}>
                    <Clock size={16} /> Hours Worked Details
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                    {[
                      { label: 'Hours Worked', key: 'hoursWorked' },
                      { label: 'Hours Worked on Holiday', key: 'hoursWorkedOnHoliday' },
                      { label: 'Hours Worked on Weekoff', key: 'hoursWorkedOnWeekoff' },
                      { label: 'Late Hours', key: 'lateHours' },
                      { label: 'Early Hours', key: 'earlyHours' },
                      { label: 'OT Hours Worked', key: 'otHoursWorked' },
                      { label: 'Short Normal Hours', key: 'shortNormalHours' },
                      { label: 'Short OT Hours', key: 'shortOtHours' },
                      { label: 'Short Special OT Hours', key: 'shortSpecialOtHours' },
                      { label: 'Spl OT Hours Worked', key: 'splOtHoursWorked' }
                    ].map((field, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>{field.label}</label>
                        <input 
                          type="text" 
                          value={formData[field.key] || ''} 
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', position: 'sticky', bottom: 0 }}>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={handleResetEditForm}
                  disabled={submitting}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  Reset
                </button>
                <button 
                  type="button"
                  onClick={handleUpdate}
                  disabled={submitting}
                  style={{ backgroundColor: 'var(--clr-primary)', border: 'none', borderRadius: '6px', padding: '8px 24px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Popup for Creating New Time Sheet (Comprehensive Form) */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '850px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Create New Time Sheet</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Provide employee info and breakdown of days and hours worked.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateNewSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* General Info Section */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Employee Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Ankit Sharma"
                    value={newEmpData.name}
                    onChange={(e) => handleNewEmpInputChange('name', e.target.value)}
                    style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Department *</label>
                  <select 
                    value={newEmpData.dept}
                    onChange={(e) => handleNewEmpInputChange('dept', e.target.value)}
                    style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                  >
                    <option>IT Department</option>
                    <option>HR Department</option>
                    <option>Finance Department</option>
                    <option>Operations Department</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Status *</label>
                  <select 
                    value={newEmpData.status}
                    onChange={(e) => handleNewEmpInputChange('status', e.target.value)}
                    style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                  >
                    <option>Processed</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer Actions for Creation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: 'var(--clr-primary)', border: 'none', borderRadius: '6px', padding: '8px 24px', fontSize: '12px', fontWeight: '600', color: '#ffffff', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Creating...' : 'Create Time Sheet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}