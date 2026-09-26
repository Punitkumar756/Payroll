import React, { useState, useEffect } from 'react';
import {
  FileText,
  ChevronDown,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/salary-heads';

export default function SalaryHead({ id = null, onBack }) {
  const isEditMode = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    salaryType: 'Earnings',
    headCategory: 'Basic',
    expression: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. GET API: Fetch existing data if in Edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchSalaryHead = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch salary head details (Status: ${response.status})`);
        }
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryHead();
  }, [id, isEditMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectBadge = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleReset = () => {
    setFormData({
      code: '',
      name: '',
      salaryType: 'Earnings',
      headCategory: 'Basic',
      expression: '',
      description: ''
    });
    setError(null);
    showToast('Form fields cleared successfully.');
  };

  // 2. POST & PUT API: Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = isEditMode ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} salary head.`);
      }

      const result = await response.json();
      showToast(`Salary Head '${result.name || formData.name}' ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      if (!isEditMode) {
        // Optional: Reset form after successful POST creation
        handleReset();
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading salary head details...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={styles.toast}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Form Card Container */}
      <div style={styles.card}>
        {/* Card Header */}
        <div style={styles.cardHeader}>
          <div style={styles.headerTitleGroup}>
            <div style={styles.iconBadge}>
              <FileText size={20} color="#2563eb" />
            </div>
            <h2 style={styles.cardTitle}>
              {isEditMode ? 'Edit Salary Head' : 'Create Salary Head'}
            </h2>
          </div>
          <button onClick={onBack} style={styles.backButton} type="button">
            <ArrowLeft size={16} />
            <span>Back to List</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Code Field */}
          <div className="salary-form-group" style={styles.formGroup}>
            <label style={styles.label}>
              Code <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter code"
                required
                disabled={isEditMode} // Optional: lock code during edit
                style={styles.input}
              />
            </div>
            <span style={styles.helperText}>Enter a unique code for the salary head</span>
          </div>

          {/* Name Field */}
          <div className="salary-form-group" style={styles.formGroup}>
            <label style={styles.label}>
              Name <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                required
                style={styles.input}
              />
            </div>
            <span style={styles.helperText}>Enter name of the salary head</span>
          </div>

          {/* Salary Type Field */}
          <div className="salary-form-group" style={styles.formGroup}>
            <label style={styles.label}>
              Salary Type <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputContainer}>
              <div style={styles.selectWrapper}>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Earnings">Earnings</option>
                  <option value="Deductions">Deductions</option>
                  <option value="Employer Contribution">Employer Contribution</option>
                </select>
                <ChevronDown size={16} style={styles.selectIcon} />
              </div>
            </div>
            <div style={styles.helperGroup}>
              <span style={styles.helperText}>Select salary type</span>
              <div style={styles.badgeList}>
                {['Earnings', 'Deductions', 'Employer Contribution'].map((type) => (
                  <span
                    key={type}
                    style={{
                      ...styles.badge,
                      backgroundColor: formData.salaryType === type ? '#dbeafe' : '#f1f5f9',
                      color: formData.salaryType === type ? '#1e40af' : '#64748b'
                    }}
                    onClick={() => handleSelectBadge('salaryType', type)}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Head Category Field */}
          <div className="salary-form-group" style={styles.formGroup}>
            <label style={styles.label}>
              Head Category <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputContainer}>
              <div style={styles.selectWrapper}>
                <select
                  name="headCategory"
                  value={formData.headCategory}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Basic">Basic</option>
                  <option value="DA">DA</option>
                  <option value="HRA">HRA</option>
                  <option value="Conveyance">Conveyance</option>
                </select>
                <ChevronDown size={16} style={styles.selectIcon} />
              </div>
            </div>
            <div style={styles.helperGroup}>
              <span style={styles.helperText}>Select head category</span>
              <div style={styles.badgeList}>
                {['Basic', 'DA', 'HRA', 'Conveyance'].map((cat) => (
                  <span
                    key={cat}
                    style={{
                      ...styles.badge,
                      backgroundColor: formData.headCategory === cat ? '#dbeafe' : '#f1f5f9',
                      color: formData.headCategory === cat ? '#1d4ed8' : '#64748b'
                    }}
                    onClick={() => handleSelectBadge('headCategory', cat)}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Expression Field */}
          <div className="salary-form-group" style={styles.formGroupAlignTop}>
            <label style={styles.label}>
              Expression <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputContainer}>
              <textarea
                name="expression"
                value={formData.expression}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                required
                style={styles.textarea}
              />
              <div style={styles.charCounter}>{formData.expression.length} / 500</div>
            </div>
            <div style={styles.helperTextCol}>
              <p style={{ margin: 0 }}>Enter the expression for salary calculation</p>
              <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
                Ex: <code>BAS * (PAID_DAYS / TOTALDAYS)</code>
              </p>
            </div>
          </div>

          {/* Description Field */}
          <div className="salary-form-group" style={styles.formGroupAlignTop}>
            <label style={styles.label}>Description</label>
            <div style={styles.inputContainer}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                style={styles.textarea}
              />
              <div style={styles.charCounter}>{formData.description.length} / 500</div>
            </div>
            <span style={styles.helperText}>Enter description (optional)</span>
          </div>

          {/* Form Actions Footbar */}
          <div style={styles.formFooter}>
            <button type="button" onClick={handleReset} style={styles.resetButton} disabled={submitting}>
              Reset
            </button>
            <button type="submit" style={styles.submitButton} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEditMode ? 'Update' : 'Submit'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Updated styles to fix text visibility bug and support API state indicators
const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#334155',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    fontSize: '13px',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '24px',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBadge: {
    backgroundColor: '#eff6ff',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #2563eb',
    color: '#2563eb',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'grid',
    gridTemplateColumns: '160px 320px 1fr',
    alignItems: 'center',
    gap: '20px',
  },
  formGroupAlignTop: {
    display: 'grid',
    gridTemplateColumns: '160px 320px 1fr',
    alignItems: 'flex-start',
    gap: '20px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#ebecf0', // Fixed low contrast bug
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    appearance: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  selectIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#64748b',
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#edeff4', // Fixed low contrast bug
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  charCounter: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  helperText: {
    fontSize: '12px',
    color: '#031120',
  },
  helperTextCol: {
    fontSize: '12px',
    color: '#0a4091',
    lineHeight: '1.5',
  },
  helperGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  badgeList: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    userSelect: 'none',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  resetButton: {
    padding: '9px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 24px',
    backgroundColor: '#0052cc',
    border: 'none',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};