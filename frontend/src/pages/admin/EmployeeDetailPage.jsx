import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { employeesApi, documentsApi } from "../../api";
import { 
  User, 
  Briefcase, 
  Building, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  CreditCard,
  ArrowLeft,
  FileText,
  Upload,
  Trash2,
  Download
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.get(id);
      setEmployee(data);
    } catch (err) {
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl opacity-50">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-xl text-red-500">Employee not found</div>
        <button className="btn btn-primary" onClick={() => navigate("/admin/employees")}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          className="btn btn-ghost btn-icon" 
          onClick={() => navigate("/admin/employees")}
          title="Back to Employees"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="page-header-left" style={{ flex: 1 }}>
          <h1>{employee.first_name} {employee.last_name}</h1>
          <p>{employee.designation_name || 'No Designation'} • {employee.employee_code}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className={`badge ${employee.status === 'Active' ? 'badge-green' : employee.status === 'Inactive' ? 'badge-gray' : employee.status === 'Resigned' ? 'badge-amber' : 'badge-red'}`}
            style={{ fontSize: '1rem', padding: '0.4rem 1rem', appearance: 'none', border: 'none', outline: 'none', cursor: 'pointer' }}
            value={employee.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              if (!window.confirm(`Change status to ${newStatus}?`)) return;
              try {
                await employeesApi.updateStatus(id, newStatus);
                toast.success("Status updated");
                loadEmployee();
              } catch (err) {
                toast.error("Failed to update status");
              }
            }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>

          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/admin/employees/${id}/edit`)}
          >
            Edit Employee
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
        
        {/* Left Sidebar Profile Card */}
        <div className="card" style={{ flex: '0 0 300px', alignSelf: 'flex-start' }}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div 
              style={{
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'var(--primary)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              {employee.first_name.charAt(0)}{employee.last_name?.charAt(0)}
            </div>
            <h3 style={{ margin: 0 }}>{employee.first_name} {employee.last_name}</h3>
            <div style={{ opacity: 0.7, marginTop: '0.5rem', fontSize: '0.9rem' }}>{employee.official_email}</div>
            
            <div style={{ width: '100%', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>
            
            <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={16} style={{ opacity: 0.6 }} />
                <span>{employee.department_name || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building size={16} style={{ opacity: 0.6 }} />
                <span>{employee.location_name || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={16} style={{ opacity: 0.6 }} />
                <span>{employee.contact_number || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={16} style={{ opacity: 0.6 }} />
                <span>Joined {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {['profile', 'organization', 'statutory', 'documents'].map(tab => (
              <button 
                key={tab}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  fontWeight: activeTab === tab ? '600' : '400',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-color)',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-body">
              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <DetailItem icon={<User />} label="Full Name" value={`${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`} />
                  <DetailItem icon={<Briefcase />} label="Employee Code" value={employee.employee_code} />
                  <DetailItem icon={<Calendar />} label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'} />
                  <DetailItem icon={<User />} label="Gender" value={employee.gender || 'N/A'} />
                  <DetailItem icon={<Mail />} label="Official Email" value={employee.official_email || 'N/A'} />
                  <DetailItem icon={<Mail />} label="Personal Email" value={employee.personal_email || 'N/A'} />
                  <DetailItem icon={<Phone />} label="Contact Number" value={employee.contact_number || 'N/A'} />
                  <DetailItem icon={<User />} label="Badge ID" value={employee.badge_id || 'N/A'} />
                </div>
              )}

              {activeTab === 'organization' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <DetailItem icon={<Building />} label="Location" value={employee.location_name || 'N/A'} />
                  <DetailItem icon={<Briefcase />} label="Department" value={employee.department_name || 'N/A'} />
                  <DetailItem icon={<Briefcase />} label="Designation" value={employee.designation_name || 'N/A'} />
                  <DetailItem icon={<User />} label="Category" value={employee.category_name || 'N/A'} />
                  <DetailItem icon={<User />} label="Group" value={employee.group_name || 'N/A'} />
                  <DetailItem icon={<User />} label="Sub-Group" value={employee.sub_group_name || 'N/A'} />
                  <DetailItem icon={<Calendar />} label="Calendar" value={employee.calendar_name || 'N/A'} />
                  <DetailItem icon={<User />} label="Reporting Manager" value={employee.reporting_manager_name || 'N/A'} />
                  <DetailItem icon={<Calendar />} label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'} />
                  <DetailItem icon={<Calendar />} label="Confirmation Date" value={employee.confirmation_date ? new Date(employee.confirmation_date).toLocaleDateString() : 'N/A'} />
                </div>
              )}

              {activeTab === 'statutory' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <DetailItem icon={<ShieldCheck />} label="PF Number" value={employee.pf_number || 'N/A'} />
                  <DetailItem icon={<ShieldCheck />} label="ESI Number" value={employee.esi_number || 'N/A'} />
                  <DetailItem icon={<ShieldCheck />} label="UAN Number" value={employee.uan_number || 'N/A'} />
                  <DetailItem icon={<CreditCard />} label="Bank Name" value={employee.bank_name || 'N/A'} />
                  <DetailItem icon={<CreditCard />} label="Bank IFSC" value={employee.bank_ifsc || 'N/A'} />
                </div>
              )}

              {activeTab === 'documents' && <EmployeeDocumentsTab employeeId={id} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ 
        background: 'var(--bg-secondary)', 
        padding: '0.75rem', 
        borderRadius: '0.5rem',
        color: 'var(--primary)'
      }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontWeight: '500', fontSize: '1rem' }}>{value}</div>
      </div>
    </div>
  );
}

function EmployeeDocumentsTab({ employeeId }) {
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [docName, setDocName] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await documentsApi.list(employeeId);
      setDocuments(data);
    } catch (err) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocs();
  }, [employeeId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docName || !file) {
      return toast.error("Please provide a name and select a file.");
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("document_name", docName);
      formData.append("file", file);
      
      await documentsApi.upload(employeeId, formData);
      toast.success("Document uploaded successfully");
      setDocName("");
      setFile(null);
      e.target.reset();
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentsApi.remove(docId);
      toast.success("Document deleted");
      fetchDocs();
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Document Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. Aadhar Card, Resume" 
            value={docName} 
            onChange={(e) => setDocName(e.target.value)} 
            required 
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Select File</label>
          <input 
            type="file" 
            className="input" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          <Upload size={18} style={{ marginRight: '0.5rem' }} /> {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {loading ? (
        <div className="text-center opacity-50">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center opacity-50" style={{ padding: '2rem' }}>No documents uploaded yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ 
              border: '1px solid var(--border)', 
              borderRadius: '0.5rem', 
              padding: '1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{doc.document_name}</h4>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <a 
                  href={`http://localhost:5000/${doc.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                >
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> View
                </a>
                <button 
                  className="btn btn-ghost" 
                  style={{ color: 'var(--danger)' }} 
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
