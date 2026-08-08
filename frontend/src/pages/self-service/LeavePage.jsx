import { useEffect, useState } from "react";
import { leaveApi } from "../../api";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function EssLeavePage() {
  const [balances, setBalances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState("balance");
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    leaveApi
      .getBalance()
      .then(setBalances)
      .catch(() => {});
    leaveApi
      .getApplications()
      .then(setApplications)
      .catch(() => {});
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveApi.apply(form);
      toast.success("Leave application submitted!");
      setTab("history");
      setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
      leaveApi.getApplications().then(setApplications);
      leaveApi.getBalance().then(setBalances);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this leave application?")) return;
    try {
      await leaveApi.cancel(id);
      toast.success("Application cancelled");
      leaveApi.getApplications().then(setApplications);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
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
          <h1>Leave</h1>
          <p>Manage your leave applications and check balances</p>
        </div>
      </div>

      <div className="tabs">
        <button
          id="tab-balance"
          className={`tab ${tab === "balance" ? "active" : ""}`}
          onClick={() => setTab("balance")}
        >
          Balance
        </button>
        <button
          id="tab-apply"
          className={`tab ${tab === "apply" ? "active" : ""}`}
          onClick={() => setTab("apply")}
        >
          Apply
        </button>
        <button
          id="tab-history"
          className={`tab ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          History
        </button>
      </div>

      {/* Balance */}
      {tab === "balance" && (
        <div
          className="animate-slide"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: "var(--sp-md)",
          }}
        >
          {balances.map((b) => (
            <div key={b.leave_type_id} className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--clr-text-muted)",
                    marginBottom: "var(--sp-sm)",
                    fontWeight: 600,
                  }}
                >
                  {b.name}
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    fontFamily: "Outfit",
                    color: "var(--clr-primary-light)",
                  }}
                >
                  {b.available_balance}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--clr-text-muted)",
                    marginTop: "var(--sp-xs)",
                  }}
                >
                  days available
                </div>
                <div
                  style={{
                    marginTop: "var(--sp-sm)",
                    fontSize: "0.78rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                  }}
                >
                  <div>
                    Accrued: <strong>{b.accrued}</strong>
                  </div>
                  <div>
                    Used: <strong>{b.used}</strong>
                  </div>
                </div>
                <div
                  className={`badge ${b.is_paid ? "badge-green" : "badge-amber"}`}
                  style={{ marginTop: "var(--sp-sm)" }}
                >
                  {b.is_paid ? "Paid" : "Unpaid"}
                </div>
              </div>
            </div>
          ))}
          {balances.length === 0 && (
            <p className="text-muted">No leave balance assigned. Contact HR.</p>
          )}
        </div>
      )}

      {/* Apply */}
      {tab === "apply" && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header">
            <span className="card-title">New Leave Application</span>
          </div>
          <form onSubmit={handleApply} id="leave-apply-form">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select
                  id="apply-type"
                  className="form-select"
                  value={form.leave_type_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leave_type_id: e.target.value }))
                  }
                  required
                >
                  <option value="">Select leave type...</option>
                  {balances.map((b) => (
                    <option key={b.leave_type_id} value={b.leave_type_id}>
                      {b.name} ({b.available_balance} days available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">From Date *</label>
                  <input
                    id="apply-from"
                    type="date"
                    className="form-input"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date *</label>
                  <input
                    id="apply-to"
                    type="date"
                    className="form-input"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  id="apply-reason"
                  className="form-textarea"
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  placeholder="Reason for leave..."
                />
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ padding: "var(--sp-md) var(--sp-lg)" }}
            >
              <button
                type="submit"
                id="btn-submit-leave"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "✓ Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="card">
          <div
            className="table-wrapper"
            style={{ border: "none", borderRadius: 0 }}
          >
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No leave applications found.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id}>
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
                      <td
                        style={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.reason || "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${statusColor[a.status] || "badge-gray"}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {a.status === "Pending" && (
                          <button
                            id={`btn-cancel-leave-${a.id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(a.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
