import { useEffect, useState } from "react";
import { leaveApi } from "../../api";
import toast from "react-hot-toast";
import { format } from "date-fns";

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

  const handleAction = async (id, action) => {
    const remarks = action === "reject" ? prompt("Rejection remarks:") : "";
    if (action === "reject" && remarks === null) return;
    setActing(id);
    try {
      if (action === "approve") await leaveApi.approve(id, { remarks });
      else await leaveApi.reject(id, { remarks });
      toast.success(`Leave ${action}d`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    } finally {
      setActing(null);
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
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Balance</th>
                  <th>Status</th>
                  {status === "Pending" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
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
                    <td>{a.current_balance ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${statusColor[a.status] || "badge-gray"}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    {status === "Pending" && (
                      <td>
                        <div style={{ display: "flex", gap: "var(--sp-xs)" }}>
                          <button
                            id={`btn-approve-leave-${a.id}`}
                            className="btn btn-success btn-sm"
                            disabled={acting === a.id}
                            onClick={() => handleAction(a.id, "approve")}
                          >
                            ✓ Approve
                          </button>
                          <button
                            id={`btn-reject-leave-${a.id}`}
                            className="btn btn-danger  btn-sm"
                            disabled={acting === a.id}
                            onClick={() => handleAction(a.id, "reject")}
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
    </div>
  );
}
