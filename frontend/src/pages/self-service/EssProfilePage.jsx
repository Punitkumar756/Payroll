import React, { useEffect, useState } from "react";
import { employeesApi } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";

export default function EssProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    contact_number: "",
    current_address: "",
    emergency_contact: "",
  });

  const load = async () => {
    if (!user?.employeeId) return setLoading(false);
    setLoading(true);
    try {
      const data = await employeesApi.get(user.employeeId);
      setProfile(data);
      setFormData({
        contact_number: data.contact_number || "",
        current_address: data.current_address || "",
        emergency_contact: data.emergency_contact || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await employeesApi.selfUpdate(formData);
      toast.success("Profile updated successfully");
      load();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "var(--sp-xl)", textAlign: "center" }}>
        <span className="spinner" />
      </div>
    );
  if (!profile)
    return (
      <div className="card" style={{ padding: "var(--sp-xl)" }}>
        No employee record linked to this account.
      </div>
    );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>
            View your organizational details and update your contact information
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-lg)",
          alignItems: "start",
        }}
      >
        {/* Read Only Org Data */}
        <div className="card" style={{ padding: "var(--sp-xl)" }}>
          <h3
            style={{
              marginBottom: "var(--sp-md)",
              borderBottom: "1px solid var(--clr-border)",
              paddingBottom: "var(--sp-sm)",
            }}
          >
            Organizational Details
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-sm)",
            }}
          >
            <p>
              <strong>Employee Code:</strong> {profile.employee_code}
            </p>
            <p>
              <strong>Name:</strong> {profile.first_name} {profile.last_name}
            </p>
            <p>
              <strong>Email:</strong> {profile.official_email}
            </p>
            <p>
              <strong>Department:</strong> {profile.department_name || "-"}
            </p>
            <p>
              <strong>Designation:</strong> {profile.designation_name || "-"}
            </p>
            <p>
              <strong>Location:</strong> {profile.location_name || "-"}
            </p>
            <p>
              <strong>Reporting Manager:</strong> {profile.manager_name || "-"}
            </p>
            <p>
              <strong>Joining Date:</strong>{" "}
              {profile.date_of_joining?.split("T")[0]}
            </p>
          </div>
          <div
            style={{
              marginTop: "var(--sp-lg)",
              padding: "var(--sp-md)",
              background: "var(--clr-bg-alt)",
              borderRadius: "var(--r-md)",
            }}
          >
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              <em>
                Note: Organizational fields are managed by HR. If you see any
                discrepancy, please contact the HR department.
              </em>
            </p>
          </div>
        </div>

        {/* Editable Personal Data */}
        <div className="card" style={{ padding: "var(--sp-xl)" }}>
          <h3
            style={{
              marginBottom: "var(--sp-md)",
              borderBottom: "1px solid var(--clr-border)",
              paddingBottom: "var(--sp-sm)",
            }}
          >
            Personal Information
          </h3>
          <form
            onSubmit={handleSave}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-md)",
            }}
          >
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Current Address</label>
              <textarea
                className="form-control"
                value={formData.current_address}
                onChange={(e) =>
                  setFormData({ ...formData, current_address: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="text"
                className="form-control"
                value={formData.emergency_contact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency_contact: e.target.value,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "var(--sp-sm)",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
