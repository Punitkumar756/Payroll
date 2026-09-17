import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function MasterPage({
  title,
  description,
  api,
  columns,
  fields,
  idKey = "id",
  extraFilters,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [editingRowId, setEditingRowId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await api.list());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddNew = () => {
    if (isAddingNew) {
      setIsAddingNew(false);
      setForm({});
    } else {
      setForm({});
      setIsAddingNew(true);
      setEditingRowId(null);
    }
  };

  const handleEdit = (row) => {
    if (editingRowId === row[idKey]) {
      setEditingRowId(null);
      setForm({});
    } else {
      setForm({ ...row });
      setEditingRowId(row[idKey]);
      setIsAddingNew(false);
    }
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setIsAddingNew(false);
    setForm({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanForm = { ...form };
    for (const key in cleanForm) {
      if (cleanForm[key] === "") {
        cleanForm[key] = null;
      }
    }
    
    setSaving(true);
    try {
      if (editingRowId) {
        await api.update(editingRowId, cleanForm);
        toast.success(`${title} updated`);
      } else {
        await api.create(cleanForm);
        toast.success(`${title} created`);
      }
      setEditingRowId(null);
      setIsAddingNew(false);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!api.remove) return;
    if (!confirm(`Deactivate this ${title.toLowerCase()}?`)) return;
    try {
      await api.remove(row[idKey]);
      toast.success("Deactivated");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    }
  };

  const filtered = rows.filter((r) =>
    columns.some((c) =>
      String(r[c.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const formRowJsx = (
    <tr>
      <td colSpan={columns.length + 2} style={{ padding: "1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--clr-border)" }}>
        <form onSubmit={handleSave} className="animate-fade">
          <h4 style={{ margin: "0 0 1.25rem", color: "var(--clr-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {editingRowId ? `✏️ Edit ${title}` : `✨ New ${title}`}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {fields.map((f) => (
              <div 
                className="form-group" 
                key={f.key}
                style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}
              >
                <label>
                  {f.label}
                  {f.required && " *"}
                </label>
                {f.type === "select" ? (
                  <select
                    className="form-input"
                    value={form[f.key] ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="form-input"
                    value={form[f.key] ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    required={f.required}
                    rows="4"
                    style={{ resize: "vertical" }}
                  />
                ) : f.type === "checkbox" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={form[f.key] === 1 || form[f.key] === true}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [f.key]: e.target.checked }))
                      }
                      style={{ width: "auto" }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>Yes</span>
                  </div>
                ) : (
                  <input
                    type={f.type || "text"}
                    className="form-input"
                    value={form[f.key] ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingRowId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{title}</h1>
          <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>{description}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
        >
          {isAddingNew ? "✕ Cancel" : `+ Add ${title}`}
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
          <input 
            className="form-input" 
            placeholder={`🔍 Search ${title.toLowerCase()}...`}
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ maxWidth: "360px" }} 
          />
          {extraFilters}
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 2} style={{ textAlign: "center", padding: "2rem" }}>Loading...</td></tr>
              ) : filtered.length === 0 && !isAddingNew ? (
                <tr><td colSpan={columns.length + 2} style={{ textAlign: "center", padding: "2rem" }}>No {title.toLowerCase()} found.</td></tr>
              ) : (
                <>
                  {isAddingNew && formRowJsx}
                  {filtered.map((row, index) => (
                    <React.Fragment key={row[idKey]}>
                      <tr style={editingRowId === row[idKey] ? { background: "var(--clr-bg)" } : {}}>
                        <td>{index + 1}</td>
                        {columns.map((c) => (
                          <td key={c.key}>
                            {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                          </td>
                        ))}
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                              onClick={() => handleEdit(row)}
                            >
                              {editingRowId === row[idKey] ? "Cancel Edit" : "Edit"}
                            </button>
                            {api.remove && (
                              <button
                                className="btn btn-outline"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", color: "var(--clr-danger)" }}
                                onClick={() => handleDelete(row)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {editingRowId === row[idKey] && formRowJsx}
                    </React.Fragment>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
