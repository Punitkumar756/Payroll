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
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
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

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.update(editing[idKey], form);
        toast.success(`${title} updated`);
      } else {
        await api.create(form);
        toast.success(`${title} created`);
      }
      setShowModal(false);
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

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button
          id={`btn-create-${title.toLowerCase().replace(/\s/g, "-")}`}
          className="btn btn-primary"
          onClick={openCreate}
        >
          + New {title}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div
            className="filter-bar"
            style={{ margin: 0, flex: 1, gap: "var(--sp-sm)" }}
          >
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id={`search-${title.toLowerCase().replace(/\s/g, "-")}`}
                className="search-input"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {extraFilters}
          </div>
          <span
            className="badge badge-gray"
            style={{ marginLeft: "var(--sp-md)" }}
          >
            {filtered.length} records
          </span>
        </div>

        <div
          className="table-wrapper"
          style={{ border: "none", borderRadius: 0 }}
        >
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No {title.toLowerCase()} found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row[idKey]}>
                    {columns.map((c) => (
                      <td key={c.key}>
                        {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: "flex", gap: "var(--sp-xs)" }}>
                        <button
                          id={`btn-edit-${title.toLowerCase().replace(/\s/g, "-")}-${row[idKey]}`}
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(row)}
                        >
                          ✏️ Edit
                        </button>
                        {api.remove && (
                          <button
                            id={`btn-delete-${title.toLowerCase().replace(/\s/g, "-")}-${row[idKey]}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(row)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editing ? `Edit ${title}` : `New ${title}`}
              </h3>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanForm = { ...form };
                for (const key in cleanForm) {
                  if (cleanForm[key] === "") {
                    cleanForm[key] = null;
                  }
                }
                
                setSaving(true);
                const apiCall = editing
                  ? api.update(editing[idKey], cleanForm)
                  : api.create(cleanForm);

                apiCall
                  .then(() => {
                    toast.success(`${title} ${editing ? "updated" : "created"}`);
                    setShowModal(false);
                    load();
                  })
                  .catch((err) => {
                    toast.error(err?.response?.data?.detail || "Save failed");
                  })
                  .finally(() => {
                    setSaving(false);
                  });
              }}
            >
              <div className="modal-body">
                {fields.map((f) => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label" htmlFor={`field-${f.key}`}>
                      {f.label}
                      {f.required && " *"}
                    </label>
                    {f.type === "select" ? (
                      <select
                        id={`field-${f.key}`}
                        className="form-select"
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
                        id={`field-${f.key}`}
                        className="form-textarea"
                        value={form[f.key] ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        required={f.required}
                      />
                    ) : (
                      <input
                        id={`field-${f.key}`}
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
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="btn-save-modal"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
