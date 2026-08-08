import React, { useEffect, useState } from "react";
import { payrollApi } from "../../../api";
import toast from "react-hot-toast";

export default function CtcTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [salaryHeads, setSalaryHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [templateHeads, setTemplateHeads] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const [tData, hData] = await Promise.all([
        payrollApi.listCTCTemplates(),
        payrollApi.listSalaryHeads(),
      ]);
      setTemplates(tData);
      setSalaryHeads(hData.filter((h) => h.is_active));
    } catch {
      toast.error("Failed to load CTC data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHead = (id) => {
    const next = new Set(templateHeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTemplateHeads(next);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Name is required");
    if (templateHeads.size === 0)
      return toast.error("Select at least one salary head");

    try {
      await payrollApi.createCTCTemplate({
        ...formData,
        heads: Array.from(templateHeads).map((id) => ({ salary_head_id: id })),
      });
      toast.success("CTC Template created successfully");
      setFormData({ name: "", description: "" });
      setTemplateHeads(new Set());
      load();
    } catch {
      toast.error("Failed to create CTC template");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>CTC Templates</h1>
          <p>Bundle salary heads into reusable compensation structures</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "var(--sp-lg)",
          alignItems: "start",
        }}
      >
        <div className="card">
          {loading ? (
            <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
              <span className="spinner" />
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Template Name</th>
                  <th>Description</th>
                  <th>Heads Bundled</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.description}</td>
                    <td>{t.heads_count || 0} components</td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No templates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: "var(--sp-md)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-md)" }}>
            New Template
          </h3>
          <form
            onSubmit={handleCreate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "var(--sp-xs)",
                }}
              >
                Select Components
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-xs)",
                  background: "var(--clr-bg-alt)",
                  padding: "var(--sp-sm)",
                  borderRadius: "var(--r-sm)",
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {salaryHeads.map((sh) => (
                  <label
                    key={sh.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-sm)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={templateHeads.has(sh.id)}
                      onChange={() => toggleHead(sh.id)}
                    />

                    <span>
                      {sh.name}{" "}
                      <span className="text-muted text-sm">
                        ({sh.head_type})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "var(--sp-sm)" }}
            >
              Create Template
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
