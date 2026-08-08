import React, { useEffect, useState } from "react";
import { payrollApi } from "../../api";
import toast from "react-hot-toast";

export default function EssLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    principal_amount: "",
    term_months: "",
    reason: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getLoans();
      setLoans(data);
    } catch {
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!formData.principal_amount || !formData.term_months)
      return toast.error("Amount and Term are required");
    try {
      await payrollApi.requestLoan({
        principal_amount: parseFloat(formData.principal_amount),
        term_months: parseInt(formData.term_months),
        reason: formData.reason,
      });
      toast.success("Loan requested successfully");
      setFormData({ principal_amount: "", term_months: "", reason: "" });
      load();
    } catch {
      toast.error("Failed to request loan");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Loans</h1>
          <p>Request new loans and view approval/repayment status</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "var(--sp-lg)",
          alignItems: "start",
        }}
      >
        <div className="card">
          {loading ? (
            <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
              <span className="spinner" />
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Principal</th>
                  <th>Interest Rate</th>
                  <th>Term</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td>{l.request_date?.split("T")[0]}</td>
                    <td>₹ {l.principal_amount}</td>
                    <td>{l.interest_rate} %</td>
                    <td>{l.term_months} Months</td>
                    <td>
                      <span
                        className={`badge ${l.status === "Requested" ? "badge-amber" : l.status === "Approved" ? "badge-green" : "badge-gray"}`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      You have no loan requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: "var(--sp-md)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-md)" }}>
            Request a Loan
          </h3>
          <form
            onSubmit={handleRequest}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.principal_amount}
                onChange={(e) =>
                  setFormData({ ...formData, principal_amount: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Repayment Term (Months) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.term_months}
                onChange={(e) =>
                  setFormData({ ...formData, term_months: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Reason *</label>
              <textarea
                className="form-control"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              />
            </div>

            <div
              style={{
                marginTop: "var(--sp-sm)",
                padding: "var(--sp-sm)",
                background: "var(--clr-bg-alt)",
                borderRadius: "var(--r-md)",
              }}
            >
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                <em>
                  Note: Interest rate and final EMI calculation will be
                  determined by HR upon approval.
                </em>
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "var(--sp-sm)" }}
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
