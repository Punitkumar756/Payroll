import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Filter,
  AlertCircle,
  Loader
} from 'lucide-react'; 

const API_BASE_URL = 'http://localhost:5000/api';

const apiHeaders = {
  'Content-Type': 'application/json',
};

const defaultFinancialYears = ['2025-2026', '2024-2025'];
const defaultPayPeriods = ['May 2026', 'April 2026', 'March 2026'];
const defaultDepartments = ['IT Department', 'HR Department', 'Finance Department'];

export default function ApprovePayslip({ onBack }) {
  // Options State (Loaded from DB)
  const [financialYears, setFinancialYears] = useState(defaultFinancialYears);
  const [payPeriods, setPayPeriods] = useState(defaultPayPeriods);
  const [departments, setDepartments] = useState(defaultDepartments);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Form & Search States
  const [financialYear, setFinancialYear] = useState('');
  const [payPeriod, setPayPeriod] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Data & API States
  const [payslips, setPayslips] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Dropdown Options from Database/Backend
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setOptionsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/payslips/options`, {
          method: 'GET',
          headers: apiHeaders,
        });

        if (!response.ok) {
          throw new Error(`Failed to load options: ${response.statusText}`);
        }

        const data = await response.json();
        // Expecting data shape: { financialYears: [...], payPeriods: [...], departments: [...] }
        if (data.financialYears?.length) setFinancialYears(data.financialYears);
        if (data.payPeriods?.length) setPayPeriods(data.payPeriods);
        if (data.departments?.length) setDepartments(data.departments);

        // Set default selections based on DB values
        if (data.financialYears?.length > 0) setFinancialYear(data.financialYears[0]);
        if (data.payPeriods?.length > 0) setPayPeriod(data.payPeriods[0]);
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
        setErrorMessage('Failed to fetch filter options from database. Using fallback values.');
        // Fallback data if API endpoint is not yet active
        setFinancialYears(defaultFinancialYears);
        setPayPeriods(defaultPayPeriods);
        setDepartments(defaultDepartments);
        setFinancialYear('2025-2026');
        setPayPeriod('May 2026');
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // 2. Fetch Processed Payslips from Backend
  const fetchPayslips = async () => {
    if (!financialYear || !payPeriod) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/payslips?financialYear=${encodeURIComponent(financialYear)}&payPeriod=${encodeURIComponent(payPeriod)}`,
        {
          method: 'GET',
          headers: apiHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPayslips(data.payslips || data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
      setErrorMessage('Failed to load payslips from backend.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when selections change
  useEffect(() => {
    if (financialYear && payPeriod) {
      fetchPayslips();
    }
  }, [financialYear, payPeriod]);

  // Filter Computation
  const filteredPayslips = payslips.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || item.dept === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPayslips.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // POST Request: Approve Payslips
  const handleApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslips/approve`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ employeeIds: selectedIds, financialYear, payPeriod, action: 'APPROVE' }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      setPayslips((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: 'Approved' } : item))
      );
      showToast(`Approved ${selectedIds.length} payslip(s).`);
      setSelectedIds([]);
    } catch (err) {
      showToast('Failed to approve payslips.');
    } finally {
      setActionLoading(false);
    }
  };

  // POST Request: Unapprove Payslips
  const handleUnapprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslips/unapprove`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ employeeIds: selectedIds, financialYear, payPeriod, action: 'UNAPPROVE' }),
      });

      if (!response.ok) throw new Error('Failed to unapprove');

      setPayslips((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: 'Pending' } : item))
      );
      showToast(`Unapproved ${selectedIds.length} payslip(s).`);
      setSelectedIds([]);
    } catch (err) {
      showToast('Failed to unapprove payslips.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {toastMessage && (
        <div style={styles.toast}>
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.headerTitleGroup}>
            <div style={styles.iconBadge}>
              <CheckSquare size={20} color="#0052cc" />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Approve Payslip</h2>
              <p style={styles.cardSubtitle}>
                Approve processed payslips to publish to employee logins & send via email.
              </p>
            </div>
          </div>
          {onBack && (
            <button onClick={onBack} style={styles.backButton}>
              <ArrowLeft size={16} />
              <span>Back to List</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Dynamic Filters */}
        <div style={styles.stepContainer}>
          <div style={styles.stepBadge}>Step 1</div>
          <div style={styles.filterGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Financial Year <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                style={styles.select}
                disabled={loading || optionsLoading}
              >
                {optionsLoading ? (
                  <option value="">Loading financial years...</option>
                ) : (
                  <>
                    <option value="" disabled>Select Financial Year</option>
                    {financialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      Financial Year {fy}
                    </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Pay Period <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                style={styles.select}
                disabled={loading || optionsLoading}
              >
                {optionsLoading ? (
                  <option value="">Loading pay periods...</option>
                ) : (
                  <>
                    <option value="" disabled>Select Pay Period</option>
                    {payPeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Employee Selection Table */}
        <div style={styles.stepContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={styles.stepBadge}>Step 2</div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                Select Employee(s)
              </span>
            </div>

            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={styles.advancedSearchToggle}
            >
              <Filter size={14} />
              <span>{showAdvancedSearch ? 'Hide Filters' : 'Advanced Search'}</span>
            </button>
          </div>

          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Dynamic Department Dropdown */}
            {showAdvancedSearch && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{ ...styles.select, width: '200px' }}
                disabled={optionsLoading}
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      disabled={loading || filteredPayslips.length === 0}
                      checked={
                        filteredPayslips.length > 0 &&
                        filteredPayslips.every((p) => selectedIds.includes(p.id))
                      }
                    />
                  </th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Employee Name</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Net Payable</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyTd}>
                      <Loader size={20} className="spin" style={{ display: 'inline', marginRight: '8px' }} />
                      Loading payslips from server...
                    </td>
                  </tr>
                ) : filteredPayslips.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyTd}>
                      No processed payslips found for approval.
                    </td>
                  </tr>
                ) : (
                  filteredPayslips.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <tr key={emp.id} style={{ ...styles.trRow, backgroundColor: isSelected ? '#eff6ff' : '#ffffff' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(emp.id)} />
                        </td>
                        <td style={styles.tdBold}>{emp.id}</td>
                        <td style={styles.td}>
                          <div>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{emp.email}</div>
                        </td>
                        <td style={styles.td}>{emp.dept}</td>
                        <td style={styles.tdBold}>{emp.netPay}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: emp.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                              color: emp.status === 'Approved' ? '#166534' : '#92400e'
                            }}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3: Action Buttons */}
        <div style={styles.stepContainerNoBorder}>
          <div style={styles.actionToolbar}>
            <button
              onClick={handleUnapprove}
              disabled={actionLoading || selectedIds.length === 0}
              style={{
                ...styles.unapproveButton,
                opacity: selectedIds.length === 0 || actionLoading ? 0.6 : 1,
                cursor: selectedIds.length === 0 || actionLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <XCircle size={16} />
              <span>{actionLoading ? 'PROCESSING...' : 'UNAPPROVE'}</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={actionLoading || selectedIds.length === 0}
              style={{
                ...styles.approveButton,
                opacity: selectedIds.length === 0 || actionLoading ? 0.6 : 1,
                cursor: selectedIds.length === 0 || actionLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <CheckCircle size={16} />
              <span>{actionLoading ? 'PROCESSING...' : `APPROVE (${selectedIds.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', color: '#334155' },
  card: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' },
  headerTitleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBadge: { backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 },
  cardSubtitle: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' },
  backButton: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', border: '1px solid #0052cc', color: '#0052cc', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', marginBottom: '20px' },
  stepContainer: { paddingBottom: '20px', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' },
  stepContainerNoBorder: { paddingBottom: '0' },
  stepBadge: { backgroundColor: '#0052cc', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#1e293b' },
  select: { width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff' },
  advancedSearchToggle: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#0052cc', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', flex: 1, backgroundColor: '#ffffff' },
  searchInput: { border: 'none', outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' },
  tableWrapper: { border: '1px solid #e2e8f0', borderRadius: '6px', overflowX: 'auto', overflowY: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#475569' },
  trRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 14px', fontSize: '13px', color: '#334155' },
  tdBold: { padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#0f172a' },
  emptyTd: { textAlign: 'center', padding: '24px', fontSize: '13px', color: '#94a3b8' },
  statusBadge: { padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  actionToolbar: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  approveButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600' },
  unapproveButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', backgroundColor: '#ffffff', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', fontSize: '13px', fontWeight: '600' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000, fontSize: '13px' },
};