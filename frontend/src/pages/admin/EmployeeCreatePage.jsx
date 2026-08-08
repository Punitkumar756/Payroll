import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  employeesApi,
  departmentsApi,
  designationsApi,
  locationsApi,
  calendarsApi,
} from "../../api";
import toast from "react-hot-toast";

const STEPS = ["Basic Info", "Org Details", "Statutory", "Address"];

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [masters, setMasters] = useState({
    departments: [],
    designations: [],
    locations: [],
    calendars: [],
  });
  const [form, setForm] = useState({
    gender: "Male",
    status: "Active",
  });

  useEffect(() => {
    Promise.all([
      departmentsApi.list(),
      designationsApi.list(),
      locationsApi.list(),
      calendarsApi.list(),
    ]).then(([d, des, l, c]) =>
      setMasters({
        departments: d,
        designations: des,
        locations: l,
        calendars: c,
      }),
    );
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await employeesApi.create(form);
      toast.success("Employee created successfully!");
      navigate(`/admin/employees/${result.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>New Employee</h1>
          <p>Add a new employee to the organization</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/admin/employees")}
        >
          ← Back
        </button>
      </div>

      {/* Stepper */}
      <div className="stepper" style={{ marginBottom: "var(--sp-xl)" }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`step ${i === step ? "active" : i < step ? "done" : ""}`}
            >
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>
                Basic Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee Code *</label>
                  <input
                    className="form-input"
                    id="emp-code"
                    value={form.employee_code || ""}
                    onChange={(e) => set("employee_code", e.target.value)}
                    placeholder="EMP-001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date *</label>
                  <input
                    className="form-input"
                    id="emp-joining"
                    type="date"
                    value={form.joining_date || ""}
                    onChange={(e) => set("joining_date", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    className="form-input"
                    id="emp-fname"
                    value={form.first_name || ""}
                    onChange={(e) => set("first_name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-input"
                    id="emp-mname"
                    value={form.middle_name || ""}
                    onChange={(e) => set("middle_name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    className="form-input"
                    id="emp-lname"
                    value={form.last_name || ""}
                    onChange={(e) => set("last_name", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-input"
                    id="emp-dob"
                    type="date"
                    value={form.date_of_birth || ""}
                    onChange={(e) => set("date_of_birth", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    id="emp-gender"
                    value={form.gender || ""}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input
                    className="form-input"
                    id="emp-email"
                    type="email"
                    value={form.official_email || ""}
                    onChange={(e) => set("official_email", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    className="form-input"
                    id="emp-phone"
                    value={form.contact_number || ""}
                    onChange={(e) => set("contact_number", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Badge ID</label>
                <input
                  className="form-input"
                  id="emp-badge"
                  value={form.badge_id || ""}
                  onChange={(e) => set("badge_id", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 1: Org Details */}
          {step === 1 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>
                Organizational Details
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    id="emp-dept"
                    value={form.department_id || ""}
                    onChange={(e) => set("department_id", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {masters.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select
                    className="form-select"
                    id="emp-desig"
                    value={form.designation_id || ""}
                    onChange={(e) => set("designation_id", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {masters.designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    id="emp-loc"
                    value={form.location_id || ""}
                    onChange={(e) => set("location_id", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {masters.locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Calendar</label>
                  <select
                    className="form-select"
                    id="emp-cal"
                    value={form.calendar_id || ""}
                    onChange={(e) => set("calendar_id", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {masters.calendars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Confirmation Date</label>
                  <input
                    className="form-input"
                    id="emp-confirm"
                    type="date"
                    value={form.confirmation_date || ""}
                    onChange={(e) => set("confirmation_date", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="emp-status"
                    value={form.status || "Active"}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Statutory */}
          {step === 2 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>
                Statutory Details
              </h3>
              <p className="text-muted mb-md">
                These details will be stored encrypted. They can be added later
                too.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PF Number</label>
                  <input
                    className="form-input"
                    id="emp-pf"
                    value={form.pf_number || ""}
                    onChange={(e) => set("pf_number", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ESI Number</label>
                  <input
                    className="form-input"
                    id="emp-esi"
                    value={form.esi_number || ""}
                    onChange={(e) => set("esi_number", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PAN</label>
                  <input
                    className="form-input"
                    id="emp-pan"
                    value={form.pan || ""}
                    onChange={(e) => set("pan", e.target.value)}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar</label>
                  <input
                    className="form-input"
                    id="emp-aadhaar"
                    value={form.aadhaar || ""}
                    onChange={(e) => set("aadhaar", e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    className="form-input"
                    id="emp-bank"
                    value={form.bank_name || ""}
                    onChange={(e) => set("bank_name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input
                    className="form-input"
                    id="emp-acct"
                    value={form.bank_account || ""}
                    onChange={(e) => set("bank_account", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    className="form-input"
                    id="emp-ifsc"
                    value={form.bank_ifsc || ""}
                    onChange={(e) => set("bank_ifsc", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">UAN Number</label>
                  <input
                    className="form-input"
                    id="emp-uan"
                    value={form.uan || ""}
                    onChange={(e) => set("uan", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>Address Details</h3>
              <div className="form-group">
                <label className="form-label">Current Address</label>
                <textarea
                  className="form-textarea"
                  id="emp-addr"
                  value={form.current_address || ""}
                  onChange={(e) => set("current_address", e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    id="emp-city"
                    value={form.city || ""}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    className="form-input"
                    id="emp-state"
                    value={form.state || ""}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-input"
                    id="emp-pin"
                    value={form.pincode || ""}
                    onChange={(e) => set("pincode", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    className="form-input"
                    id="emp-country"
                    value={form.country || "India"}
                    onChange={(e) => set("country", e.target.value)}
                  />
                </div>
              </div>
              <h4
                style={{
                  marginTop: "var(--sp-lg)",
                  marginBottom: "var(--sp-md)",
                }}
              >
                Emergency Contact
              </h4>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    id="emp-emergency-name"
                    value={form.emergency_name || ""}
                    onChange={(e) => set("emergency_name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    id="emp-emergency-phone"
                    value={form.emergency_phone || ""}
                    onChange={(e) => set("emergency_phone", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <input
                    className="form-input"
                    id="emp-emergency-relation"
                    value={form.emergency_relation || ""}
                    onChange={(e) => set("emergency_relation", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div
          className="modal-footer"
          style={{ padding: "var(--sp-md) var(--sp-lg)" }}
        >
          <button
            className="btn btn-ghost"
            onClick={() =>
              step > 0 ? setStep((s) => s - 1) : navigate("/admin/employees")
            }
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              id="btn-next-step"
              className="btn btn-primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              id="btn-create-emp-submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Creating..." : "✓ Create Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
