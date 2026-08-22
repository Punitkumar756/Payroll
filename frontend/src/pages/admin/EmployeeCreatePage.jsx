import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [masters, setMasters] = useState({
    departments: [], designations: [], locations: [], calendars: [], categories: [], groups: [], subGroups: []
  });
  
  const [form, setForm] = useState({
    // Basic
    employee_code: '', first_name: '', middle_name: '', last_name: '', date_of_birth: '', gender: 'Male', blood_group: '', marital_status: '',
    // Employment
    joining_date: '', confirmation_date: '', status: 'Active',
    // Organization
    department_id: '', designation_id: '', location_id: '', category_id: '', group_id: '', sub_group_id: '', calendar_id: '', reporting_manager_id: '', badge_id: '',
    // Contact
    official_email: '', contact_number: '', emergency_name: '', emergency_phone: '', emergency_relation: '', current_address: '', permanent_address: '',
    // Statutory
    pf_number: '', esi_number: '', pan: '', aadhaar: '', uan: '',
    // Bank
    bank_name: '', bank_account: '', bank_ifsc: '', bank_branch: ''
  });

  useEffect(() => {
    Promise.all([
      departmentsApi.list().catch(()=>[]), designationsApi.list().catch(()=>[]), locationsApi.list().catch(()=>[]), 
      calendarsApi.list().catch(()=>[]), categoriesApi.list().catch(()=>[]), groupsApi.list().catch(()=>[]), subGroupsApi.list().catch(()=>[])
    ]).then(([d, des, l, c, cat, g, sg]) => {
      setMasters({ departments: Array.isArray(d)?d:[], designations: Array.isArray(des)?des:[], locations: Array.isArray(l)?l:[], calendars: Array.isArray(c)?c:[], categories: Array.isArray(cat)?cat:[], groups: Array.isArray(g)?g:[], subGroups: Array.isArray(sg)?sg:[] });
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Create Basic Employee
      const empPayload = {
        employee_code: form.employee_code, first_name: form.first_name, middle_name: form.middle_name, last_name: form.last_name, 
        date_of_birth: form.date_of_birth, gender: form.gender, joining_date: form.joining_date, 
        department_id: form.department_id, designation_id: form.designation_id, location_id: form.location_id, 
        category_id: form.category_id, group_id: form.group_id, sub_group_id: form.sub_group_id, 
        calendar_id: form.calendar_id, reporting_manager_id: form.reporting_manager_id, 
        official_email: form.official_email, contact_number: form.contact_number, badge_id: form.badge_id, status: form.status
      };
      
      const created = await employeesApi.create(empPayload);
      
      // We will attempt to save statutory and address if API endpoints exist.
      // For now, we rely on the main create. If backend needs specific updates, we can add them later.
      try {
        if(employeesApi.updateStatutory) {
           await employeesApi.updateStatutory(created.id, {
             pf_number: form.pf_number, esi_number: form.esi_number, pan: form.pan, aadhaar: form.aadhaar,
             bank_name: form.bank_name, bank_account: form.bank_account, bank_ifsc: form.bank_ifsc, bank_branch: form.bank_branch, uan: form.uan
           });
        }
      } catch(err) { console.warn('Statutory update failed/unavailable', err); }

      toast.success('Employee onboarded successfully!');
      navigate(`/admin/employees/${created.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.response?.data?.detail || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="animate-fade">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--clr-primary)' }}>Basic Details</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input required className="form-input" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input className="form-input" value={form.middle_name} onChange={e => set('middle_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input required className="form-input" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input required type="date" className="form-input" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  <option value="">Select...</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select className="form-select" value={form.marital_status} onChange={e => set('marital_status', e.target.value)}>
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
                <input required className="form-input" value={form.employee_code} onChange={e => set('employee_code', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date *</label>
                <input required type="date" className="form-input" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmation Date</label>
                <input type="date" className="form-input" value={form.confirmation_date} onChange={e => set('confirmation_date', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Employment Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option>Active</option><option>Inactive</option><option>Probation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Badge ID / Biometric ID</label>
                <input className="form-input" value={form.badge_id} onChange={e => set('badge_id', e.target.value)} />
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
                <label className="form-label">Location *</label>
                <select required className="form-select" value={form.location_id} onChange={e => set('location_id', Number(e.target.value))}>
                  <option value="">Select Location...</option>
                  {masters.locations.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select required className="form-select" value={form.department_id} onChange={e => set('department_id', Number(e.target.value))}>
                  <option value="">Select Department...</option>
                  {masters.departments.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation *</label>
                <select required className="form-select" value={form.designation_id} onChange={e => set('designation_id', Number(e.target.value))}>
                  <option value="">Select Designation...</option>
                  {masters.designations.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id} onChange={e => set('category_id', Number(e.target.value))}>
                  <option value="">Select Category...</option>
                  {masters.categories.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={form.group_id} onChange={e => set('group_id', Number(e.target.value))}>
                  <option value="">Select Group...</option>
                  {masters.groups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sub Group</label>
                <select className="form-select" value={form.sub_group_id} onChange={e => set('sub_group_id', Number(e.target.value))}>
                  <option value="">Select Sub Group...</option>
                  {masters.subGroups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Calendar</label>
                <select className="form-select" value={form.calendar_id} onChange={e => set('calendar_id', Number(e.target.value))}>
                  <option value="">Select Calendar...</option>
                  {masters.calendars.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
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
                <input type="email" className="form-input" value={form.official_email} onChange={e => set('official_email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input required className="form-input" value={form.contact_number} onChange={e => set('contact_number', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Address</label>
                <textarea className="form-textarea" rows="3" value={form.current_address} onChange={e => set('current_address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Permanent Address</label>
                <textarea className="form-textarea" rows="3" value={form.permanent_address} onChange={e => set('permanent_address', e.target.value)} />
              </div>
            </div>
            <h4 style={{ margin: '1rem 0' }}>Emergency Contact</h4>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.emergency_name} onChange={e => set('emergency_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Relation</label>
                <input className="form-input" value={form.emergency_relation} onChange={e => set('emergency_relation', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.emergency_phone} onChange={e => set('emergency_phone', e.target.value)} />
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
                <input className="form-input" value={form.pan} onChange={e => set('pan', e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input className="form-input" value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">PF Number</label>
                <input className="form-input" value={form.pf_number} onChange={e => set('pf_number', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">UAN</label>
                <input className="form-input" value={form.uan} onChange={e => set('uan', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">ESI Number</label>
                <input className="form-input" value={form.esi_number} onChange={e => set('esi_number', e.target.value)} />
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
                <input className="form-input" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input className="form-input" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input className="form-input" value={form.bank_ifsc} onChange={e => set('bank_ifsc', e.target.value)} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
            <div className="form-row-3">
               <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input className="form-input" value={form.bank_branch} onChange={e => set('bank_branch', e.target.value)} />
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
            <User size={28} color="var(--clr-primary)" /> Onboard Employee
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', margin: '0.25rem 0 0' }}>Complete the employee profile sections to add them to the system</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/employees')}><X size={18} /> Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Sidebar Tabs */}
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

        {/* Right Content Area */}
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
                  <Save size={18} /> {saving ? 'Saving...' : 'Complete Onboarding'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
