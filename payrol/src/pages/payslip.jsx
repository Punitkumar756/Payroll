import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const initialRecords = [
  { id: 'EMP001', name: 'Rahul Sharma', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '40,300.00', status: 'Processed' },
  { id: 'EMP002', name: 'Priya Verma', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '33,900.00', status: 'Processed' },
  { id: 'EMP003', name: 'Amit Singh', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '44,000.00', status: 'Processed' },
  { id: 'EMP004', name: 'Neha Patel', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '38,000.00', status: 'Processed' },
  { id: 'EMP005', name: 'Vikram Joshi', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '33,700.00', status: 'Processed' },
  { id: 'EMP006', name: 'Sneha Gupta', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '33,000.00', status: 'Processed' },
  { id: 'EMP007', name: 'Rohit Mehta', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '43,000.00', status: 'Processed' },
  { id: 'EMP008', name: 'Anjali Desai', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '36,700.00', status: 'Processed' },
  { id: 'EMP009', name: 'Sandeep Yadav', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '31,800.00', status: 'Processed' },
  { id: 'EMP010', name: 'Kavita Reddy', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '35,050.00', status: 'Processed' },
  { id: 'EMP011', name: 'Manoj Kumar', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '39,200.00', status: 'Processed' },
  { id: 'EMP012', name: 'Pooja Sharma', payPeriod: 'May 2025 (01 May - 31 May)', netSalary: '41,500.00', status: 'Processed' },
];

const initialComponents = {
  earnings: [
    { id: 1, name: 'Basic Salary', description: 'Basic Pay', amount: '30,000.00' },
    { id: 2, name: 'House Rent Allowance', description: 'House Rent', amount: '12,000.00' },
    { id: 3, name: 'Conveyance Allowance', description: 'Conveyance', amount: '2,000.00' },
    { id: 4, name: 'Medical Allowance', description: 'Medical', amount: '1,500.00' },
    { id: 5, name: 'Special Allowance', description: 'Special', amount: '0.00' },
  ],
  deductions: [
    { id: 1, name: 'Provident Fund', description: 'PF Employee', amount: '1,800.00' },
    { id: 2, name: 'Professional Tax', description: 'PT', amount: '200.00' }
  ],
  employerComponents: [
    { id: 1, name: 'Provident Fund (Employer)', description: 'PF Employer', amount: '1,800.00' }
  ]
};

export default function EditPayslipManager({ onBack }) {
  const [records, setRecords] = useState(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(initialRecords[0]);
  
  // API States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  // State to control popup visibility on row click
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('Earnings');

  // Modals & Editing states
  const [componentsData, setComponentsData] = useState(initialComponents);
  const [editingComponent, setEditingComponent] = useState(null);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [editFormValues, setEditFormValues] = useState({ name: '', description: '', amount: '' });
  
  // Add Employee State
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployeeValues, setNewEmployeeValues] = useState({
    id: `EMP${String(initialRecords.length + 1).padStart(3, '0')}`,
    name: '',
    payPeriod: 'May 2025 (01 May - 31 May)',
    netSalary: '35,000.00',
    status: 'Processed'
  });

  // Edit Employee State
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editEmployeeValues, setEditEmployeeValues] = useState({ id: '', name: '', netSalary: '', status: '' });

  const [deletingComponent, setDeletingComponent] = useState(null);
  const [deletingPayslip, setDeletingPayslip] = useState(false);

  // Search filtering
  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show Toast Message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. GET API: Fetch all payslips on component load
  useEffect(() => {
    const fetchPayslips = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/payslips`, {
          method: 'GET',
          headers: API_HEADERS
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch payslips`);
        }
        const data = await response.json();
        if (data.payslips && Array.isArray(data.payslips)) {
          setRecords(data.payslips);
          if (data.payslips.length > 0) {
            setSelectedRecord(data.payslips[0]);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payslips:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComponents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payslip-components`, {
          method: 'GET',
          headers: API_HEADERS
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch components`);
        }
        const data = await response.json();
        if (data.components) {
          setComponentsData(data.components);
        }
      } catch (err) {
        console.error('Error fetching components:', err);
      }
    };

    fetchPayslips();
    fetchComponents();
  }, []);

  // 2. POST API: Add new component
  const handleAddComponent = async () => {
    if (!editFormValues.name.trim() || !editFormValues.amount.trim()) {
      showToast('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslip-components`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          name: editFormValues.name,
          description: editFormValues.description,
          amount: editFormValues.amount,
          type: activeTab.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to add component`);
      }

      const newComponent = await response.json();
      setComponentsData(prev => ({
        ...prev,
        [activeTab.toLowerCase()]: [...(prev[activeTab.toLowerCase()] || []), newComponent]
      }));

      showToast(`${activeTab} component added successfully!`);
      setEditFormValues({ name: '', description: '', amount: '' });
      setIsAddingComponent(false);
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error adding component:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. PUT API: Update component
  const handleSaveEditComponent = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslip-components/${editingComponent.id}`, {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify({
          name: editFormValues.name,
          description: editFormValues.description,
          amount: editFormValues.amount
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to update component`);
      }

      const updatedComponent = await response.json();
      setComponentsData(prev => ({
        ...prev,
        [activeTab.toLowerCase()]: (prev[activeTab.toLowerCase()] || []).map(c => 
          c.id === editingComponent.id ? updatedComponent : c
        )
      }));

      showToast('Component updated successfully!');
      setEditingComponent(null);
      setEditFormValues({ name: '', description: '', amount: '' });
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error updating component:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. DELETE API: Delete component
  const handleDeleteComponent = async (componentId) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslip-components/${componentId}`, {
        method: 'DELETE',
        headers: API_HEADERS
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to delete component`);
      }

      setComponentsData(prev => ({
        ...prev,
        [activeTab.toLowerCase()]: (prev[activeTab.toLowerCase()] || []).filter(c => c.id !== componentId)
      }));

      showToast('Component deleted successfully!');
      setDeletingComponent(null);
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error deleting component:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. PUT API: Update payslip
  const handleUpdatePayslip = async (payslipId, updatedData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payslips/${payslipId}`, {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to update payslip`);
      }

      const updated = await response.json();
      setRecords(prev => prev.map(r => r.id === payslipId ? updated : r));
      showToast('Payslip updated successfully!');
    } catch (err) {
      setError(err.message);
      showToast(`Error: ${err.message}`);
      console.error('Error updating payslip:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to calculate total sum of amounts safely
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const cleanAmount = parseFloat(item.amount.replace(/,/g, '')) || 0;
      return acc + cleanAmount;
    }, 0);
    return sum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper function to get row-specific calculated values for Earnings and Deductions columns
  const getRowTotals = () => {
    const totalEarnings = calculateTotal(componentsData.earnings);
    const totalDeductions = calculateTotal(componentsData.deductions);
    return { totalEarnings, totalDeductions };
  };

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    const rowTotals = getRowTotals();
    const headers = ['Employee ID', 'Employee Name', 'Pay Period', 'Total Earnings', 'Total Deductions', 'Net Salary', 'Status'];
    
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map(r => [
        r.id,
        `"${r.name}"`,
        `"${r.payPeriod}"`,
        `"${rowTotals.totalEarnings}"`,
        `"${rowTotals.totalDeductions}"`,
        `"${r.netSalary}"`,
        r.status
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payslips_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF (Prints/Saves current view or summary via browser print window)
  const handleDownloadPDF = () => {
    window.print();
  };

  // Handlers
  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleEditEmployeeClick = (record, e) => {
    e.stopPropagation(); // Prevent row click event from firing
    setEditingEmployee(record);
    setEditEmployeeValues({ 
      id: record.id, 
      name: record.name, 
      netSalary: record.netSalary, 
      status: record.status 
    });
  };

  const handleSaveEditedEmployee = (e) => {
    e.preventDefault();
    setRecords(records.map(r => r.id === editingEmployee.id ? { ...r, ...editEmployeeValues } : r));
    if (selectedRecord?.id === editingEmployee.id) {
      setSelectedRecord({ ...selectedRecord, ...editEmployeeValues });
    }
    setEditingEmployee(null);
  };

  const handleEditClick = (item) => {
    setIsAddingComponent(false);
    setEditingComponent(item);
    setEditFormValues({ name: item.name, description: item.description, amount: item.amount });
  };

  const handleAddNewClick = () => {
    setIsAddingComponent(true);
    setEditFormValues({ name: '', description: '', amount: '' });
    setEditingComponent({ id: Date.now() }); 
  };

  const handleSaveComponent = (e) => {
    e.preventDefault();
    const targetKey = activeTab === 'Earnings' ? 'earnings' : activeTab === 'Deductions' ? 'deductions' : 'employerComponents';
    
    if (isAddingComponent) {
      const newComp = {
        id: Date.now(),
        ...editFormValues
      };
      setComponentsData({
        ...componentsData,
        [targetKey]: [...componentsData[targetKey], newComp]
      });
    } else {
      setComponentsData({
        ...componentsData,
        [targetKey]: componentsData[targetKey].map(comp => 
          comp.id === editingComponent.id ? { ...comp, ...editFormValues } : comp
        )
      });
    }
    setEditingComponent(null);
    setIsAddingComponent(false);
  };

  const handleSaveNewEmployee = (e) => {
    e.preventDefault();
    setRecords([newEmployeeValues, ...records]);
    setSelectedRecord(newEmployeeValues);
    setIsAddingEmployee(false);
    setNewEmployeeValues({
      id: `EMP${String(records.length + 2).padStart(3, '0')}`,
      name: '',
      payPeriod: 'May 2025 (01 May - 31 May)',
      netSalary: '35,000.00',
      status: 'Processed'
    });
  };

  const handleDeleteComponentConfirm = () => {
    const targetKey = activeTab === 'Earnings' ? 'earnings' : activeTab === 'Deductions' ? 'deductions' : 'employerComponents';
    setComponentsData({
      ...componentsData,
      [targetKey]: componentsData[targetKey].filter(comp => comp.id !== deletingComponent.id)
    });
    setDeletingComponent(null);
  };

  const handleDeletePayslipConfirm = () => {
    setRecords(records.filter(r => r.id !== selectedRecord.id));
    setDeletingPayslip(false);
    setShowDetailModal(false);
  };

  const rowTotals = getRowTotals();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: #f8fafc; color: #334155; }
        .payslip-container { padding: 24px; max-width: 1440px; margin: 0 auto; }
        
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .header-top h1 { font-size: 22px; font-weight: 700; color: #0f172a; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn { padding: 8px 14px; font-size: 13px; font-weight: 500; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: background 0.2s; }
        .btn-primary { background-color: #2563eb; color: white; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-secondary { background-color: #ffffff; border-color: #cbd5e1; color: #334155; }
        .btn-secondary:hover { background-color: #f1f5f9; }
        .btn-success { background-color: #ffffff; border-color: #a7f3d0; color: #059669; }
        .btn-success:hover { background-color: #ecfdf5; }
        .btn-danger { background-color: #dc2626; color: white; }
        .btn-danger:hover { background-color: #b91c1c; }

        .filter-toolbar { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 16px; margin-bottom: 24px; align-items: flex-end; }
        .filter-group label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
        .filter-group input, .filter-group select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; }
        .search-input-wrapper { position: relative; }
        .search-input-wrapper input { padding-right: 32px; }
        .search-icon { position: absolute; right: 10px; top: 8px; font-size: 12px; color: #94a3b8; }
        .btn-go { padding: 8px 24px; }

        .card { background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; position: relative; }
        .table-header-info { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 12px; }
        
        .table-responsive { max-height: 420px; overflow-y: auto; overflow-x: auto; border: 1px solid #f1f5f9; border-radius: 6px; }
        
        table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        
        th { background-color: #f8fafc; color: #475569; font-weight: 600; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; position: sticky; top: 0; z-index: 10; }
        
        td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        tr:hover { background-color: #f8fafc; cursor: pointer; }
        .selected-row { background-color: #eff6ff !important; }
        
        .badge-processed { background-color: #ecfdf5; color: #059669; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid #a7f3d0; }
        .action-icons { display: flex; gap: 8px; justify-content: center; }
        .action-icons button, .icon-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px; }

        .close-btn { position: absolute; top: 14px; right: 14px; background: none; border: none; font-size: 14px; color: #94a3b8; cursor: pointer; }
        .details-card h2, .edit-component-card h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
        
        .details-box { background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 10px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 14px; }
        .details-box span { color: #64748b; }

        .modal-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-right: 24px; }

        .tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 14px; }
        .tab-btn { background: none; border: none; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; }
        .active-tab { color: #2563eb; border-bottom-color: #2563eb; }

        .inner-table th, .inner-table td { padding: 8px 6px; font-size: 12px; }
        .total-row { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 10px; border-top: 1px solid #f1f5f9; font-weight: 700; font-size: 13px; }
        
        .text-blue { color: #2563eb; }
        .text-muted { color: #64748b; font-size: 11px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-medium { font-weight: 600; }
        .text-red { color: #dc2626; }

        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; }
        .form-group input { width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; outline: none; }
        .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: white; width: 360px; border-radius: 8px; padding: 20px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .modal-large { background: white; width: 600px; max-width: 95%; max-height: 90vh; overflow-y: auto; border-radius: 8px; padding: 20px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .modal-body-flex { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
        .modal-body-flex h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .modal-body-flex p { font-size: 12px; color: #64748b; line-height: 1.4; }
        .warning-icon { background: #fef3c7; color: #d97706; padding: 8px; border-radius: 50%; font-size: 14px; }
        .danger-icon { background: #fee2e2; color: #dc2626; padding: 8px; border-radius: 50%; font-size: 14px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

        @media print {
          .header-actions, .filter-toolbar, .action-icons, th:last-child, td:last-child { display: none !important; }
          body { background: white; }
          .card { border: none; padding: 0; }
        }
      `}</style>

      <div className="payslip-container">
        
        {/* Top Header */}
        <div className="header-top">
          <div>
            <h1>Edit Payslip</h1>
            <p className="subtitle">Update or delete the payslip of the employee.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsAddingEmployee(true)}>+ Add New Employee</button>
            <button className="btn btn-secondary" onClick={handleDownloadPDF}>📥 Download PDF</button>
            <button className="btn btn-success" onClick={handleExportExcel}>📊 Export Excel</button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="filter-group">
            <label>Employee</label>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Select or search employee" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <div className="filter-group">
            <label>Pay Period</label>
            <select>
              <option>May 2025 (01 May - 31 May)</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Month</label>
            <select>
              <option>May 2025</option>
            </select>
          </div>
          <div className="filter-group btn-go-wrapper">
            <button className="btn btn-primary btn-go">GO</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid" style={{ gridTemplateColumns: '1fr' }}>
          
          {/* Table Card */}
          <div className="card table-card">
            <div className="table-header-info">Total Records: {filteredRecords.length}</div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Pay Period</th>
                    <th>Total Earnings (₹)</th>
                    <th>Total Deductions (₹)</th>
                    <th>Net Salary (₹)</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className={selectedRecord?.id === record.id ? 'selected-row' : ''}
                      onClick={() => handleRowClick(record)}
                    >
                      <td className="font-medium">{record.id}</td>
                      <td>{record.name}</td>
                      <td className="text-muted">{record.payPeriod}</td>
                      <td>{rowTotals.totalEarnings}</td>
                      <td>{rowTotals.totalDeductions}</td>
                      <td>{record.netSalary}</td>
                      <td><span className="badge-processed">{record.status}</span></td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-icons">
                          <button title="View" onClick={() => handleRowClick(record)}>👁️</button>
                          <button title="Edit" onClick={(e) => handleEditEmployeeClick(record, e)}>✏️</button>
                          <button title="Delete" onClick={() => { setSelectedRecord(record); setDeletingPayslip(true); }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Add New Employee Modal */}
        {isAddingEmployee && (
          <div className="modal-backdrop" style={{ zIndex: 110 }}>
            <div className="modal">
              <button className="close-btn" onClick={() => setIsAddingEmployee(false)}>✕</button>
              <h2>Add New Employee Row</h2>
              
              <form onSubmit={handleSaveNewEmployee}>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input 
                    type="text" 
                    value={newEmployeeValues.id}
                    onChange={(e) => setNewEmployeeValues({...newEmployeeValues, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input 
                    type="text" 
                    value={newEmployeeValues.name}
                    placeholder="e.g. Rajesh Kumar"
                    onChange={(e) => setNewEmployeeValues({...newEmployeeValues, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pay Period</label>
                  <input 
                    type="text" 
                    value={newEmployeeValues.payPeriod}
                    onChange={(e) => setNewEmployeeValues({...newEmployeeValues, payPeriod: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Net Salary (₹)</label>
                  <input 
                    type="text" 
                    value={newEmployeeValues.netSalary}
                    placeholder="e.g. 35,000.00"
                    onChange={(e) => setNewEmployeeValues({...newEmployeeValues, netSalary: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddingEmployee(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Employee</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="modal-backdrop" style={{ zIndex: 110 }}>
            <div className="modal">
              <button className="close-btn" onClick={() => setEditingEmployee(null)}>✕</button>
              <h2>Edit Employee</h2>
              
              <form onSubmit={handleSaveEditedEmployee}>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input 
                    type="text" 
                    value={editEmployeeValues.id} 
                    disabled 
                    style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input 
                    type="text" 
                    value={editEmployeeValues.name}
                    onChange={(e) => setEditEmployeeValues({...editEmployeeValues, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Net Salary (₹) *</label>
                  <input 
                    type="text" 
                    value={editEmployeeValues.netSalary}
                    onChange={(e) => setEditEmployeeValues({...editEmployeeValues, netSalary: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <input 
                    type="text" 
                    value={editEmployeeValues.status}
                    onChange={(e) => setEditEmployeeValues({...editEmployeeValues, status: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingEmployee(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payslip Details Modal */}
        {showDetailModal && (
          <div className="modal-backdrop">
            <div className="modal-large">
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
              
              <div className="modal-header-flex">
                <h2>Payslip Details</h2>
                <button className="btn btn-primary" onClick={handleAddNewClick}>+ Add New Component</button>
              </div>
              
              <div className="details-box">
                <div><span>Employee:</span> <b>{selectedRecord?.name} ({selectedRecord?.id})</b></div>
                <div><span>Pay Date:</span> <b>31 May 2025</b></div>
                <div><span>Pay Period:</span> <b>May 2025 (01 May - 31 May)</b></div>
                <div><span>Status:</span> <span className="badge-processed">Processed</span></div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {['Earnings', 'Deductions', 'Employer Components'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-btn ${activeTab === tab ? 'active-tab' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Component Table */}
              <table className="inner-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Description</th>
                    <th className="text-right">Amount (₹)</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'Earnings' ? componentsData.earnings : 
                    activeTab === 'Deductions' ? componentsData.deductions : 
                    componentsData.employerComponents).map((item) => (
                    <tr key={item.id}>
                      <td><b>{item.name}</b></td>
                      <td className="text-muted">{item.description}</td>
                      <td className="text-right">{item.amount}</td>
                      <td className="text-center">
                        <button className="icon-btn" onClick={() => handleEditClick(item)}>✏️</button>
                        <button className="icon-btn text-red" onClick={() => setDeletingComponent(item)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Dynamic Total Row Calculation */}
              <div className="total-row">
                <span className="text-blue">
                  Total {activeTab === 'Earnings' ? 'Earnings' : activeTab === 'Deductions' ? 'Deductions' : 'Employer Components'}
                </span>
                <span className="text-blue">
                  {calculateTotal(
                    activeTab === 'Earnings' ? componentsData.earnings : 
                    activeTab === 'Deductions' ? componentsData.deductions : 
                    componentsData.employerComponents
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Component Form Modal */}
        {editingComponent && (
          <div className="modal-backdrop" style={{ zIndex: 110 }}>
            <div className="modal">
              <button className="close-btn" onClick={() => setEditingComponent(null)}>✕</button>
              <h2>{isAddingComponent ? 'Add New Component' : 'Edit Component'}</h2>
              
              <form onSubmit={handleSaveComponent}>
                <div className="form-group">
                  <label>Component Name</label>
                  <input 
                    type="text" 
                    value={editFormValues.name}
                    placeholder="e.g. Performance Bonus"
                    onChange={(e) => setEditFormValues({...editFormValues, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={editFormValues.description}
                    placeholder="e.g. Bonus"
                    onChange={(e) => setEditFormValues({...editFormValues, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input 
                    type="text" 
                    value={editFormValues.amount}
                    placeholder="e.g. 5,000.00"
                    onChange={(e) => setEditFormValues({...editFormValues, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingComponent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isAddingComponent ? 'Add' : 'Update'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Component Modal */}
        {deletingComponent && (
          <div className="modal-backdrop" style={{ zIndex: 110 }}>
            <div className="modal">
              <button className="close-btn" onClick={() => setDeletingComponent(null)}>✕</button>
              <div className="modal-body-flex">
                <div className="warning-icon">⚠️</div>
                <div>
                  <h3>Delete Component</h3>
                  <p>Are you sure you want to delete this component?</p>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setDeletingComponent(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteComponentConfirm}>OK</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Payslip Modal */}
        {deletingPayslip && (
          <div className="modal-backdrop" style={{ zIndex: 110 }}>
            <div className="modal">
              <button className="close-btn" onClick={() => setDeletingPayslip(false)}>✕</button>
              <div className="modal-body-flex">
                <div className="danger-icon">🗑️</div>
                <div>
                  <h3>Delete Payslip</h3>
                  <p>Are you sure you want to delete the payslip for <b>{selectedRecord?.name}</b> for May 2025 (01 May - 31 May)?</p>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setDeletingPayslip(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeletePayslipConfirm}>OK</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}