import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../api";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function EssAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = async () => {
    setLoading(true);
    try {
      const [year, monthNum] = month.split("-");
      // For simplicity, passing from_date and to_date spanning the month
      const from_date = `${year}-${monthNum}-01`;
      const to_date = `${year}-${monthNum}-31`; // backend should handle this safely
      const data = await attendanceApi.getSelf({ from_date, to_date });
      setAttendance(data);
    } catch {
      toast.error("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  const handleRequestCorrection = async (date) => {
    const inTime = prompt("Requested Check In (HH:MM):");
    if (inTime === null) return;
    const outTime = prompt("Requested Check Out (HH:MM):");
    if (outTime === null) return;
    const reason = prompt("Reason for correction:");
    if (!reason) return toast.error("Reason is required");

    try {
      await attendanceApi.requestCorrection({
        attendance_date: date,
        requested_check_in: inTime || undefined,
        requested_check_out: outTime || undefined,
        reason,
      });
      toast.success("Correction requested. HR will review it.");
    } catch {
      toast.error("Failed to submit request");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Attendance</h1>
          <p>
            View your daily check-ins, status, and request corrections if needed
          </p>
        </div>
        <div>
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
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
                <th>Date</th>
                <th>Shift</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Late / Early</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.attendance_date?.split("T")[0]}>
                  <td>{a.attendance_date?.split("T")[0]}</td>
                  <td>{a.shift_name || "-"}</td>
                  <td>{a.check_in ? format(new Date(a.check_in), "hh:mm a") : "-"}</td>
                  <td>{a.check_out ? format(new Date(a.check_out), "hh:mm a") : "-"}</td>
                  <td>
                    {(() => {
                      if (a.check_in) {
                        const inTime = new Date(a.check_in);
                        let outTime = a.check_out ? new Date(a.check_out) : null;
                        if (!outTime) {
                          const inDate = format(inTime, "yyyy-MM-dd");
                          const today = format(new Date(), "yyyy-MM-dd");
                          if (inDate === today) {
                            outTime = new Date();
                          }
                        }
                        if (outTime) {
                          let diff = outTime - inTime;
                          if (diff < 0) {
                            outTime = new Date(outTime.getTime() + 24 * 3600000);
                            diff = outTime - inTime;
                          }
                          if (diff >= 0) {
                            const hrs = Math.floor(diff / 3600000);
                            const mins = Math.floor((diff % 3600000) / 60000);
                            return `${hrs}h ${mins}m`;
                          }
                        }
                      }
                      return "-";
                    })()}
                  </td>
                  <td>
                    {a.is_late ? (
                      <span
                        className="badge badge-amber"
                        style={{ marginRight: 4 }}
                      >
                        Late
                      </span>
                    ) : null}
                    {a.is_early_left ? (
                      <span className="badge badge-amber">Early</span>
                    ) : null}
                    {!a.is_late && !a.is_early_left ? "-" : null}
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.day_status}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                      onClick={() =>
                        handleRequestCorrection(
                          a.attendance_date?.split("T")[0],
                        )
                      }
                    >
                      Request Correction
                    </button>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No attendance records found for this month.
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
