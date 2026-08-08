import { useEffect, useState } from "react";
import { payrollApi } from "../../api";
import toast from "react-hot-toast";

export default function EssPayslipPage() {
  const [payslips, setPayslips] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    payrollApi
      .getPayslips()
      .then(setPayslips)
      .catch(() => toast.error("Failed to load payslips"));
  }, []);

  const viewPayslip = async (id) => {
    setSelectedId(id);
    try {
      setLines(await payrollApi.getPayslipLines(id));
    } catch {
      toast.error("Failed to load payslip details");
    }
  };

  const downloadPDF = async (id) => {
    setDownloading(id);
    try {
      const blob = await payrollApi.downloadPayslip(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const earnings = lines.filter((l) => l.head_type === "Earning");
  const deductions = lines.filter((l) => l.head_type !== "Earning");
  const selected = payslips.find((p) => p.id === selectedId);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Payslips</h1>
          <p>View and download your monthly payslips</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "var(--sp-lg)",
        }}
      >
        {/* Payslip list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Payslip History</span>
          </div>
          <div style={{ padding: "var(--sp-sm)" }}>
            {payslips.length === 0 ? (
              <p className="text-muted" style={{ padding: "var(--sp-md)" }}>
                No payslips found.
              </p>
            ) : (
              payslips.map((p) => (
                <div
                  key={p.id}
                  id={`payslip-item-${p.id}`}
                  onClick={() => viewPayslip(p.id)}
                  style={{
                    padding: "var(--sp-md)",
                    borderRadius: "var(--r-md)",
                    cursor: "pointer",
                    background:
                      selectedId === p.id
                        ? "var(--clr-primary-glow)"
                        : "transparent",
                    border: `1px solid ${selectedId === p.id ? "var(--clr-primary)" : "transparent"}`,
                    marginBottom: 4,
                    transition: "all 150ms",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    {months[p.pay_period_month]} {p.pay_period_year}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{ color: "var(--clr-success)", fontWeight: 700 }}
                    >
                      ₹{parseFloat(p.net_pay || 0).toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`badge ${p.status === "Approved" ? "badge-green" : "badge-amber"}`}
                      style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payslip detail */}
        <div className="card">
          {!selectedId ? (
            <div className="empty-state" style={{ padding: "var(--sp-2xl)" }}>
              <div className="empty-state-icon">📄</div>
              <p>Select a payslip to view details</p>
            </div>
          ) : (
            <>
              <div className="card-header">
                <span className="card-title">
                  {months[selected?.pay_period_month]}{" "}
                  {selected?.pay_period_year}
                </span>
                <button
                  id={`btn-download-payslip-${selectedId}`}
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadPDF(selectedId)}
                  disabled={downloading === selectedId}
                >
                  {downloading === selectedId
                    ? "⏳ Downloading..."
                    : "⬇ Download PDF"}
                </button>
              </div>
              <div className="card-body">
                {/* Summary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "var(--sp-md)",
                    marginBottom: "var(--sp-lg)",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--sp-md)",
                      background: "rgba(16,185,129,0.1)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--clr-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      GROSS EARNINGS
                    </div>
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        fontFamily: "Outfit",
                        color: "var(--clr-success)",
                      }}
                    >
                      ₹
                      {parseFloat(selected?.gross_earnings || 0).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--sp-md)",
                      background: "rgba(239,68,68,0.1)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--clr-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      DEDUCTIONS
                    </div>
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        fontFamily: "Outfit",
                        color: "var(--clr-danger)",
                      }}
                    >
                      ₹
                      {parseFloat(
                        selected?.total_deductions || 0,
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--sp-md)",
                      background: "rgba(99,102,241,0.15)",
                      borderRadius: "var(--r-md)",
                      border: "2px solid var(--clr-primary)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--clr-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      NET PAY
                    </div>
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        fontFamily: "Outfit",
                        color: "var(--clr-primary-light)",
                      }}
                    >
                      ₹
                      {parseFloat(selected?.net_pay || 0).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                  </div>
                </div>

                {/* Lines */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--sp-md)",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        marginBottom: "var(--sp-sm)",
                        color: "var(--clr-success)",
                      }}
                    >
                      💚 Earnings
                    </h4>
                    {earnings.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span>{l.head_name || "Earning"}</span>
                        <span style={{ fontWeight: 600 }}>
                          ₹{parseFloat(l.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4
                      style={{
                        marginBottom: "var(--sp-sm)",
                        color: "var(--clr-danger)",
                      }}
                    >
                      🔴 Deductions
                    </h4>
                    {deductions.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span>{l.head_name || "Deduction"}</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--clr-danger)",
                          }}
                        >
                          ₹{parseFloat(l.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    {deductions.length === 0 && (
                      <p className="text-muted">No deductions</p>
                    )}
                  </div>
                </div>

                {/* Days info */}
                <div
                  style={{
                    display: "flex",
                    gap: "var(--sp-md)",
                    marginTop: "var(--sp-lg)",
                    padding: "var(--sp-md)",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--r-md)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--clr-text-muted)",
                      }}
                    >
                      WORKING
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {selected?.working_days} days
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--clr-text-muted)",
                      }}
                    >
                      PAID
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {selected?.paid_days} days
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--clr-text-muted)",
                      }}
                    >
                      LOP
                    </div>
                    <div
                      style={{ fontWeight: 700, color: "var(--clr-danger)" }}
                    >
                      {selected?.lop_days || 0} days
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
