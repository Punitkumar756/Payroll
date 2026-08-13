import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calendarsApi, locationsApi } from "../../../api";
import toast from "react-hot-toast";

export default function CalendarCreate() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    calendar_name: "",
    calendar_code: "",
    year: new Date().getFullYear(),
    location_id: "",
    description: "",
    status: "Active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        year: parseInt(formData.year),
      };
      const res = await calendarsApi.create(dataToSave);
      toast.success("Calendar created successfully");
      navigate(`/admin/calendars/${res.id}`); // Redirect to details to configure weekly offs and holidays
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create calendar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Create Calendar</h1>
        <p style={{ color: "var(--clr-text-muted)", margin: 0 }}>Set up a new working calendar</p>
      </div>

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="form-group">
            <label>Calendar Name *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.calendar_name}
              onChange={(e) => setFormData({ ...formData, calendar_name: e.target.value })}
              placeholder="e.g. Rajasthan Office Calendar 2026"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="form-group">
              <label>Calendar Code *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.calendar_code}
                onChange={(e) => setFormData({ ...formData, calendar_code: e.target.value })}
                placeholder="e.g. RJ-2026"
              />
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location (Optional)</label>
            <select
              className="form-input"
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
            >
              <option value="">All Locations / Default</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginTop: "0.25rem" }}>
              Leave blank to make this a default organizational calendar.
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/admin/calendars")}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create Calendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
