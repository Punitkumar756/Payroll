import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { leaveApi, announcementsApi, attendanceApi } from "../../api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

export default function EssDashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [todayAtt, setTodayAtt] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  
  const webcamRef = useRef(null);
  const [punching, setPunching] = useState(false);
  const [punchType, setPunchType] = useState('IN');
  const [cameraError, setCameraError] = useState(false);

  const fetchAttendance = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = format(weekAgo, "yyyy-MM-dd");
    attendanceApi
      .getSelf({ from_date: weekAgoStr, to_date: today })
      .then((d) => {
        setAttendanceHistory(d || []);
        const todayData = (d || []).find((r) => r.date === today);
        setTodayAtt(todayData || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    leaveApi
      .getBalance()
      .then(setBalances)
      .catch(() => {});
    announcementsApi
      .list({ active_only: true })
      .then(setAnnouncements)
      .catch(() => {});
    fetchAttendance();
  }, [fetchAttendance]);

  const handlePunch = useCallback(async (type) => {
    setPunchType(type);
    setPunching(true);
    try {
      if (!webcamRef.current) throw new Error("Camera not ready.");
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Could not capture photo.");
      
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "punch.jpg", { type: "image/jpeg" });

      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, timeout: 10000 
          });
        }
      });

      const { latitude, longitude } = position.coords;

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('lat', latitude);
      formData.append('lng', longitude);
      formData.append('type', type);

      await attendanceApi.punch(formData);
      toast.success(`Successfully punched ${type}`);
      fetchAttendance();
    } catch (err) {
      if (err.code === 1 || err.PERMISSION_DENIED) { 
        toast.error("Location access denied. Please enable GPS.");
      } else {
        toast.error(err?.response?.data?.detail || err.message || "Failed to punch");
      }
    } finally {
      setPunching(false);
    }
  }, [webcamRef, fetchAttendance]);

  const statusMap = {
    Present: "badge-green",
    Absent: "badge-red",
    WeekOff: "badge-gray",
    Holiday: "badge-amber",
    Leave: "badge-indigo",
    HalfDay: "badge-amber",
  };

  return (
    <div className="animate-fade">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <h2>
          Good{" "}
          {new Date().getHours() < 12
            ? "Morning"
            : new Date().getHours() < 17
              ? "Afternoon"
              : "Evening"}
          , {user?.firstName}! 👋
        </h2>
        <p>
          {format(new Date(), "EEEE, dd MMMM yyyy")} • Employee Self-Service
          Portal
        </p>
      </div>

      {/* Today's status */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">📅</div>
          <div>
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>
              {todayAtt ? (
                <span
                  className={`badge ${statusMap[todayAtt.day_status] || "badge-gray"}`}
                >
                  {todayAtt.day_status}
                </span>
              ) : (
                "—"
              )}
            </div>
            <div className="stat-label">Today's Status</div>
            {todayAtt?.check_in && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--clr-text-muted)",
                  marginTop: 2,
                }}
              >
                In: {format(new Date(todayAtt.check_in), "hh:mm a")}
              </div>
            )}
          </div>
        </div>
        {balances.slice(0, 3).map((b) => (
          <div key={b.leave_type_id} className="stat-card">
            <div className="stat-icon green">🌴</div>
            <div>
              <div className="stat-value">{b.available_balance}</div>
              <div className="stat-label">{b.name} Balance</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--sp-lg)",
        }}
      >
        {/* Live Punch */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📸 Live Punch</span>
          </div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            {cameraError ? (
              <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', color: 'var(--clr-danger)', borderRadius: 8 }}>
                Camera access denied or unavailable. Please enable camera permissions to punch in.
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', borderRadius: 8, overflow: 'hidden', border: '2px solid var(--clr-border)', position: 'relative' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  onUserMediaError={() => setCameraError(true)}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                {punching && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    Punching {punchType}...
                  </div>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--clr-success)', borderColor: 'var(--clr-success)' }}
                onClick={() => handlePunch('IN')}
                disabled={punching || cameraError || (todayAtt && todayAtt.check_in && !todayAtt.check_out)}
              >
                PUNCH IN
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--clr-danger)', borderColor: 'var(--clr-danger)' }}
                onClick={() => handlePunch('OUT')}
                disabled={punching || cameraError || !todayAtt?.check_in || todayAtt?.check_out}
              >
                PUNCH OUT
              </button>
            </div>
            {(todayAtt?.check_in || todayAtt?.check_out) && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                {todayAtt.check_in && <div>Punched In: {format(new Date(todayAtt.check_in), "hh:mm a")}</div>}
                {todayAtt.check_out && <div>Punched Out: {format(new Date(todayAtt.check_out), "hh:mm a")}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🕒 Recent Attendance</span>
          </div>
          <div className="card-body" style={{ maxHeight: 280, overflowY: "auto" }}>
            {attendanceHistory.length === 0 ? (
              <p className="text-muted">No recent attendance records.</p>
            ) : (
              attendanceHistory.slice(0, 5).map((record) => (
                <div
                  key={record.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--sp-md)",
                    paddingBottom: "var(--sp-md)",
                    borderBottom: "1px solid var(--clr-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--clr-text-primary)" }}>
                      {format(new Date(record.date), "EEE, MMM dd")}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginTop: 4 }}>
                      In: {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "—"} • Out: {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "—"}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${statusMap[record.day_status] || "badge-gray"}`}>
                      {record.day_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌴 Leave Balance</span>
          </div>
          <div className="card-body">
            {balances.length === 0 ? (
              <p className="text-muted">No leave balance data.</p>
            ) : (
              balances.map((b) => (
                <div
                  key={b.leave_type_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--sp-sm)",
                  }}
                >
                  <span style={{ fontSize: "0.875rem" }}>{b.name}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-sm)",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 6,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min((b.available_balance / (b.accrued + b.opening_balance || 1)) * 100, 100)}%`,
                          background: "var(--clr-success)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--clr-text-primary)",
                        minWidth: 24,
                        textAlign: "right",
                      }}
                    >
                      {b.available_balance}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📢 Announcements</span>
          </div>
          <div
            className="card-body"
            style={{ maxHeight: 280, overflowY: "auto" }}
          >
            {announcements.length === 0 ? (
              <p className="text-muted">No active announcements.</p>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    marginBottom: "var(--sp-md)",
                    paddingBottom: "var(--sp-md)",
                    borderBottom: "1px solid var(--clr-border)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--clr-text-primary)",
                      marginBottom: 4,
                    }}
                  >
                    {a.heading}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--clr-text-muted)",
                    }}
                  >
                    {a.type} · {a.display_start}
                  </div>
                  {a.content && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        marginTop: 4,
                        color: "var(--clr-text-secondary)",
                      }}
                    >
                      {a.content}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
