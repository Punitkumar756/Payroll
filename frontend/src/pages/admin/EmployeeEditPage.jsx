import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeesApi, departmentsApi, designationsApi, locationsApi, calendarsApi, categoriesApi, groupsApi, subGroupsApi } from '../../api';
import toast from 'react-hot-toast';
import { User, Briefcase, Building, MapPin, Shield, CreditCard, ChevronRight, Save, X } from 'lucide-react';

const TABS = [
  { id: 'basic', label: 'Basic Details', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'address', label: 'Address & Contact', icon: MapPin },
  { id: 'statutory', label: 'Statutory', icon: Shield },
  { id: 'payment', label: 'Bank & Payment', icon: CreditCard }
];

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  
  const [masters, setMasters] = useState({
    departments: [], designations: [], locations: [], calendars: [], categories: [], groups: [], subGroups: [], managers: []
  });
  
  const [form, setForm] = useState({
    employee_code: '', first_name: '', middle_name: '', last_name: '', date_of_birth: '', gender: 'Male', blood_group: '', marital_status: '',
    joining_date: '', confirmation_date: '', status: 'Active',
    department_id: '', designation_id: '', location_id: '', category_id: '', group_id: '', sub_group_id: '', calendar_id: '', reporting_manager_id: '', badge_id: '',
    official_email: '', contact_number: '', emergency_name: '', emergency_phone: '', emergency_relation: '', current_address: '', permanent_address: ''
  });

  const [statutory, setStatutory] = useState({
    pf_number: '', esi_number: '', pan: '', aadhaar: '', uan: '', bank_name: '', bank_account: '', bank_ifsc: '', bank_branch: ''
  });

  useEffect(() => {
    Promise.all([
      departmentsApi.list().catch(()=>[]), designationsApi.list().catch(()=>[]), locationsApi.list().catch(()=>[]), 
      calendarsApi.list().catch(()=>[]), categoriesApi.list().catch(()=>[]), groupsApi.list().catch(()=>[]), 
      employeesApi.list({ status: "Active", page_size: 500 }).catch(()=>[]),
      employeesApi.get(id)
    ]).then(([d, des, l, c, cat, g, empList, emp]) => {
      setMasters({ 
        departments: Array.isArray(d)?d:[], designations: Array.isArray(des)?des:[], locations: Array.isArray(l)?l:[], 
        calendars: Array.isArray(c)?c:[], categories: Array.isArray(cat)?cat:[], groups: Array.isArray(g)?g:[], 
        subGroups: [], managers: Array.isArray(empList) ? empList.filter(e => String(e.id) !== String(id)) : []
      });

      ['joining_date', 'date_of_birth', 'confirmation_date'].forEach(k => {
        if (emp[k]) emp[k] = emp[k].split('T')[0];
      });

      const { pf_number, esi_number, uan_number, bank_name, bank_ifsc, bank_branch, pan, aadhaar, bank_account, ...core } = emp;

      setForm({ ...form, ...core });
      setStatutory({
        pf_number: pf_number || '', esi_number: esi_number || '', uan: uan_number || '', pan: pan || '', aadhaar: aadhaar || '',
        bank_name: bank_name || '', bank_account: bank_account || '', bank_ifsc: bank_ifsc || '', bank_branch: bank_branch || ''
      });

      if (emp.group_id) {
        subGroupsApi.list({ group_id: emp.group_id }).then(sg => {
          setMasters(m => ({ ...m, subGroups: Array.isArray(sg) ? sg : [] }));
        }).catch(()=>{});
      }
    }).catch(() => {
      toast.error("Failed to load employee");
      navigate("/admin/employees");
    }).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [id, navigate]);

  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = useCallback((k, v) => {
    setDirty(true);
    setForm(f => ({ ...f, [k]: v }));
  }, []);

  const setStat = useCallback((k, v) => {
    setDirty(true);
    setStatutory(s => ({ ...s, [k]: v }));
  }, []);

  const handleGroupChange = async (groupId) => {
    set('group_id', groupId);
    set('sub_group_id', '');
    if (groupId) {
      try {
        const sg = await subGroupsApi.list({ group_id: groupId });
        setMasters(m => ({ ...m, subGroups: Array.isArray(sg) ? sg : [] }));
      } catch { setMasters(m => ({ ...m, subGroups: [] })); }
    } else {
      setMasters(m => ({ ...m, subGroups: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.first_name || !form.last_name || !form.employee_code || !form.joining_date) {
        toast.error("Please fill in required fields (Name, Code, Joining Date)");
        return;
    }
    setSaving(true);
    try {
      await employeesApi.update(id, form);
      const hasStatutory = Object.values(statutory).some(v => v?.trim?.());
      if (hasStatutory && employeesApi.updateStatutory) {
        await employeesApi.updateStatutory(id, statutory);
      }
      setDirty(false);
      toast.success('Employee updated successfully!');
      navigate(`/admin/employees/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.detail || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>Loading employee details...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Basic Details</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input required className="form-input" value={form.first_name || ''} onChange={e => set('first_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input className="form-input" value={form.middle_name || ''} onChange={e => set('middle_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input required className="form-input" value={form.last_name || ''} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-input" value={form.date_of_birth || ''} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender || 'Male'} onChange={e => set('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={form.blood_group || ''} onChange={e => set('blood_group', e.target.value)}>
                  <option value="">Select...</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select className="form-select" value={form.marital_status || ''} onChange={e => set('marital_status', e.target.value)}>
                  <option value="">Select...</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'employment':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Employment Information</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Employee Code *</label>
                <input required className="form-input" value={form.employee_code || ''} onChange={e => set('employee_code', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date *</label>
                <input required type="date" className="form-input" value={form.joining_date || ''} onChange={e => set('joining_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmation Date</label>
                <input type="date" className="form-input" value={form.confirmation_date || ''} onChange={e => set('confirmation_date', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Employment Status</label>
                <select className="form-select" value={form.status || 'Active'} onChange={e => set('status', e.target.value)}>
                  <option>Active</option><option>Inactive</option><option>Probation</option>
                  <option>Notice Period</option><option>Terminated</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Badge ID / Biometric ID</label>
                <input className="form-input" value={form.badge_id || ''} onChange={e => set('badge_id', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'organization':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Organizational Hierarchy</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.location_id || ''} onChange={e => set('location_id', Number(e.target.value))}>
                  <option value="">Select Location...</option>
                  {masters.locations.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department_id || ''} onChange={e => set('department_id', Number(e.target.value))}>
                  <option value="">Select Department...</option>
                  {masters.departments.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <select className="form-select" value={form.designation_id || ''} onChange={e => set('designation_id', Number(e.target.value))}>
                  <option value="">Select Designation...</option>
                  {masters.designations.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id || ''} onChange={e => set('category_id', Number(e.target.value))}>
                  <option value="">Select Category...</option>
                  {masters.categories.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={form.group_id || ''} onChange={e => handleGroupChange(Number(e.target.value))}>
                  <option value="">Select Group...</option>
                  {masters.groups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sub Group</label>
                <select className="form-select" value={form.sub_group_id || ''} onChange={e => set('sub_group_id', Number(e.target.value))}>
                  <option value="">Select Sub Group...</option>
                  {masters.subGroups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Calendar</label>
                <select className="form-select" value={form.calendar_id || ''} onChange={e => set('calendar_id', Number(e.target.value))}>
                  <option value="">Select Calendar...</option>
                  {masters.calendars.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reporting Manager</label>
                <select className="form-select" value={form.reporting_manager_id || ''} onChange={e => set('reporting_manager_id', Number(e.target.value))}>
                  <option value="">Select Manager...</option>
                  {masters.managers.map(x => <option key={x.id} value={x.id}>{x.first_name} {x.last_name}</option>)}
                </select>
              </div>
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Contact & Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input type="email" className="form-input" value={form.official_email || ''} onChange={e => set('official_email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" value={form.contact_number || ''} onChange={e => set('contact_number', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Address</label>
                <textarea className="form-textarea" rows="3" value={form.current_address || ''} onChange={e => set('current_address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Permanent Address</label>
                <textarea className="form-textarea" rows="3" value={form.permanent_address || ''} onChange={e => set('permanent_address', e.target.value)} />
              </div>
            </div>
            <h4 style={{ margin: '1rem 0' }}>Emergency Contact</h4>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.emergency_name || ''} onChange={e => set('emergency_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Relation</label>
                <input className="form-input" value={form.emergency_relation || ''} onChange={e => set('emergency_relation', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.emergency_phone || ''} onChange={e => set('emergency_phone', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'statutory':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Statutory Details</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input className="form-input" value={statutory.pan} onChange={e => setStat('pan', e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input className="form-input" value={statutory.aadhaar} onChange={e => setStat('aadhaar', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">PF Number</label>
                <input className="form-input" value={statutory.pf_number} onChange={e => setStat('pf_number', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">UAN</label>
                <input className="form-input" value={statutory.uan} onChange={e => setStat('uan', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">ESI Number</label>
                <input className="form-input" value={statutory.esi_number} onChange={e => setStat('esi_number', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Bank & Payment Info</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input className="form-input" value={statutory.bank_name} onChange={e => setStat('bank_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input className="form-input" value={statutory.bank_account} onChange={e => setStat('bank_account', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input className="form-input" value={statutory.bank_ifsc} onChange={e => setStat('bank_ifsc', e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
            <div className="form-row-3">
               <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input className="form-input" value={statutory.bank_branch} onChange={e => setStat('bank_branch', e.target.value)} />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={28} color="var(--clr-primary)" /> Edit Employee
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', margin: '0.25rem 0 0' }}>Updating profile for {form.first_name} {form.last_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {dirty && <span style={{ color: "var(--clr-warning)", background: "rgba(245,158,11,0.1)", padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.85rem" }}>Unsaved changes</span>}
          <button className="btn btn-outline" onClick={() => { if(dirty && !window.confirm("Discard changes?")) return; navigate(`/admin/employees/${id}`); }}><X size={18} /> Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="card" style={{ width: '280px', padding: '1rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: isActive ? 'var(--clr-primary)' : 'var(--clr-text)',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s', textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} /> {tab.label}
                  </span>
                  {isActive && <ChevronRight size={18} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ flex: 1, padding: '2rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {renderTabContent()}
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {TABS.findIndex(t => t.id === activeTab) > 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}>
                  Previous
                </button>
              )}
            </div>
            <div>
              {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}>
                  Next Section
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: 'var(--clr-success)', borderColor: 'var(--clr-success)' }}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Employee'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
