import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../../api";
import toast from "react-hot-toast";
import { UserCog, Check, X, Clock, HelpCircle } from "lucide-react";

export default function CorrectionRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.listCorrections();
      setRequests(data);
    } catch {
      toast.error("Failed to load correction requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    const remarks = prompt("Enter approval remarks (optional):");
    if (remarks === null) return; // User cancelled
    try {
      await attendanceApi.approveCorrection(id, { remarks });
      toast.success("Correction request approved");
      load();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  // Note: If you have a reject endpoint, you would add a handleReject function here.
  // We'll add a visual reject button as a placeholder/enhancement.

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon indigo" style={{ width: 42, height: 42 }}>
              <UserCog size={22} />
            </div>
            <div>
              <h1>Correction Requests</h1>
              <p>Review and resolve employee attendance dispute requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--clr-bg-input)' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} className="text-primary" />
            Pending & Resolved Requests
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "var(--sp-2xl)", textAlign: "center", color: 'var(--clr-text-muted)' }}>
            <span className="spinner" style={{ display: 'inline-block', marginBottom: 12 }} />
            <p>Loading correction requests...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Target Date</th>
                  <th>Requested In</th>
                  <th>Requested Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--clr-text-muted)' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--clr-text-primary)' }}>{r.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Code: {r.employee_code}</div>
                    </td>
                    <td>{new Date(r.attendance_date).toLocaleDateString()}</td>
                    <td>
                      {r.requested_check_in ? (
                        <div className="badge badge-indigo">
                          <Clock size={12} /> {r.requested_check_in}
                        </div>
                      ) : "-"}
                    </td>
                    <td>
                      {r.requested_check_out ? (
                        <div className="badge badge-indigo">
                          <Clock size={12} /> {r.requested_check_out}
                        </div>
                      ) : "-"}
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>
                      {r.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${r.status === "Pending" ? "badge-amber" : r.status === "Approved" ? "badge-green" : "badge-red"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "Pending" ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-success btn-icon"
                            title="Approve Request"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "var(--sp-2xl)", color: "var(--clr-text-muted)" }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(148, 163, 184, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={32} style={{ color: 'var(--clr-text-muted)', opacity: 0.5 }} />
                        </div>
                        <p>No correction requests found. Everything is up to date!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
