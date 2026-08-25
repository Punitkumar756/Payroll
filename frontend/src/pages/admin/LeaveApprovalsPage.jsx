import { useEffect, useState } from "react";
import { leaveApi } from "../../api";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { CheckCircle, XCircle, X, User, Calendar, Clock, FileText, Check } from "lucide-react";

export default function LeaveApprovalsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Pending");
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setApps(await leaveApi.listApplications({ status: status || null }));
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const [actionModal, setActionModal] = useState({ isOpen: false, app: null, action: null, remarks: "" });

  const submitAction = async (e) => {
    e.preventDefault();
    setActing(actionModal.app.id);
    try {
      if (actionModal.action === "approve") await leaveApi.approve(actionModal.app.id, { remarks: actionModal.remarks });
      else await leaveApi.reject(actionModal.app.id, { remarks: actionModal.remarks });
      toast.success(`Leave ${actionModal.action}d`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed");
    } finally {
      setActing(null);
      setActionModal({ isOpen: false, app: null, action: null, remarks: "" });
    }
  };

  const statusColor = {
    Pending: "badge-amber",
    Approved: "badge-green",
    Rejected: "badge-red",
    Cancelled: "badge-gray",
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leave Approvals</h1>
          <p>Review and action pending leave applications</p>
        </div>
      </div>

      <div className="tabs">
        {["Pending", "Approved", "Rejected", "Cancelled"].map((s) => (
          <button
            key={s}
            className={`tab ${status === s ? "active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
        <button
          className={`tab ${status === "" ? "active" : ""}`}
          onClick={() => setStatus("")}
        >
          All
        </button>
      </div>

      <div className="card">
        <div
          className="table-wrapper"
          style={{ border: "none", borderRadius: 0 }}
        >
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : apps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p>No {status.toLowerCase()} applications.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Balance</th>
                  <th>Status</th>
                  {(status === "Approved" || status === "Rejected") && <th>HR Remark</th>}
                  {status === "Pending" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {apps.map((a, idx) => (
                  <tr key={a.id}>
                    <td>{idx + 1}</td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      {a.employee_name}
                    </td>
                    <td>
                      <span className="badge badge-indigo">
                        {a.employee_code}
                      </span>
                    </td>
                    <td>{a.leave_type}</td>
                    <td>
                      {a.start_date
                        ? format(new Date(a.start_date), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td>
                      {a.end_date
                        ? format(new Date(a.end_date), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.total_days}</td>
                    <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={a.reason}>{a.reason || "—"}</td>
                    <td>{a.current_balance ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${statusColor[a.status] || "badge-gray"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    {(status === "Approved" || status === "Rejected") && (
                      <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={a.approver_remarks}>{a.approver_remarks || "—"}</td>
                    )}
                    {status === "Pending" && (
                      <td>
                        <div style={{ display: "flex", gap: "var(--sp-xs)" }}>
                          <button
                            id={`btn-approve-leave-${a.id}`}
                            className="btn btn-success btn-sm"
                            disabled={acting === a.id}
                            onClick={() => setActionModal({ isOpen: true, app: a, action: "approve", remarks: "" })}
                          >
                            ✓ Approve
                          </button>
                          <button
                            id={`btn-reject-leave-${a.id}`}
                            className="btn btn-danger  btn-sm"
                            disabled={acting === a.id}
                            onClick={() => setActionModal({ isOpen: true, app: a, action: "reject", remarks: "" })}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {actionModal.isOpen && actionModal.app && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', borderBottom: '1px solid var(--clr-border)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: actionModal.action === "approve" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", 
                  color: actionModal.action === "approve" ? "var(--clr-success)" : "var(--clr-danger)",
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {actionModal.action === "approve" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-text-primary)', lineHeight: 1.2 }}>
                    {actionModal.action === "approve" ? "Approve Leave" : "Reject Leave"}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-muted)', lineHeight: 1.2 }}>
                    Review and confirm this leave request
                  </p>
                </div>
              </div>
              <button className="btn-close" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => setActionModal({ isOpen: false, app: null, action: null, remarks: "" })}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitAction}>
              <div style={{ padding: '12px 16px' }}>
                
                <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Leave Request Summary
                </h4>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--clr-text-primary)' }}>{actionModal.app.employee_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Emp Code: {actionModal.app.employee_code}</div>
                    </div>
                  </div>

                  {/* 4 Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div>
                      <Calendar size={16} color="#0ea5e9" style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{actionModal.app.leave_type}</div>
                    </div>
                    <div>
                      <Calendar size={16} color="#0ea5e9" style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>
                        {format(new Date(actionModal.app.start_date), "dd MMM")} - {format(new Date(actionModal.app.end_date), "dd MMM yy")}
                      </div>
                    </div>
                    <div>
                      <Clock size={16} color="#0ea5e9" style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Days</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{actionModal.app.total_days} Days</div>
                    </div>
                    <div>
                      <FileText size={16} color="#0ea5e9" style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied On</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>
                        {actionModal.app.created_at ? format(new Date(actionModal.app.created_at), "dd MMM yy") : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Employee Reason */}
                  {actionModal.app.reason && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Reason for Leave</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-primary)', fontStyle: 'italic', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #0ea5e9' }}>
                        "{actionModal.app.reason}"
                      </div>
                    </div>
                  )}
                </div>

                <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Remarks (Optional)
                </h4>
                <textarea 
                  style={{ width: '100%', border: '1px solid #bae6fd', borderRadius: '6px', padding: '10px', outline: 'none', resize: 'none', fontSize: '0.85rem', color: 'var(--clr-text-primary)', background: '#fff' }}
                  rows="2"
                  placeholder="Add an optional note for the employee..."
                  value={actionModal.remarks}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setActionModal({ ...actionModal, remarks: e.target.value });
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.65rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                  {actionModal.remarks.length}/500
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '10px 16px', borderTop: '1px solid var(--clr-border)', background: '#fff' }}>
                <button type="button" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b' }} onClick={() => setActionModal({ isOpen: false, app: null, action: null, remarks: "" })}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className={`btn ${actionModal.action === "approve" ? "btn-success" : "btn-danger"} btn-sm`} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px' }}>
                  {actionModal.action === "approve" ? <Check size={14} /> : <X size={14} />} 
                  {actionModal.action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
