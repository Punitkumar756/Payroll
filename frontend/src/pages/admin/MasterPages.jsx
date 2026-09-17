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
  sitesApi,
} from "../../api";
import toast from "react-hot-toast";

// ── Sites ─────────────────────────────────────────────────
export function SitesPage() {
  return (
    <MasterPage
      title="Sites"
      description="Manage geofenced sites for employees"
      api={sitesApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "lat", label: "Latitude" },
        { key: "lng", label: "Longitude" },
        { key: "radius", label: "Radius (m)" },
        { key: "remark", label: "Remark" },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Active" : "Inactive") },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "lat", label: "Latitude", type: "number" },
        { key: "lng", label: "Longitude", type: "number" },
        { key: "radius", label: "Radius (meters)", type: "number" },
        { key: "remark", label: "Remark" },
        { key: "is_active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}

// ── Locations ─────────────────────────────────────────────────
export function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingLoc, setViewingLoc] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  
  const emptyForm = {
    id: null,
    code: "",
    name: "",
    address: "",
    phone: "",
    fax: "",
    website: "",
    remark: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    locationsApi.list()
      .then((res) => setLocations(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed to load locations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await locationsApi.update(form.id, form);
        toast.success("Location updated successfully");
      } else {
        await locationsApi.create(form);
        toast.success("Location created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loc) => {
    setForm({
      ...loc,
      is_active: loc.is_active === 1 || loc.is_active === true,
    });
    setEditingRowId(loc.id);
    setIsAddingNew(false);
    setViewingLoc(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingLoc(null);
    }
  };

  const handleView = (loc) => {
    if (viewingLoc?.id === loc.id) {
      setViewingLoc(null);
    } else {
      setViewingLoc(loc);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = locations.filter(
    (l) =>
      (l.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="9" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Location" : "✨ New Location"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fax</label>
              <input className="form-input" value={form.fax || ""} onChange={e => setForm({...form, fax: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="url" className="form-input" value={form.website || ""} onChange={e => setForm({...form, website: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-input" value={form.address || ""} onChange={e => setForm({...form, address: e.target.value})} rows="1" />
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>
            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Location"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ loc }) => (
    <tr>
      <td colSpan="9" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>🏢 Location Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {loc.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {loc.name}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Address</strong> {loc.address || "—"}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone</strong> {loc.phone || "—"}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fax</strong> {loc.fax || "—"}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Website</strong> {loc.website ? <a href={loc.website} target="_blank" rel="noreferrer" style={{ color: "var(--clr-primary)" }}>{loc.website}</a> : "—"}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {loc.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>📍 Locations</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage office locations for Dayton Natural Resource Pvt Ltd
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
        >
          {isAddingNew ? "✕ Cancel" : "+ Add Location"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name or code…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Website</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>No locations found.</td></tr>
              ) : (
                filtered.map((l, i) => (
                  <React.Fragment key={l.id || i}>
                    <tr style={(editingRowId === l.id || viewingLoc?.id === l.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{l.code}</td>
                      <td style={{ fontWeight: 500 }}>{l.name}</td>
                      <td>{l.phone || "—"}</td>
                      <td>{l.website ? <a href={l.website} target="_blank" rel="noreferrer">Link</a> : "—"}</td>
                      <td>{l.remark || "—"}</td>
                      <td>
                        <span className={`badge ${l.is_active ? "badge-green" : "badge-gray"}`}>
                          {l.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(l)}>
                            {viewingLoc?.id === l.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(l)}>
                            {editingRowId === l.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === l.id && formRowJsx}
                    {viewingLoc?.id === l.id && <DetailsRow loc={l} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Departments ───────────────────────────────────────────────
export function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: null,
    code: "",
    name: "",
    remark: "",
    details: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    departmentsApi.list()
      .then((res) => setDepartments(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed to load departments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await departmentsApi.update(form.id, form);
        toast.success("Department updated successfully");
      } else {
        await departmentsApi.create(form);
        toast.success("Department created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({
      ...dept,
      is_active: dept.is_active === 1 || dept.is_active === true,
    });
    setEditingRowId(dept.id);
    setIsAddingNew(false);
    setViewingDept(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingDept(null);
    }
  };

  const handleView = (dept) => {
    if (viewingDept?.id === dept.id) {
      setViewingDept(null);
    } else {
      setViewingDept(dept);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = departments.filter(
    (d) =>
      (d.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Department" : "✨ New Department"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>

            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Department"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ dept }) => (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>🏢 Department Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {dept.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {dept.name}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {dept.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>🏢 Departments</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage company departments
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
        >
          {isAddingNew ? "✕ Cancel" : "+ Add Department"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name or code…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No departments found.</td></tr>
              ) : (
                filtered.map((d, i) => (
                  <React.Fragment key={d.id || i}>
                    <tr style={(editingRowId === d.id || viewingDept?.id === d.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{d.code}</td>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td>{d.remark || "—"}</td>
                      <td>
                        <span className={`badge ${d.is_active ? "badge-green" : "badge-gray"}`}>
                          {d.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(d)}>
                            {viewingDept?.id === d.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(d)}>
                            {editingRowId === d.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === d.id && formRowJsx}
                    {viewingDept?.id === d.id && <DetailsRow dept={d} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DesignationsPage() {
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingDesig, setViewingDesig] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: null,
    code: "",
    name: "",
    location_id: "",
    department_id: "",
    remark: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    designationsApi.list()
      .then((res) => setDesignations(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed to load designations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    locationsApi.list({ status: "Active" }).then((res) => setLocations(Array.isArray(res) ? res : [])).catch(console.error);
    departmentsApi.list({ status: "Active" }).then((res) => setDepartments(Array.isArray(res) ? res : [])).catch(console.error);
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        location_id: form.location_id ? parseInt(form.location_id) : null,
        department_id: form.department_id ? parseInt(form.department_id) : null,
      };
      if (form.id) {
        await designationsApi.update(form.id, payload);
        toast.success("Designation updated successfully");
      } else {
        await designationsApi.create(payload);
        toast.success("Designation created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save designation");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (desig) => {
    setForm({
      ...desig,
      location_id: desig.location_id || "",
      department_id: desig.department_id || "",
      is_active: desig.is_active === 1 || desig.is_active === true,
    });
    setEditingRowId(desig.id);
    setIsAddingNew(false);
    setViewingDesig(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingDesig(null);
    }
  };

  const handleView = (desig) => {
    if (viewingDesig?.id === desig.id) {
      setViewingDesig(null);
    } else {
      setViewingDesig(desig);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = designations.filter(
    (d) =>
      (d.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.department_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="8" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Designation" : "✨ New Designation"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <select className="form-input" value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})}>
                <option value="">-- None --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-input" value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}>
                <option value="">-- None --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>
            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Designation"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ desig }) => (
    <tr>
      <td colSpan="8" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>💼 Designation Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {desig.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {desig.name}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</strong> {desig.location_name || "—"}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Department</strong> {desig.department_name || "—"}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {desig.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>💼 Designations</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage job designations
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
        >
          {isAddingNew ? "✕ Cancel" : "+ Add Designation"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name, code or department…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Department</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>No designations found.</td></tr>
              ) : (
                filtered.map((d, i) => (
                  <React.Fragment key={d.id || i}>
                    <tr style={(editingRowId === d.id || viewingDesig?.id === d.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{d.code}</td>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td>{d.location_name || "—"}</td>
                      <td>{d.department_name || "—"}</td>
                      <td>{d.remark || "—"}</td>
                      <td>
                        <span className={`badge ${d.is_active ? "badge-green" : "badge-gray"}`}>
                          {d.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(d)}>
                            {viewingDesig?.id === d.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(d)}>
                            {editingRowId === d.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === d.id && formRowJsx}
                    {viewingDesig?.id === d.id && <DetailsRow desig={d} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Categories ────────────────────────────────────────────────
export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: null,
    code: "",
    name: "",
    remark: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    categoriesApi.list()
      .then((res) => setCategories(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await categoriesApi.update(form.id, form);
        toast.success("Category updated successfully");
      } else {
        await categoriesApi.create(form);
        toast.success("Category created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({
      ...cat,
      is_active: cat.is_active === 1 || cat.is_active === true,
    });
    setEditingRowId(cat.id);
    setIsAddingNew(false);
    setViewingCategory(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingCategory(null);
    }
  };

  const handleView = (cat) => {
    if (viewingCategory?.id === cat.id) {
      setViewingCategory(null);
    } else {
      setViewingCategory(cat);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = categories.filter(
    (c) =>
      (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Category" : "✨ New Category"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>
            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Category"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ cat }) => (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>🏷️ Category Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {cat.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {cat.name}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {cat.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>🏷️ Categories</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage employee categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          {isAddingNew ? "✕ Cancel" : "+ Add Category"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name or code…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No categories found.</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <React.Fragment key={c.id || i}>
                    <tr style={(editingRowId === c.id || viewingCategory?.id === c.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{c.code}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>{c.remark || "—"}</td>
                      <td>
                        <span className={`badge ${c.is_active ? "badge-green" : "badge-gray"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(c)}>
                            {viewingCategory?.id === c.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(c)}>
                            {editingRowId === c.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === c.id && formRowJsx}
                    {viewingCategory?.id === c.id && <DetailsRow cat={c} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Groups ────────────────────────────────────────────────────
export function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: null,
    code: "",
    name: "",
    remark: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    groupsApi.list()
      .then((res) => setGroups(Array.isArray(res) ? res : []))
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await groupsApi.update(form.id, form);
        toast.success("Group updated successfully");
      } else {
        await groupsApi.create(form);
        toast.success("Group created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save group");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (grp) => {
    setForm({
      ...grp,
      is_active: grp.is_active === 1 || grp.is_active === true,
    });
    setEditingRowId(grp.id);
    setIsAddingNew(false);
    setViewingGroup(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingGroup(null);
    }
  };

  const handleView = (grp) => {
    if (viewingGroup?.id === grp.id) {
      setViewingGroup(null);
    } else {
      setViewingGroup(grp);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = groups.filter(
    (g) =>
      (g.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Group" : "✨ New Group"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>
            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Group"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ grp }) => (
    <tr>
      <td colSpan="6" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>👥 Group Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {grp.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {grp.name}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {grp.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>👥 Groups</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage employee groups
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          {isAddingNew ? "✕ Cancel" : "+ Add Group"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name or code…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No groups found.</td></tr>
              ) : (
                filtered.map((g, i) => (
                  <React.Fragment key={g.id || i}>
                    <tr style={(editingRowId === g.id || viewingGroup?.id === g.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{g.code}</td>
                      <td style={{ fontWeight: 500 }}>{g.name}</td>
                      <td>{g.remark || "—"}</td>
                      <td>
                        <span className={`badge ${g.is_active ? "badge-green" : "badge-gray"}`}>
                          {g.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(g)}>
                            {viewingGroup?.id === g.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(g)}>
                            {editingRowId === g.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === g.id && formRowJsx}
                    {viewingGroup?.id === g.id && <DetailsRow grp={g} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sub Groups ────────────────────────────────────────────────
export function SubGroupsPage() {
  const [subGroups, setSubGroups] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewingSubGroup, setViewingSubGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: null,
    group_id: "",
    code: "",
    name: "",
    remark: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([
      subGroupsApi.list(),
      groupsApi.list()
    ])
      .then(([sgRes, gRes]) => {
        setSubGroups(Array.isArray(sgRes) ? sgRes : []);
        setGroupsList(Array.isArray(gRes) ? gRes : []);
      })
      .catch(() => toast.error("Failed to load sub-groups data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.group_id) {
      toast.error("Please select a group");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await subGroupsApi.update(form.id, form);
        toast.success("Sub-Group updated successfully");
      } else {
        await subGroupsApi.create(form);
        toast.success("Sub-Group created successfully");
      }
      setForm(emptyForm);
      setEditingRowId(null);
      setIsAddingNew(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save sub-group");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sg) => {
    setForm({
      ...sg,
      is_active: sg.is_active === 1 || sg.is_active === true,
    });
    setEditingRowId(sg.id);
    setIsAddingNew(false);
    setViewingSubGroup(null);
  };

  const handleAddNew = () => {
    if (isAddingNew) {
      handleCancel();
    } else {
      setForm(emptyForm);
      setIsAddingNew(true);
      setEditingRowId(null);
      setViewingSubGroup(null);
    }
  };

  const handleView = (sg) => {
    if (viewingSubGroup?.id === sg.id) {
      setViewingSubGroup(null);
    } else {
      setViewingSubGroup(sg);
      setEditingRowId(null);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingRowId(null);
    setIsAddingNew(false);
  };

  const filtered = subGroups.filter(
    (sg) =>
      (sg.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (sg.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (sg.group_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formRowJsx = (
    <tr>
      <td colSpan="7" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSubmit} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {form.id ? "✏️ Edit Sub-Group" : "✨ New Sub-Group"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Code *</label>
              <input required className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Group *</label>
              <select className="form-input" required value={form.group_id || ""} onChange={e => setForm({...form, group_id: e.target.value ? Number(e.target.value) : ""})}>
                <option value="">-- Select Group --</option>
                {groupsList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Remark</label>
              <input className="form-input" value={form.remark || ""} onChange={e => setForm({...form, remark: e.target.value})} />
            </div>
            {form.id && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.75rem" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Sub-Group"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  const DetailsRow = ({ sg }) => (
    <tr>
      <td colSpan="7" style={{ padding: "1.5rem", background: "rgba(99,102,241,0.02)", borderBottom: "1px solid var(--clr-border)" }}>
        <div className="animate-fade">
          <h4 style={{ margin: "0 0 1rem", color: "var(--clr-primary)" }}>🏷️ Sub-Group Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Code</strong> {sg.code}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</strong> {sg.name}</div>
            <div><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Group</strong> {sg.group_name || "—"}</div>
            <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "var(--clr-text-muted)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remark</strong> {sg.remark || "—"}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>🏷️ Sub-Groups</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
            Manage employee sub-groups
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          {isAddingNew ? "✕ Cancel" : "+ Add Sub-Group"}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input className="form-input" placeholder="🔍 Search by name, code or group…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Code</th>
                <th>Name</th>
                <th>Group</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>No sub-groups found.</td></tr>
              ) : (
                filtered.map((sg, i) => (
                  <React.Fragment key={sg.id || i}>
                    <tr style={(editingRowId === sg.id || viewingSubGroup?.id === sg.id) ? { background: "var(--clr-bg)" } : {}}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{sg.code}</td>
                      <td style={{ fontWeight: 500 }}>{sg.name}</td>
                      <td>{sg.group_name || "—"}</td>
                      <td>{sg.remark || "—"}</td>
                      <td>
                        <span className={`badge ${sg.is_active ? "badge-green" : "badge-gray"}`}>
                          {sg.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleView(sg)}>
                            {viewingSubGroup?.id === sg.id ? "Close Details" : "Details"}
                          </button>
                          <button className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleEdit(sg)}>
                            {editingRowId === sg.id ? "Cancel Edit" : "Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingRowId === sg.id && formRowJsx}
                    {viewingSubGroup?.id === sg.id && <DetailsRow sg={sg} />}
                  </React.Fragment>
                ))
              )}
              {isAddingNew && formRowJsx}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
                <th>S. No.</th>
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
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
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
                      <td>{i + 1}</td>
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
