import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { calendarsApi } from "../../../api";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";

export default function CalendarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [weeklyOffs, setWeeklyOffs] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [activeTab, setActiveTab] = useState("year");
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cal, hols, woffs, ovrs] = await Promise.all([
        calendarsApi.get(id),
        calendarsApi.getHolidays(id),
        calendarsApi.getWeeklyOffs(id),
        calendarsApi.getOverrides(id),
      ]);
      setCalendar(cal);
      setHolidays(hols);
      setWeeklyOffs(woffs);
      setOverrides(ovrs);
    } catch {
      toast.error("Failed to load calendar details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading...</div>;
  if (!calendar) return <div style={{ padding: "3rem", textAlign: "center" }}>Calendar not found</div>;

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button className="btn" onClick={() => navigate("/admin/calendars")} style={{ padding: "0.5rem" }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{calendar.calendar_name}</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: 0 }}>
            {calendar.calendar_code} | Year: {calendar.year} | {calendar.location_name || "All Locations"}
          </p>
        </div>
      </div>

      <div className="tabs" style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--clr-border)", marginBottom: "2rem" }}>
        {["year", "weekly-offs", "holidays", "overrides"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid var(--clr-primary)" : "2px solid transparent",
              color: activeTab === tab ? "var(--clr-primary)" : "var(--clr-text-muted)",
              fontWeight: activeTab === tab ? 600 : 400,
              textTransform: "capitalize"
            }}
          >
            {tab.replace("-", " ")}
          </div>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "year" && (
          <YearView calendar={calendar} holidays={holidays} weeklyOffs={weeklyOffs} overrides={overrides} />
        )}
        {activeTab === "weekly-offs" && (
          <WeeklyOffsTab calendarId={id} initialData={weeklyOffs} onUpdate={loadAll} />
        )}
        {activeTab === "holidays" && (
          <HolidaysTab calendarId={id} holidays={holidays} onUpdate={loadAll} />
        )}
        {activeTab === "overrides" && (
          <OverridesTab calendarId={id} overrides={overrides} onUpdate={loadAll} />
        )}
      </div>
    </div>
  );
}

// ── Year View Component ───────────────────────────────────────
function YearView({ calendar, holidays, weeklyOffs, overrides }) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const year = calendar.year;

  // Simple day status evaluation
  const getDayStatus = (dateObj) => {
    const dStr = dateObj.toISOString().split("T")[0];
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dateObj.getDay()];
    
    // 1. Check override
    const ovr = overrides.find(o => o.date.split("T")[0] === dStr);
    if (ovr) return ovr.override_status;

    // 2. Check holiday
    const hol = holidays.find(h => h.holiday_date.split("T")[0] === dStr);
    if (hol) return hol.is_optional ? "OPTIONAL_HOLIDAY" : "HOLIDAY";

    // 3. Check weekly off
    // We check if this dayOfWeek matches a weekly off rule
    const weekOffRule = weeklyOffs.find(w => w.day_of_week === dayOfWeek);
    if (weekOffRule) {
      // Simplistic check: If EVERY, it's a weekly off. 
      // If 1ST, 2ND, etc., we would need to calculate the week number of this month.
      // For visual purposes, we'll assume EVERY matches.
      if (weekOffRule.week_pattern === "EVERY") return "WEEKLY_OFF";
      
      // Calculate week of month
      const date = dateObj.getDate();
      const weekOfMonth = Math.ceil(date / 7);
      if (weekOffRule.week_pattern === "1ST" && weekOfMonth === 1) return "WEEKLY_OFF";
      if (weekOffRule.week_pattern === "2ND" && weekOfMonth === 2) return "WEEKLY_OFF";
      if (weekOffRule.week_pattern === "3RD" && weekOfMonth === 3) return "WEEKLY_OFF";
      if (weekOffRule.week_pattern === "4TH" && weekOfMonth === 4) return "WEEKLY_OFF";
      if (weekOffRule.week_pattern === "5TH" && weekOfMonth === 5) return "WEEKLY_OFF";
      if (weekOffRule.week_pattern === "ALTERNATE" && weekOfMonth % 2 === 0) return "WEEKLY_OFF";
    }

    return "WORKING_DAY";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WORKING_DAY": return "transparent";
      case "WEEKLY_OFF": return "rgba(59, 130, 246, 0.15)"; // Blue tinted
      case "HOLIDAY": return "rgba(239, 68, 68, 0.15)"; // Red tinted
      case "OPTIONAL_HOLIDAY": return "rgba(234, 179, 8, 0.15)"; // Yellow tinted
      default: return "transparent";
    }
  };
  
  const getStatusBorder = (status) => {
    switch (status) {
      case "WEEKLY_OFF": return "1px solid var(--clr-primary)";
      case "HOLIDAY": return "1px solid var(--clr-danger)";
      case "OPTIONAL_HOLIDAY": return "1px solid var(--clr-warning)";
      default: return "1px solid var(--clr-border)";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "16px", height: "16px", background: "transparent", border: "1px solid var(--clr-border)" }}></div> Working Day</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "16px", height: "16px", background: getStatusColor("WEEKLY_OFF"), border: getStatusBorder("WEEKLY_OFF") }}></div> Weekly Off</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "16px", height: "16px", background: getStatusColor("HOLIDAY"), border: getStatusBorder("HOLIDAY") }}></div> Holiday</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "16px", height: "16px", background: getStatusColor("OPTIONAL_HOLIDAY"), border: getStatusBorder("OPTIONAL_HOLIDAY") }}></div> Optional Holiday</div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {months.map(m => {
          const date = new Date(year, m, 1);
          const monthName = date.toLocaleString('default', { month: 'long' });
          const daysInMonth = new Date(year, m + 1, 0).getDate();
          const firstDay = date.getDay(); // 0 is Sunday
          
          // Generate days array
          const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => null);
          const days = Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(year, m, i + 1);
            // using local time string to prevent UTC shift
            const dObj = new Date(d.getTime() - d.getTimezoneOffset() * 60000); 
            return dObj;
          });
          
          return (
            <div key={m} className="card" style={{ padding: "1rem" }}>
              <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>{monthName}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", fontSize: "0.8rem", fontWeight: 600, color: "var(--clr-text-muted)", marginBottom: "0.5rem" }}>
                <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {blanks.map((_, i) => <div key={`b${i}`}></div>)}
                {days.map(dObj => {
                  const status = getDayStatus(dObj);
                  return (
                    <div 
                      key={dObj.getDate()} 
                      style={{
                        padding: "0.5rem 0",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        borderRadius: "4px",
                        background: getStatusColor(status),
                        border: getStatusBorder(status),
                        cursor: "default"
                      }}
                      title={status}
                    >
                      {dObj.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weekly Offs Component ─────────────────────────────────────
function WeeklyOffsTab({ calendarId, initialData, onUpdate }) {
  const [offs, setOffs] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const patterns = ["EVERY", "1ST", "2ND", "3RD", "4TH", "5TH", "ALTERNATE"];

  const handleAdd = () => setOffs([...offs, { day_of_week: "Sunday", week_pattern: "EVERY" }]);
  const handleRemove = (idx) => setOffs(offs.filter((_, i) => i !== idx));
  const handleChange = (idx, field, val) => {
    const newOffs = [...offs];
    newOffs[idx][field] = val;
    setOffs(newOffs);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await calendarsApi.updateWeeklyOffs(calendarId, { weekly_offs: offs });
      toast.success("Weekly offs saved");
      onUpdate();
    } catch {
      toast.error("Failed to save weekly offs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0 }}>Weekly Off Configuration</h3>
        <button className="btn btn-outline" onClick={handleAdd}><Plus size={16} /> Add Rule</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {offs.map((off, idx) => (
          <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select className="form-input" style={{ width: "200px" }} value={off.day_of_week} onChange={(e) => handleChange(idx, "day_of_week", e.target.value)}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="form-input" style={{ width: "200px" }} value={off.week_pattern} onChange={(e) => handleChange(idx, "week_pattern", e.target.value)}>
              {patterns.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="btn btn-danger" onClick={() => handleRemove(idx)} style={{ padding: "0.5rem" }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {offs.length === 0 && <div style={{ color: "var(--clr-text-muted)" }}>No weekly offs configured. Employees work all days.</div>}
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : <><Save size={18} /> Save Weekly Offs</>}
      </button>
    </div>
  );
}

// ── Holidays Component ────────────────────────────────────────
function HolidaysTab({ calendarId, holidays, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ holiday_date: "", holiday_name: "", holiday_type: "National", is_optional: false, description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await calendarsApi.upsertHoliday(calendarId, formData);
      toast.success("Holiday saved");
      setShowForm(false);
      setFormData({ holiday_date: "", holiday_name: "", holiday_type: "National", is_optional: false, description: "" });
      onUpdate();
    } catch {
      toast.error("Failed to save holiday");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await calendarsApi.removeHoliday(calendarId, id);
      toast.success("Holiday removed");
      onUpdate();
    } catch {
      toast.error("Failed to delete holiday");
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
      <div className="card" style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Holidays List</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Holiday</button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Type</th>
                <th>Optional?</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.holiday_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{h.holiday_name}</td>
                  <td><span className="badge badge-gray">{h.holiday_type}</span></td>
                  <td>{h.is_optional ? "Yes" : "No"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn" onClick={() => handleDelete(h.id)} style={{ padding: "0.4rem", color: "var(--clr-danger)" }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>No holidays defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ width: "350px", position: "sticky", top: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Add Holiday</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label>Holiday Date *</label>
              <input type="date" required className="form-input" value={formData.holiday_date} onChange={e => setFormData({...formData, holiday_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Holiday Name *</label>
              <input type="text" required className="form-input" value={formData.holiday_name} onChange={e => setFormData({...formData, holiday_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-input" value={formData.holiday_type} onChange={e => setFormData({...formData, holiday_type: e.target.value})}>
                <option>National</option>
                <option>Festival</option>
                <option>Regional</option>
                <option>Company</option>
                <option>Other</option>
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={formData.is_optional} onChange={e => setFormData({...formData, is_optional: e.target.checked})} />
              Is Optional Holiday?
            </label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Overrides Component ───────────────────────────────────────
function OverridesTab({ calendarId, overrides, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: "", override_status: "WORKING_DAY", reason: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await calendarsApi.upsertOverride(calendarId, formData);
      toast.success("Override saved");
      setShowForm(false);
      setFormData({ date: "", override_status: "WORKING_DAY", reason: "" });
      onUpdate();
    } catch {
      toast.error("Failed to save override");
    }
  };

  const handleDelete = async (dateStr) => {
    if (!window.confirm("Remove this override?")) return;
    try {
      // Need to format date properly for API call URL
      const d = new Date(dateStr).toISOString().split("T")[0];
      await calendarsApi.removeOverride(calendarId, d);
      toast.success("Override removed");
      onUpdate();
    } catch {
      toast.error("Failed to remove override");
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
      <div className="card" style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Special Working Days / Overrides</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Override</button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Override Status</th>
                <th>Reason</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map(o => (
                <tr key={o.id}>
                  <td>{new Date(o.date).toLocaleDateString()}</td>
                  <td><span className="badge badge-primary">{o.override_status}</span></td>
                  <td>{o.reason}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn" onClick={() => handleDelete(o.date)} style={{ padding: "0.4rem", color: "var(--clr-danger)" }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {overrides.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>No overrides defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ width: "350px", position: "sticky", top: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Add Override</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" required className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>New Status *</label>
              <select className="form-input" value={formData.override_status} onChange={e => setFormData({...formData, override_status: e.target.value})}>
                <option value="WORKING_DAY">Working Day</option>
                <option value="WEEKLY_OFF">Weekly Off</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="OPTIONAL_HOLIDAY">Optional Holiday</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reason *</label>
              <textarea required className="form-input" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
