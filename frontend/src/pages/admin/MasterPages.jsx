import React, { useState, useEffect } from "react";
import MasterPage from "../../components/MasterPage";
import {
  locationsApi,
  departmentsApi,
  designationsApi,
  categoriesApi,
  groupsApi,
  subGroupsApi,
  announcementsApi,
  holidaysApi,
  calendarsApi,
} from "../../api";
import toast from "react-hot-toast";

// ── Locations ─────────────────────────────────────────────────
export function LocationsPage() {
  return (
    <MasterPage
      title="Locations"
      description="Manage office locations for Dayton Natural Resource Pvt Ltd"
      api={locationsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "website", label: "Website" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "address", label: "Address", type: "textarea" },
        { key: "phone", label: "Phone" },
        { key: "fax", label: "Fax" },
        { key: "website", label: "Website", type: "url" },
      ]}
    />
  );
}

// ── Departments ───────────────────────────────────────────────
export function DepartmentsPage() {
  return (
    <MasterPage
      title="Departments"
      description="Manage company departments"
      api={departmentsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Designations ──────────────────────────────────────────────
export function DesignationsPage() {
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    locationsApi
      .list({ status: "Active" })
      .then(setLocations)
      .catch(console.error);
    departmentsApi
      .list({ status: "Active" })
      .then(setDepartments)
      .catch(console.error);
  }, []);

  return (
    <MasterPage
      title="Designations"
      description="Manage job designations"
      api={designationsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "location_name", label: "Location" },
        { key: "department_name", label: "Department" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        {
          key: "location_id",
          label: "Location",
          type: "select",
          options: locations.map((l) => ({ value: l.id, label: l.name })),
        },
        {
          key: "department_id",
          label: "Department",
          type: "select",
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
      ]}
    />
  );
}

// ── Categories ────────────────────────────────────────────────
export function CategoriesPage() {
  return (
    <MasterPage
      title="Categories"
      description="Manage employee categories"
      api={categoriesApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Groups ────────────────────────────────────────────────────
export function GroupsPage() {
  return (
    <MasterPage
      title="Groups"
      description="Manage employee groups"
      api={groupsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Sub Groups ────────────────────────────────────────────────
export function SubGroupsPage() {
  return (
    <MasterPage
      title="Sub Groups"
      description="Manage employee sub-groups"
      api={subGroupsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "group_name", label: "Group" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "group_id", label: "Group ID", type: "number", required: true },
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}



// ── Announcements ─────────────────────────────────────────────
export function AnnouncementsPage() {
  return (
    <MasterPage
      title="Announcements"
      description="Manage organization announcements and news"
      api={announcementsApi}
      columns={[
        { key: "heading", label: "Heading" },
        { key: "type", label: "Type" },
        { key: "display_start", label: "Start Date" },
        { key: "display_end", label: "End Date" },
      ]}
      fields={[
        { key: "heading", label: "Heading", required: true },
        {
          key: "type",
          label: "Type",
          options: [
            { value: "News", label: "News" },
            { value: "Alert", label: "Alert" },
            { value: "Event", label: "Event" },
          ],
          required: true,
        },
        {
          key: "display_start",
          label: "Display Start Date",
          type: "date",
          required: true,
        },
        {
          key: "display_end",
          label: "Display End Date",
          type: "date",
          required: true,
        },
        { key: "content", label: "Content", type: "textarea", required: true },
      ]}
    />
  );
}

// ── Holidays ──────────────────────────────────────────────────
const TYPE_COLORS = {
  National: "badge-indigo",
  Festival: "badge-purple",
  Regional: "badge-orange",
  Company: "badge-green",
  Other: "badge-gray",
};

export function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    code: "",
    name: "",
    start_date: "",
    end_date: "",
    holiday_type: "National",
    is_week_off: false,
    is_optional: false,
    calendar_ids: [],
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([holidaysApi.list(), calendarsApi.list()])
      .then(([hols, cals]) => {
        setHolidays(Array.isArray(hols) ? hols : []);
        setCalendars(Array.isArray(cals) ? cals : []);
      })
      .catch(() => toast.error("Failed to load holidays"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await holidaysApi.create({
        ...form,
        end_date: form.end_date || form.start_date,
        is_week_off: form.is_week_off ? 1 : 0,
        is_optional: form.is_optional ? 1 : 0,
        calendar_ids: form.calendar_ids.length ? form.calendar_ids : null,
      });
      toast.success("Holiday created successfully");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create holiday");
    } finally {
      setSaving(false);
    }
  };

  const toggleCalendar = (calId) => {
    setForm((f) => ({
      ...f,
      calendar_ids: f.calendar_ids.includes(calId)
        ? f.calendar_ids.filter((id) => id !== calId)
        : [...f.calendar_ids, calId],
    }));
  };

  const filtered = holidays.filter(
    (h) =>
      (h.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h.holiday_type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>🎉 Holidays</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage company holidays linked to work calendars
          </p>
        </div>
        <button
          id="btn-add-holiday"
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
        >
          {showForm ? "✕ Cancel" : "+ Add Holiday"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="card animate-fade"
          style={{ marginBottom: "1.5rem", padding: "1.5rem" }}
        >
          <h3 style={{ margin: "0 0 1.5rem" }}>New Holiday</h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div className="form-group">
                <label>Code *</label>
                <input
                  id="holiday-code"
                  required
                  className="form-input"
                  placeholder="e.g. IND_REP_DAY"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  id="holiday-name"
                  required
                  className="form-input"
                  placeholder="e.g. Republic Day"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  id="holiday-start-date"
                  type="date"
                  required
                  className="form-input"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  id="holiday-end-date"
                  type="date"
                  className="form-input"
                  min={form.start_date}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  id="holiday-type"
                  className="form-input"
                  value={form.holiday_type}
                  onChange={(e) => setForm({ ...form, holiday_type: e.target.value })}
                >
                  {["National", "Festival", "Regional", "Company", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.is_optional}
                  onChange={(e) => setForm({ ...form, is_optional: e.target.checked })}
                />
                Optional Holiday
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.is_week_off}
                  onChange={(e) => setForm({ ...form, is_week_off: e.target.checked })}
                />
                Week Off
              </label>
            </div>

            {/* Calendar multi-select */}
            {calendars.length > 0 && (
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Link to Calendars (optional)</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {calendars.map((cal) => {
                    const selected = form.calendar_ids.includes(cal.id);
                    return (
                      <button
                        key={cal.id}
                        type="button"
                        onClick={() => toggleCalendar(cal.id)}
                        style={{
                          padding: "0.35rem 0.9rem",
                          borderRadius: "6px",
                          border: selected
                            ? "1px solid var(--clr-primary)"
                            : "1px solid var(--clr-border)",
                          background: selected ? "rgba(99,102,241,0.15)" : "transparent",
                          color: selected ? "var(--clr-primary)" : "var(--clr-text-muted)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {selected ? "✓ " : ""}{cal.calendar_name ?? cal.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                id="btn-save-holiday"
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Holiday"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            id="holiday-search"
            className="form-input"
            placeholder="🔍  Search by name, code or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "360px" }}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Optional?</th>
                <th>Week Off?</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
                    {search
                      ? "No matching holidays found."
                      : "No holidays yet. Click \"+ Add Holiday\" to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => {
                  const start = h.start_date
                    ? new Date(h.start_date).toLocaleDateString("en-IN")
                    : "—";
                  const end =
                    h.end_date && h.end_date !== h.start_date
                      ? " → " + new Date(h.end_date).toLocaleDateString("en-IN")
                      : "";
                  const type = h.holiday_type ?? h.type ?? "Other";
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{h.code}</td>
                      <td style={{ fontWeight: 500 }}>{h.name}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{start}{end}</td>
                      <td>
                        <span className={`badge ${TYPE_COLORS[type] ?? "badge-gray"}`}>
                          {type}
                        </span>
                      </td>
                      <td>
                        {h.is_optional ? (
                          <span className="badge badge-orange">Yes</span>
                        ) : (
                          <span style={{ color: "var(--clr-text-muted)" }}>No</span>
                        )}
                      </td>
                      <td>
                        {h.is_week_off ? (
                          <span className="badge badge-indigo">Yes</span>
                        ) : (
                          <span style={{ color: "var(--clr-text-muted)" }}>No</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "var(--clr-text-muted)",
              textAlign: "right",
            }}
          >
            Showing {filtered.length} of {holidays.length} holiday{holidays.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
