import React, { useEffect, useState } from "react";
import { payrollApi } from "../../api";
import toast from "react-hot-toast";

export default function EssPayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getPayslips();
      setPayslips(data);
    } catch {
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async (id) => {
    try {
      const blob = await payrollApi.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Payslips</h1>
          <p>View and download your monthly salary slips</p>
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
                <th>Period</th>
                <th>Total Earnings</th>
                <th>Total Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.year} - Month {p.period}
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
                  <td>
                    {p.status === "Approved" ? (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => handleDownload(p.id)}
                      >
                        Download PDF
                      </button>
                    ) : (
                      <span className="text-muted text-sm">Not finalized</span>
                    )}
                  </td>
                </tr>
              ))}
              {payslips.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No payslips available.
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
