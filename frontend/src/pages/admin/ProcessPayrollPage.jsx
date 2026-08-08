import { useEffect, useState } from "react";
import { payrollApi } from "../../api";
import toast from "react-hot-toast";

export default function ProcessPayrollPage() {
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [running, setRunning] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [approving, setApproving] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const loadPayslips = async () => {
    setLoadingSlips(true);
    try {
      setPayslips(
        await payrollApi.listPayslipsHR({ year: form.year, month: form.month }),
      );
    } catch {
      toast.error("Failed to load payslips");
    } finally {
      setLoadingSlips(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  const runPayroll = async () => {
    if (
      !confirm(
        `Run payroll for ${months[form.month - 1]} ${form.year}? This will generate draft payslips.`,
      )
    )
      return;
    setRunning(true);
    try {
      await payrollApi.runPayroll({ year: form.year, month: form.month });
      toast.success("Payroll run complete! Review draft payslips below.");
      loadPayslips();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Payroll run failed");
    } finally {
      setRunning(false);
    }
  };

  const approveAll = async () => {
    if (
      !confirm(
        `Approve all payslips for ${months[form.month - 1]} ${form.year}? This cannot be undone.`,
      )
    )
      return;
    setApproving(true);
    try {
      await payrollApi.approvePayslips({ year: form.year, month: form.month });
      toast.success("All payslips approved!");
      loadPayslips();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const totalNet = payslips.reduce(
    (s, p) => s + (parseFloat(p.net_pay) || 0),
    0,
  );
  const draftCount = payslips.filter((p) => p.status === "Draft").length;
  const approvedCount = payslips.filter((p) => p.status === "Approved").length;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Process Payroll</h1>
          <p>Generate and approve payslips for a pay period</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: "var(--sp-lg)" }}>
        <div className="card-body">
          <div
            style={{
              display: "flex",
              gap: "var(--sp-md)",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <label className="form-label">Pay Period Year</label>
              <input
                id="payroll-year"
                type="number"
                className="form-input"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: parseInt(e.target.value) }))
                }
              />
            </div>
            <div
              className="form-group"
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <label className="form-label">Month</label>
              <select
                id="payroll-month"
                className="form-select"
                value={form.month}
                onChange={(e) =>
                  setForm((f) => ({ ...f, month: parseInt(e.target.value) }))
                }
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <button
              id="btn-load-payslips"
              className="btn btn-ghost"
              onClick={loadPayslips}
            >
              🔄 Load
            </button>
            <button
              id="btn-run-payroll"
              className="btn btn-primary"
              onClick={runPayroll}
              disabled={running}
            >
              {running ? "Running..." : "▶ Run Payroll"}
            </button>
            {draftCount > 0 && (
              <button
                id="btn-approve-payslips"
                className="btn btn-success"
                onClick={approveAll}
                disabled={approving}
              >
                {approving ? "Approving..." : `✓ Approve All (${draftCount})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {payslips.length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon indigo">📄</div>
            <div>
              <div className="stat-value">{payslips.length}</div>
              <div className="stat-label">Total Payslips</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">📝</div>
            <div>
              <div className="stat-value">{draftCount}</div>
              <div className="stat-label">Draft</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div>
              <div className="stat-value">{approvedCount}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">💰</div>
            <div>
              <div className="stat-value">
                ₹{totalNet.toLocaleString("en-IN")}
              </div>
              <div className="stat-label">Total Net Pay</div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {months[form.month - 1]} {form.year} — Payslips
          </span>
        </div>
        <div
          className="table-wrapper"
          style={{ border: "none", borderRadius: 0 }}
        >
          {loadingSlips ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : payslips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <p>No payslips generated. Run payroll to start.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Working Days</th>
                  <th>Paid Days</th>
                  <th>LOP Days</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id}>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      {p.employee_name}
                    </td>
                    <td>
                      <span className="badge badge-indigo">
                        {p.employee_code}
                      </span>
                    </td>
                    <td>{p.working_days}</td>
                    <td>{p.paid_days}</td>
                    <td
                      style={{
                        color: p.lop_days > 0 ? "var(--clr-danger)" : undefined,
                      }}
                    >
                      {p.lop_days || 0}
                    </td>
                    <td style={{ color: "var(--clr-success)" }}>
                      ₹
                      {parseFloat(p.gross_earnings || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td style={{ color: "var(--clr-danger)" }}>
                      ₹
                      {parseFloat(p.total_deductions || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      ₹{parseFloat(p.net_pay || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`badge ${p.status === "Approved" ? "badge-green" : "badge-amber"}`}
                      >
                        {p.status}
                      </span>
                    </td>
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
