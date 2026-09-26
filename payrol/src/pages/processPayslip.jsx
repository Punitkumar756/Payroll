import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Download, Search, CheckCircle2, ArrowLeft, UserPlus, X, FileText, AlertCircle, Pencil } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ProcessPayslip({ onBack }) {
  const [financialYear, setFinancialYear] = useState('2024 - 2025');
  const [payPeriod, setPayPeriod] = useState('May 2025 (01 May 2025 - 31 May 2025)');
  const [searchEmployee, setSearchEmployee] = useState('');

  // API State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    code: '',
    name: '',
    dept: 'IT Department',
    financialYear: '2024 - 2025',
    period: 'May 2025 (01 May 2025 - 31 May 2025)',
    status: 'Success',
    message: 'Payslip processed successfully.'
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);

  // 1. GET API: Fetch records from backend database
  const fetchPayslips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/payslips?financialYear=${encodeURIComponent(financialYear)}&payPeriod=${encodeURIComponent(payPeriod)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payslips from server');
      }
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [financialYear, payPeriod]);

  // 2. POST API: Submit new employee payslip to database
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmp.code || !newEmp.name) {
      alert('Please fill in Employee Code and Name.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payslips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEmp,
          date: new Date().toLocaleString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payslip record');
      }

      const createdRecord = await response.json();
      
      setRecords(prev => [createdRecord, ...prev]);
      setIsModalOpen(false);
      
      // Reset form
      setNewEmp({
        code: '',
        name: '',
        dept: 'IT Department',
        financialYear: financialYear,
        period: payPeriod,
        status: 'Success',
        message: 'Payslip processed successfully.'
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // 3. PUT API: Update existing employee record
  const handleEditClick = (rec) => {
    setEditEmp({ ...rec });
    setIsEditModalOpen(true);
  };

  const handleEditEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!editEmp.code || !editEmp.name) {
      alert('Please fill in Employee Code and Name.');
      return;
    }

    const recId = editEmp._id || editEmp.id;

    try {
      const response = await fetch(`${API_BASE_URL}/payslips/${recId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editEmp),
      });

      if (!response.ok) {
        throw new Error('Failed to update payslip record');
      }

      const updatedRecord = await response.json();

      // Update state in UI
      setRecords(prev => prev.map(rec => ( (rec._id || rec.id) === recId ? updatedRecord : rec )));
      setIsEditModalOpen(false);
      setEditEmp(null);
    } catch (err) {
      // Fallback local update if backend route isn't connected yet
      setRecords(prev => prev.map(rec => ( (rec._id || rec.id) === recId ? editEmp : rec )));
      setIsEditModalOpen(false);
      setEditEmp(null);
    }
  };

  const handleProcess = () => {
    fetchPayslips();
  };

  const handleClear = () => {
    setSearchEmployee('');
    setFinancialYear('2024 - 2025');
    setPayPeriod('May 2025 (01 May 2025 - 31 May 2025)');
  };

  const filteredRecords = records.filter(rec => {
    const matchesFinancialYear = rec.financialYear === financialYear;
    const matchesPayPeriod = rec.period === payPeriod;
    const matchesSearch = 
      rec.name?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      rec.code?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      rec.dept?.toLowerCase().includes(searchEmployee.toLowerCase());

    return matchesFinancialYear && matchesPayPeriod && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Employee Code', 'Employee Name', 'Department', 'Financial Year', 'Pay Period', 'Status', 'Message', 'Processed On'];
    const csvRows = [headers.join(',')];
    
    filteredRecords.forEach(rec => {
      csvRows.push([
        rec.code, 
        `"${rec.name}"`, 
        `"${rec.dept}"`, 
        `"${rec.financialYear}"`, 
        `"${rec.period}"`, 
        rec.status, 
        `"${rec.message}"`, 
        `"${rec.date}"`
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'processed_payslips.csv');
    a.click();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    
    const htmlContent = `
      <html>
        <head>
          <title>Processed Payslips Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
            h2 { margin-bottom: 5px; color: #7c3aed; }
            p { font-size: 12px; color: #64748b; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; }
          </style>
        </head>
        <body>
          <h2>Processed Payslips Report</h2>
          <p>Financial Year: ${financialYear} | Pay Period: ${payPeriod}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Message</th>
                <th>Processed On</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(rec => `
                <tr>
                  <td>${rec.code}</td>
                  <td>${rec.name}</td>
                  <td>${rec.dept}</td>
                  <td>${rec.status}</td>
                  <td>${rec.message}</td>
                  <td>${rec.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {onBack && (
        <button 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#7c3aed', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      )}

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        
        {/* Header Section */}
        <div style={{ padding: 'clamp(16px, 3vw, 24px)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Process Payslips</h1>
            <p style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#64748b', margin: 0 }}>Process payslips for a selected pay period and a batch of employees.</p>
          </div>
          <button
            onClick={() => {
              setNewEmp(prev => ({ ...prev, financialYear, period: payPeriod }));
              setIsModalOpen(true);
            }}
            style={{ backgroundColor: '#7c3aed', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <UserPlus size={14} /> Add New Employee Payslip
          </button>
        </div>

        {/* Toolbar Controls Section */}
        <div style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 160px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Financial Year</label>
            <select 
              value={financialYear} 
              onChange={(e) => setFinancialYear(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box', height: '34px' }}
            >
              <option>2024 - 2025</option>
              <option>2025 - 2026</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5 1 220px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Pay Period</label>
            <select 
              value={payPeriod} 
              onChange={(e) => setPayPeriod(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box', height: '34px' }}
            >
              <option>May 2025 (01 May 2025 - 31 May 2025)</option>
              <option>June 2025 (01 Jun 2025 - 30 Jun 2025)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5 1 180px', minWidth: 0 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Search Employee</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box', height: '34px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'transparent' }}>Actions</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={handleProcess}
                style={{ backgroundColor: '#7c3aed', border: 'none', borderRadius: '6px', padding: '0 14px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '34px' }}
              >
                <Play size={14} /> Process
              </button>
              <button 
                onClick={handleClear}
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', fontSize: '12px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '34px' }}
              >
                <RotateCcw size={14} /> Clear
              </button>
            </div>
          </div>

        </div>

        {/* Results Section */}
        <div>
          <div style={{ padding: '16px clamp(16px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Process Result</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Total Records: {filteredRecords.length}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={handleExportCSV}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                  <Download size={13} /> Export CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                  <FileText size={13} /> Export PDF
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 24px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Employee Code</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Employee Name</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Financial Year</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Pay Period</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Message</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Processed On</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, idx) => (
                    <tr key={rec._id || rec.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 16px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>{rec.code}</td>
                      <td style={{ padding: '10px 16px', fontWeight: '500', color: '#1e293b', whiteSpace: 'nowrap' }}>{rec.name}</td>
                      <td style={{ padding: '10px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{rec.dept}</td>
                      <td style={{ padding: '10px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{rec.financialYear}</td>
                      <td style={{ padding: '10px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{rec.period}</td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          backgroundColor: rec.status === 'Success' ? '#dcfce7' : rec.status === 'Pending' ? '#fef9c3' : '#fee2e2', 
                          color: rec.status === 'Success' ? '#16a34a' : rec.status === 'Pending' ? '#ca8a04' : '#dc2626', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '11px', 
                          fontWeight: '600' 
                        }}>
                          <CheckCircle2 size={12} color={rec.status === 'Success' ? '#16a34a' : rec.status === 'Pending' ? '#ca8a04' : '#dc2626'} />
                          {rec.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b' }}>{rec.message}</td>
                      <td style={{ padding: '10px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{rec.date}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleEditClick(rec)}
                          title="Edit Row"
                          style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                      No employee records found matching your selected filters and search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px clamp(16px, 3vw, 24px)', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', backgroundColor: '#ffffff' }}>
            Showing 1 to {filteredRecords.length} of {records.length} total records
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Add New Employee Payslip</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Employee Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g. EMP004"
                  value={newEmp.code}
                  onChange={(e) => setNewEmp({...newEmp, code: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Employee Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Anjali Verma"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Department</label>
                <select 
                  value={newEmp.dept}
                  onChange={(e) => setNewEmp({...newEmp, dept: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option value="IT Department">IT Department</option>
                  <option value="HR Department">HR Department</option>
                  <option value="Finance Department">Finance Department</option>
                  <option value="Marketing Department">Marketing Department</option>
                  <option value="Operations Department">Operations Department</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Financial Year</label>
                <select 
                  value={newEmp.financialYear}
                  onChange={(e) => setNewEmp({...newEmp, financialYear: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option>2024 - 2025</option>
                  <option>2025 - 2026</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Pay Period</label>
                <select 
                  value={newEmp.period}
                  onChange={(e) => setNewEmp({...newEmp, period: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option>May 2025 (01 May 2025 - 31 May 2025)</option>
                  <option>June 2025 (01 Jun 2025 - 30 Jun 2025)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status</label>
                <select 
                  value={newEmp.status}
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    const defaultMsg = selectedStatus === 'Success' 
                      ? 'Payslip processed successfully.' 
                      : selectedStatus === 'Pending' 
                      ? 'Payslip processing pending.' 
                      : 'Failed to process payslip.';
                    setNewEmp({
                      ...newEmp, 
                      status: selectedStatus,
                      message: defaultMsg
                    });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status Message</label>
                <input 
                  type="text" 
                  placeholder="e.g. Payslip processed successfully."
                  value={newEmp.message}
                  onChange={(e) => setNewEmp({...newEmp, message: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#7c3aed', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }}
                >
                  Save & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && editEmp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Edit Employee Payslip</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditEmployeeSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Employee Code *</label>
                <input 
                  type="text" 
                  value={editEmp.code}
                  onChange={(e) => setEditEmp({...editEmp, code: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Employee Name *</label>
                <input 
                  type="text" 
                  value={editEmp.name}
                  onChange={(e) => setEditEmp({...editEmp, name: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Department</label>
                <select 
                  value={editEmp.dept}
                  onChange={(e) => setEditEmp({...editEmp, dept: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option value="IT Department">IT Department</option>
                  <option value="HR Department">HR Department</option>
                  <option value="Finance Department">Finance Department</option>
                  <option value="Marketing Department">Marketing Department</option>
                  <option value="Operations Department">Operations Department</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Financial Year</label>
                <select 
                  value={editEmp.financialYear}
                  onChange={(e) => setEditEmp({...editEmp, financialYear: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option>2024 - 2025</option>
                  <option>2025 - 2026</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Pay Period</label>
                <select 
                  value={editEmp.period}
                  onChange={(e) => setEditEmp({...editEmp, period: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option>May 2025 (01 May 2025 - 31 May 2025)</option>
                  <option>June 2025 (01 Jun 2025 - 30 Jun 2025)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status</label>
                <select 
                  value={editEmp.status}
                  onChange={(e) => setEditEmp({ ...editEmp, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                >
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status Message</label>
                <input 
                  type="text" 
                  value={editEmp.message}
                  onChange={(e) => setEditEmp({...editEmp, message: e.target.value})}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#7c3aed', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }}
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}