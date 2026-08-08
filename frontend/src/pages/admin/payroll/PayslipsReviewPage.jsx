import React, { useEffect, useState } from "react";
import { payrollApi } from "../../../api";
import toast from "react-hot-toast";

export default function PayslipsReviewPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const [filter, setFilter] = useState({
    year: new Date().getFullYear().toString(),
    period: String(new Date().getMonth() + 1).padStart(2, "0"), // 01 to 12
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.listPayslipsHR({
        year: filter.year,
        period: filter.period,
      });
      setPayslips(data);
    } catch {
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter.year, filter.period]);

  const handleApproveAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to approve all these payslips? They will become visible to employees and cannot be edited.",
      )
    )
      return;
    setApproving(true);
    try {
      await payrollApi.approvePayslips({
        year: filter.year,
        period: filter.period,
      });
      toast.success("Payslips approved successfully");
      load();
    } catch {
      toast.error("Failed to approve payslips");
    } finally {
      setApproving(false);
    }
  };

  const hasDrafts = payslips.some((p) => p.status === "Draft");

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Payslips Review</h1>
          <p>Review draft payslips before final approval</p>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-md)" }}>
          <select
            className="form-control"
            value={filter.year}
            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
          <select
            className="form-control"
            value={filter.period}
            onChange={(e) => setFilter({ ...filter, period: e.target.value })}
          >
            {Array.from({ length: 12 }, (_, i) =>
              String(i + 1).padStart(2, "0"),
            ).map((m) => (
              <option key={m} value={m}>
                Month {m}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            disabled={!hasDrafts || approving}
            onClick={handleApproveAll}
          >
            {approving ? "Approving..." : "Approve All Drafts"}
          </button>
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
                <th>Employee</th>
                <th>Period</th>
                <th>Total Earnings</th>
                <th>Total Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.employee_name} ({p.employee_code})
                  </td>
                  <td>
                    {p.year}-{p.period}
                  </td>
                  <td>₹ {p.total_earnings}</td>
                  <td>₹ {p.total_deductions}</td>
                  <td style={{ fontWeight: 600 }}>₹ {p.net_pay}</td>
                  <td>
                    <span
                      className={`badge ${p.status === "Draft" ? "badge-amber" : "badge-green"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payslips.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No payslips found for this period. Run payroll first.
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
