import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  Save,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SalaryStructure({ onBack }) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Earnings');
  const [stateTax, setStateTax] = useState('Karnataka');
  const [toastMessage, setToastMessage] = useState(null);
  
  const [employees, setEmployees] = useState([]);

  // New Component State
  const [newComponent, setNewComponent] = useState({
    category: 'Earnings',
    salaryHead: '',
    amount: '',
    remarks: ''
  });

  // DB driven components data
  const [components, setComponents] = useState({
    'Earnings': [],
    'Deductions': [],
    'Employer contribution': [],
    'Employee Variables': []
  });

  useEffect(() => {
    // Fetch employees from local DB
    fetch('http://localhost:5000/api/payroll/employees')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setEmployees(data.data);
        } else if (Array.isArray(data)) {
          setEmployees(data);
        }
      })
      .catch(err => console.error("Failed to fetch employees:", err));

    // Fetch components from local DB
    fetch('http://localhost:5000/api/payroll/payslip-components')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const newComponents = {
            'Earnings': [],
            'Deductions': [],
            'Employer contribution': [],
            'Employee Variables': []
          };
          
          data.forEach(item => {
            const cat = item.type || 'Earnings'; // Use category from DB or fallback
            if (!newComponents[cat]) {
              newComponents[cat] = []; // Initialize if category doesn't exist
            }
            newComponents[cat].push({
              id: item.id,
              name: item.name,
              amount: item.amount || 0,
              checked: true,
              remarks: item.description || ''
            });
          });
          
          setComponents(newComponents);
        }
      })
      .catch(err => console.error("Failed to fetch payslip components:", err));
  }, []);

  const categories = ['Earnings', 'Deductions', 'Employer contribution', 'Employee Variables'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditClick = () => {
    if (!selectedEmployee) {
      alert("Please select an employee first");
      return;
    }
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    setIsEditMode(false);
    showToast("Salary Structure saved successfully!");
  };

  const handleCheckboxToggle = (category, id) => {
    if (!isEditMode) return;
    setComponents(prev => ({
      ...prev,
      [category]: prev[category].map(c =>
        c.id === id ? { ...c, checked: !c.checked } : c
      )
    }));
  };

  const handleNewComponentSubmit = (e) => {
    e.preventDefault();
    if (!newComponent.salaryHead || !newComponent.amount) {
      alert("Please enter Salary Head and Amount");
      return;
    }

    const newEntry = {
      id: Date.now(),
      name: newComponent.salaryHead,
      amount: newComponent.amount,
      checked: true,
      remarks: newComponent.remarks
    };

    setComponents(prev => ({
      ...prev,
      [newComponent.category]: [...prev[newComponent.category], newEntry]
    }));

    setIsNewModalOpen(false);
    setNewComponent({ category: 'Earnings', salaryHead: '', amount: '', remarks: '' });
    showToast("New component added successfully!");
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
          <div>
            <h2 style={styles.cardTitle}>Salary Structure</h2>
            <p style={styles.cardSubtitle}>Assign salary components to the employee.</p>
          </div>
          {onBack && (
            <button onClick={onBack} style={styles.backButton}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          )}
        </div>

        <div style={styles.toolbar}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Select Employee *</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.select}
              disabled={isEditMode}
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.id} - {emp.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.actionToolbar}>
            {!isEditMode ? (
              <button onClick={handleEditClick} style={styles.editButton}>
                <Edit2 size={15} /> EDIT
              </button>
            ) : (
              <button onClick={handleSaveClick} style={styles.saveButton}>
                <Save size={15} /> SAVE
              </button>
            )}
          </div>
        </div>

        {isEditMode && (
          <div style={styles.stateTaxContainer}>
            <label style={styles.label}>State for Professional Tax</label>
            <select
              value={stateTax}
              onChange={(e) => setStateTax(e.target.value)}
              style={{ ...styles.select, width: '200px' }}
            >
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        )}

        <div style={styles.tabsContainer}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ ...styles.tabButton, ...(activeCategory === cat ? styles.activeTab : {}) }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={styles.categoryHeader}>
          <h3 style={styles.categoryTitle}>{activeCategory} Components</h3>
          {isEditMode && (
            <button onClick={() => {
              setNewComponent({ ...newComponent, category: activeCategory });
              setIsNewModalOpen(true);
            }} style={styles.newButton}>
              <Plus size={14} /> NEW
            </button>
          )}
        </div>

        <div style={styles.componentsList}>
          {components[activeCategory].length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Enable</th>
                  <th style={styles.th}>Component Name</th>
                  <th style={styles.th}>Amount (₹)</th>
                  <th style={styles.th}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {components[activeCategory].map(item => (
                  <tr key={item.id} style={styles.trRow}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleCheckboxToggle(activeCategory, item.id)}
                        disabled={!isEditMode}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.tdBold}>{item.name}</td>
                    <td style={styles.td}>{item.amount}</td>
                    <td style={styles.td}>{item.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>No components found in this category.</div>
          )}
        </div>
      </div>

      {isNewModalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Component</h3>
              <button onClick={() => setIsNewModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleNewComponentSubmit} style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={newComponent.category}
                  onChange={(e) => setNewComponent({ ...newComponent, category: e.target.value })}
                  style={styles.select}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Salary Head *</label>
                <input
                  type="text"
                  value={newComponent.salaryHead}
                  onChange={(e) => setNewComponent({ ...newComponent, salaryHead: e.target.value })}
                  placeholder="e.g. Special Allowance"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (₹) *</label>
                <input
                  type="number"
                  value={newComponent.amount}
                  onChange={(e) => setNewComponent({ ...newComponent, amount: e.target.value })}
                  placeholder="0.00"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Remarks</label>
                <input
                  type="text"
                  value={newComponent.remarks}
                  onChange={(e) => setNewComponent({ ...newComponent, remarks: e.target.value })}
                  placeholder="Any remarks..."
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsNewModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>SUBMIT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', color: '#0f172a' },
  card: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' },
  cardTitle: { fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' },
  cardSubtitle: { fontSize: '13px', color: '#64748b', margin: 0 },
  backButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '6px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '250px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#475569' },
  select: { padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none' },
  input: { padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  actionToolbar: { display: 'flex', gap: '10px' },
  editButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  stateTaxContainer: { marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe' },
  tabsContainer: { display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' },
  tabButton: { padding: '10px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
  activeTab: { color: '#2563eb', borderBottomColor: '#2563eb' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  categoryTitle: { fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' },
  newButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' },
  componentsList: { border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#475569' },
  trRow: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#334155' },
  tdBold: { padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' },
  checkbox: { cursor: 'pointer', width: '16px', height: '16px' },
  emptyState: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10b981', color: '#ffffff', padding: '12px 20px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000, fontSize: '13px', fontWeight: '500' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '400px', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  modalTitle: { margin: 0, fontSize: '15px', fontWeight: '600' },
  closeBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' },
  modalBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' },
  cancelBtn: { padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#475569' },
  submitBtn: { padding: '8px 16px', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#ffffff' }
};
