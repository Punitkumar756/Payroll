import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../../api";
import toast from "react-hot-toast";

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

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Correction Requests</h1>
          <p>Review and approve employee attendance corrections</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
            <span className="spinner" /> Loading...
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Date</th>
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
                  <td>{r.id}</td>
                  <td>
                    {r.employee_name} ({r.employee_code})
                  </td>
                  <td>{r.attendance_date}</td>
                  <td>{r.requested_check_in || "-"}</td>
                  <td>{r.requested_check_out || "-"}</td>
                  <td>{r.reason}</td>
                  <td>
                    <span
                      className={`badge ${r.status === "Pending" ? "badge-amber" : r.status === "Approved" ? "badge-green" : "badge-gray"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "Pending" && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => handleApprove(r.id)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No correction requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
