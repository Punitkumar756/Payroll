import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, X, Edit2, Trash2, Info, Calendar, Search, Loader, AlertCircle 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/payroll';

const apiHeaders = {
  'Content-Type': 'application/json',
};

const defaultEmployeeOptions = [
  'Rahul Sharma',
  'Priya Singh',
  'Amit Kumar',
  'Neha Verma',
  'Vikram Patel'
];
const defaultFinancialYearOptions = ['2024 - 2025', '2025 - 2026'];
const defaultPayPeriodOptions = [
  'May 2025 (01 May 2025 - 31 May 2025)',
  'June 2025 (01 Jun 2025 - 30 Jun 2025)'
];
const defaultItemOptions = [
  'Advance Salary',
  'Travel Advance',
  'Festival Advance',
  'Medical Advance'
];

export default function AdvancePayments({ onBack }) {
  // Form Initial State
  const initialFormState = {
    employee: '',
    financialYear: '',
    payPeriod: '',
    itemType: 'Earning',
    item: 'Advance Salary',
    remarks: '',
    amount: ''
  };

  // State Management
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data & API States
  const [paymentsList, setPaymentsList] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState(defaultEmployeeOptions);
  const [financialYearOptions, setFinancialYearOptions] = useState(defaultFinancialYearOptions);
  const [payPeriodOptions, setPayPeriodOptions] = useState(defaultPayPeriodOptions);
  const [itemOptions, setItemOptions] = useState(defaultItemOptions);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Fetch Form Dropdown Options from DB
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/advance-payments/options`, {
          method: 'GET',
          headers: apiHeaders
        });
        if (res.ok) {
          const data = await res.json();
          if (data.employees?.length) setEmployeeOptions(data.employees);
          if (data.financialYears?.length) setFinancialYearOptions(data.financialYears);
          if (data.payPeriods?.length) setPayPeriodOptions(data.payPeriods);
          if (data.items?.length) setItemOptions(data.items);
        }
      } catch (err) {
        console.error('Failed to load form options:', err);
      }
    };

    fetchOptions();
  }, []);

  // 2. Fetch Advance Payments List from DB (GET)
  const fetchPayments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/advance-payments`, {
        method: 'GET',
        headers: apiHeaders
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: Failed to fetch advance payments`);
      }

      const data = await res.json();
      setPaymentsList(data.payments || data);
    } catch (err) {
      console.error('API Error:', err);
      setErrorMessage(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 3. Save / Update Record (POST / PUT)
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const rawAmount = String(formData.amount).replace(/,/g, '').trim();
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const payload = {
      employee: formData.employee,
      financialYear: formData.financialYear,
      payPeriod: formData.payPeriod,
      itemType: formData.itemType,
      item: formData.item,
      remarks: formData.remarks.trim() || '-',
      amount: Number(rawAmount)
    };

    setSubmitLoading(true);
    try {
      if (editingId !== null) {
        // PUT Request to Update Record
        const res = await fetch(`${API_BASE_URL}/advance-payments/${editingId}`, {
          method: 'PUT',
          headers: apiHeaders,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update record in database.');

        const updatedItem = await res.json();
        setPaymentsList(prev => prev.map(item => item.id === editingId ? (updatedItem.data || updatedItem) : item));
      } else {
        // POST Request to Add Record
        const res = await fetch(`${API_BASE_URL}/advance-payments`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to save record to database.');

        const createdItem = await res.json();
        setPaymentsList(prev => [...prev, createdItem.data || createdItem]);
      }

      closeModal();
    } catch (err) {
      console.error('Save Error:', err);
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open modal for new entry
  const handleNew = () => {
    setEditingId(null);
    setFormData({
      employee: employeeOptions[0] || '',
      financialYear: financialYearOptions[0] || '',
      payPeriod: payPeriodOptions[0] || '',
      itemType: 'Earning',
      item: itemOptions[0] || 'Advance Salary',
      remarks: '',
      amount: ''
    });
    setIsModalOpen(true);
  };

  // Populate form and open modal for editing
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      employee: item.employee,
      financialYear: item.financialYear,
      payPeriod: item.payPeriod,
      itemType: item.itemType || 'Earning',
      item: item.item,
      remarks: item.remarks === '-' ? '' : item.remarks,
      amount: String(item.amount).replace(/,/g, '')
    });
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // 4. Delete Record (DELETE)
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/advance-payments/${id}`, {
        method: 'DELETE',
        headers: apiHeaders
      });

      if (!res.ok) throw new Error('Failed to delete record from database.');

      setPaymentsList(prev => prev.filter(item => item.id !== id));
      if (editingId === id) {
        closeModal();
      }
    } catch (err) {
      console.error('Delete Error:', err);
      alert(err.message || 'Failed to delete record.');
    }
  };

  // Filter Payments List based on search term
  const filteredPaymentsList = paymentsList.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      (row.employee && row.employee.toLowerCase().includes(term)) ||
      (row.financialYear && row.financialYear.toLowerCase().includes(term)) ||
      (row.payPeriod && row.payPeriod.toLowerCase().includes(term)) ||
      (row.item && row.item.toLowerCase().includes(term)) ||
      (row.amount && String(row.amount).toLowerCase().includes(term)) ||
      (row.remarks && row.remarks.toLowerCase().includes(term))
    );
  });

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '6px',
    display: 'block'
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f2942', margin: '0 0 6px 0' }}>
          Advance Payments
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Use this screen to assign employee-wise advance payments to the payslip for a particular month.
        </p>
      </div>

      {errorMessage && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        
        {/* Table Header, Action Button & Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
            Advance Payments List
          </h2>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: 0, flex: '1 1 240px' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input 
                type="text"
                placeholder="Search employee, item, year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '32px',
                  paddingRight: searchTerm ? '30px' : '12px'
                }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button 
              type="button" 
              onClick={handleNew}
              style={{ backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={15} /> NEW
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', width: '60px', textAlign: 'center' }}>Sl. No.</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Financial Year</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Pay Period</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Item</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Amount (₹)</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Remarks</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    <Loader size={18} style={{ display: 'inline', marginRight: '8px' }} />
                    Loading records from database...
                  </td>
                </tr>
              ) : filteredPaymentsList.length > 0 ? (
                filteredPaymentsList.map((row, index) => (
                  <tr 
                    key={row.id || index} 
                    onClick={() => handleEdit(row)}
                    style={{ borderBottom: '1px solid #f1f5f9', color: '#1e293b', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{row.employee}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{row.financialYear}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{row.payPeriod}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{row.item}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {typeof row.amount === 'number' ? row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : row.amount}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.remarks}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                          title="Edit"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, row.id)}
                          title="Delete"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    {searchTerm ? `No records matching "${searchTerm}"` : 'No advance payments recorded.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Banner */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ backgroundColor: '#2563eb', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={16} color="#ffffff" />
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.4' }}>
          Once the payslip for the particular pay period is processed, the advance payment amount will be reflected in the employee's payslip.
        </p>
      </div>

      {/* Pop-up Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
                {editingId !== null ? 'Edit Advance Payment' : 'Add Advance Payment'}
              </h2>
              <button 
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                
                {/* Employee */}
                <div>
                  <label style={labelStyle}>Employee <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    value={formData.employee} 
                    onChange={(e) => handleInputChange('employee', e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="" disabled>Select Employee</option>
                    {employeeOptions.map((emp, i) => (
                      <option key={i} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>

                {/* Financial Year */}
                <div>
                  <label style={labelStyle}>Financial Year <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    value={formData.financialYear} 
                    onChange={(e) => handleInputChange('financialYear', e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="" disabled>Select Financial Year</option>
                    {financialYearOptions.map((fy, i) => (
                      <option key={i} value={fy}>{fy}</option>
                    ))}
                  </select>
                </div>

                {/* Pay Period */}
                <div>
                  <label style={labelStyle}>Pay Period <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={formData.payPeriod} 
                      onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                      style={{ ...inputStyle, paddingRight: '32px' }}
                      required
                    >
                      <option value="" disabled>Select Pay Period</option>
                      {payPeriodOptions.map((pp, i) => (
                        <option key={i} value={pp}>{pp}</option>
                      ))}
                    </select>
                    <Calendar size={15} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Item Type */}
                <div>
                  <label style={labelStyle}>Item Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    value={formData.itemType} 
                    onChange={(e) => handleInputChange('itemType', e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>

                {/* Item */}
                <div>
                  <label style={labelStyle}>Item <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    value={formData.item} 
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    style={inputStyle}
                    required
                  >
                    {itemOptions.map((item, i) => (
                      <option key={i} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="number"
                      min="0.01"
                      step="0.01"
                    placeholder="0.00"
                    value={formData.amount} 
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    style={{ ...inputStyle, textAlign: 'right' }}
                    required
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label style={labelStyle}>Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="Enter remarks (optional)" 
                    value={formData.remarks} 
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '58px' }}
                  />
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={submitLoading}
                  style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '8px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  style={{ backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: submitLoading ? 'not-allowed' : 'pointer', opacity: submitLoading ? 0.7 : 1 }}
                >
                  {submitLoading ? <Loader size={15} /> : <Save size={15} />} 
                  {submitLoading ? 'Saving...' : (editingId !== null ? 'UPDATE' : 'ADD')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}