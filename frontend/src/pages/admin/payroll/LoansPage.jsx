import React, { useEffect, useState } from "react";
import { payrollApi } from "../../../api";
import toast from "react-hot-toast";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.listLoansHR();
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

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Approve this loan request? It will automatically generate the repayment schedule.",
      )
    )
      return;
    try {
      await payrollApi.approveLoan(id);
      toast.success("Loan approved");
      load();
    } catch {
      toast.error("Failed to approve loan");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Loan Requests</h1>
          <p>Review and approve employee loan requests</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
            <span className="spinner" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Employee</th>
                <th>Principal Amount</th>
                <th>Interest %</th>
                <th>Term (Months)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.request_date?.split("T")[0]}</td>
                  <td>
                    {l.employee_name} ({l.employee_code})
                  </td>
                  <td>₹ {l.principal_amount}</td>
                  <td>{l.interest_rate} %</td>
                  <td>{l.term_months}</td>
                  <td>
                    <span
                      className={`badge ${l.status === "Requested" ? "badge-amber" : l.status === "Approved" ? "badge-green" : "badge-gray"}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.status === "Requested" && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => handleApprove(l.id)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No loan requests found.
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
