import React, { useEffect, useState } from "react";
import { leaveApi } from "../../../api";
import toast from "react-hot-toast";

export default function LeavePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    accrual_frequency: "Annual",
  });
  // A mapping of leave_type_id to its entitlement value
  const [policyTypes, setPolicyTypes] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [pData, tData] = await Promise.all([
        leaveApi.listPolicies(),
        leaveApi.listTypes(),
      ]);
      setPolicies(pData);
      setLeaveTypes(tData.filter((t) => t.is_active));
    } catch {
      toast.error("Failed to load leave policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name)
      return toast.error("Code and Name are required");
    // Convert policyTypes object to array of { leave_type_id, entitlement }
    const typesArray = Object.keys(policyTypes)
      .map((id) => ({
        leave_type_id: parseInt(id),
        entitlement: policyTypes[parseInt(id)],
      }))
      .filter((t) => t.entitlement > 0);

    try {
      await leaveApi.createPolicy({
        ...formData,
        types: typesArray,
      });
      toast.success("Leave policy created successfully");
      setFormData({ code: "", name: "", accrual_frequency: "Annual" });
      setPolicyTypes({});
      load();
    } catch {
      toast.error("Failed to create leave policy");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leave Policies</h1>
          <p>Define policies and bundle leave types with annual entitlements</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
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
                  <th>Code</th>
                  <th>Name</th>
                  <th>Accrual Frequency</th>
                  <th>Types Bundled</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>{p.code}</td>
                    <td>{p.name}</td>
                    <td>{p.accrual_frequency}</td>
                    <td>{p.types_count || 0} types</td>
                  </tr>
                ))}
                {policies.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No policies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: "var(--sp-md)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-md)" }}>
            New Policy
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
              <label>Code *</label>
              <input
                type="text"
                className="form-control"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
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
              <label>Accrual Frequency *</label>
              <select
                className="form-control"
                value={formData.accrual_frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accrual_frequency: e.target.value,
                  })
                }
              >
                <option value="None">None</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div style={{ marginTop: "var(--sp-sm)" }}>
              <label
                style={{
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "var(--sp-xs)",
                }}
              >
                Entitlements (Days)
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-xs)",
                  background: "var(--clr-bg-alt)",
                  padding: "var(--sp-sm)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                {leaveTypes.map((lt) => (
                  <div
                    key={lt.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{lt.name}</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 80, padding: "4px 8px" }}
                      placeholder="0"
                      value={policyTypes[lt.id] || ""}
                      onChange={(e) =>
                        setPolicyTypes({
                          ...policyTypes,
                          [lt.id]: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                ))}
                {leaveTypes.length === 0 && (
                  <span className="text-muted text-sm">
                    No active leave types found.
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "var(--sp-sm)" }}
            >
              Create Policy
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
