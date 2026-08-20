import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  employeesApi,
  departmentsApi,
  designationsApi,
  locationsApi,
  calendarsApi,
  categoriesApi,
  groupsApi,
  subGroupsApi,
} from "../../api";
import toast from "react-hot-toast";

// ── Steps definition ─────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Org Details", "Statutory", "Address"];

// ── Validation rules per step ─────────────────────────────────────────────────
function validateStep(step, form) {
  const errors = {};
  if (step === 0) {
    if (!form.first_name?.trim()) errors.first_name = "First name is required";
    if (!form.last_name?.trim())  errors.last_name  = "Last name is required";
    if (!form.employee_code?.trim()) errors.employee_code = "Employee code is required";
    if (!form.joining_date)      errors.joining_date = "Joining date is required";
  }
  return errors;
}

// ── Skeleton block ────────────────────────────────────────────────────────────
function Skeleton({ h = 40, mb = 16 }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: 8,
        marginBottom: mb,
        background: "linear-gradient(90deg, rgba(203,213,225,0.35) 25%, rgba(203,213,225,0.15) 50%, rgba(203,213,225,0.35) 75%)",
        backgroundSize: "400% 100%",
        animation: "skeletonShimmer 1.4s ease infinite",
      }}
    />
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div style={{ marginBottom: "var(--sp-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--clr-text-muted)", marginBottom: 6 }}>
        <span>Step {step + 1} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "var(--clr-border)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--grad-primary)",
            borderRadius: 99,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Field wrapper with error support ─────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: "var(--clr-danger)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <div className="form-error">⚠ {error}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty]     = useState(false);
  const [errors, setErrors]   = useState({});

  const [masters, setMasters] = useState({
    departments:  [],
    designations: [],
    locations:    [],
    calendars:    [],
    categories:   [],
    groups:       [],
    subGroups:    [],
    managers:     [],
  });

  const [form, setForm] = useState({ gender: "Male", status: "Active" });

  // Separate statutory state so it goes to a different endpoint
  const [statutory, setStatutory] = useState({
    pf_number: "", esi_number: "", uan: "",
    pan: "", aadhaar: "",
    bank_name: "", bank_account: "", bank_ifsc: "",
  });

  // ── Load all data ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      departmentsApi.list(),
      designationsApi.list(),
      locationsApi.list(),
      calendarsApi.list(),
      categoriesApi.list(),
      groupsApi.list(),
      employeesApi.list({ status: "Active", page_size: 500 }),
      employeesApi.get(id),
    ])
      .then(([depts, desigs, locs, cals, cats, grps, empList, emp]) => {
        setMasters({
          departments:  Array.isArray(depts)  ? depts  : [],
          designations: Array.isArray(desigs) ? desigs : [],
          locations:    Array.isArray(locs)   ? locs   : [],
          calendars:    Array.isArray(cals)   ? cals   : [],
          categories:   Array.isArray(cats)   ? cats   : [],
          groups:       Array.isArray(grps)   ? grps   : [],
          subGroups:    [],
          managers:     Array.isArray(empList) ? empList.filter(e => String(e.id) !== String(id)) : [],
        });

        // Normalize dates
        ["joining_date", "date_of_birth", "confirmation_date"].forEach((k) => {
          if (emp[k]) emp[k] = emp[k].split("T")[0];
        });

        // Split statutory fields from core employee data
        // SP returns: pf_number, esi_number, uan_number, bank_name, bank_ifsc, bank_branch, pan, aadhaar, bank_account
        const {
          pf_number, esi_number, uan_number,
          bank_name, bank_ifsc, bank_branch,
          pan, aadhaar, bank_account,
          ...core
        } = emp;

        setForm(core);
        setStatutory({
          pf_number:    pf_number    || "",
          esi_number:   esi_number   || "",
          uan:          uan_number   || "",   // SP column is uan_number
          pan:          pan          || "",
          aadhaar:      aadhaar      || "",
          bank_name:    bank_name    || "",
          bank_account: bank_account || "",
          bank_ifsc:    bank_ifsc    || "",
        });

        // Load subgroups if employee already has a group
        if (emp.group_id) {
          subGroupsApi.list({ group_id: emp.group_id })
            .then((sg) => setMasters((m) => ({ ...m, subGroups: Array.isArray(sg) ? sg : [] })))
            .catch(() => {});
        }
      })
      .catch(() => {
        toast.error("Failed to load employee details");
        navigate("/admin/employees");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // ── Unsaved-changes guard ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = useCallback((k, v) => {
    setDirty(true);
    setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const setStat = useCallback((k, v) => {
    setDirty(true);
    setStatutory((s) => ({ ...s, [k]: v }));
  }, []);

  const handleGroupChange = async (groupId) => {
    set("group_id", groupId);
    set("sub_group_id", "");
    if (groupId) {
      try {
        const sg = await subGroupsApi.list({ group_id: groupId });
        setMasters((m) => ({ ...m, subGroups: Array.isArray(sg) ? sg : [] }));
      } catch {
        setMasters((m) => ({ ...m, subGroups: [] }));
      }
    } else {
      setMasters((m) => ({ ...m, subGroups: [] }));
    }
  };

  // ── Navigation with validation ──────────────────────────────────────────────
  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fill in all required fields");
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    if (step > 0) setStep((s) => s - 1);
    else navigate("/admin/employees");
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix validation errors");
      return;
    }

    setSaving(true);
    try {
      // 1. Update core employee record
      await employeesApi.update(id, form);

      // 2. Update statutory details via dedicated endpoint
      const hasStatutory = Object.values(statutory).some((v) => v?.trim?.());
      if (hasStatutory) {
        await employeesApi.updateStatutory(id, statutory);
      }

      setDirty(false);
      toast.success("Employee updated successfully!");
      navigate(`/admin/employees/${id}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  // ── Skeleton loader ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade">
        <style>{`
          @keyframes skeletonShimmer {
            0%   { background-position: 100% 0 }
            100% { background-position: -100% 0 }
          }
        `}</style>
        <div className="page-header">
          <div className="page-header-left">
            <Skeleton h={28} mb={8} />
            <Skeleton h={16} mb={0} />
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <Skeleton h={60} mb={24} />
            <div className="form-row">
              <Skeleton h={44} />
              <Skeleton h={44} />
            </div>
            <div className="form-row-3">
              <Skeleton h={44} />
              <Skeleton h={44} />
              <Skeleton h={44} />
            </div>
            <div className="form-row">
              <Skeleton h={44} />
              <Skeleton h={44} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade">
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: 100% 0 }
          100% { background-position: -100% 0 }
        }
        .form-input.error, .form-select.error {
          border-color: var(--clr-danger) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
        }
        .section-divider {
          border: none;
          border-top: 1px solid var(--clr-border);
          margin: var(--sp-lg) 0;
        }
        .stat-info-box {
          background: rgba(79,70,229,0.06);
          border: 1px solid rgba(79,70,229,0.15);
          border-radius: var(--r-md);
          padding: var(--sp-md);
          margin-bottom: var(--sp-lg);
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
          display: flex;
          align-items: flex-start;
          gap: var(--sp-sm);
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Edit Employee</h1>
          <p>
            Updating record for{" "}
            <strong>{form.first_name} {form.last_name}</strong>
            {form.employee_code && <span style={{ color: "var(--clr-text-muted)", marginLeft: 6 }}>· {form.employee_code}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
          {dirty && (
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.8rem", color: "var(--clr-warning)",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "var(--r-md)", padding: "6px 12px",
            }}>
              ⚠ Unsaved changes
            </span>
          )}
          <button className="btn btn-ghost" onClick={() => {
            if (dirty && !window.confirm("You have unsaved changes. Leave anyway?")) return;
            navigate(`/admin/employees/${id}`);
          }}>
            ← Back
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar step={step} total={STEPS.length} />

      {/* ── Stepper ── */}
      <div className="stepper" style={{ marginBottom: "var(--sp-xl)" }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`step ${i === step ? "active" : i < step ? "done" : ""}`}
              style={{ cursor: i < step ? "pointer" : "default" }}
              onClick={() => { if (i < step) { setErrors({}); setStep(i); } }}
            >
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Form Card ── */}
      <div className="card">
        <div className="card-body">

          {/* ════════════════ STEP 0: BASIC INFO ════════════════ */}
          {step === 0 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>Basic Information</h3>

              <div className="form-row">
                <Field label="Employee Code" error={errors.employee_code} required>
                  <input
                    id="emp-code"
                    className={`form-input ${errors.employee_code ? "error" : ""}`}
                    value={form.employee_code || ""}
                    onChange={(e) => set("employee_code", e.target.value)}
                    placeholder="EMP-001"
                  />
                </Field>
                <Field label="Joining Date" error={errors.joining_date} required>
                  <input
                    id="emp-joining"
                    type="date"
                    className={`form-input ${errors.joining_date ? "error" : ""}`}
                    value={form.joining_date || ""}
                    onChange={(e) => set("joining_date", e.target.value)}
                  />
                </Field>
              </div>

              <div className="form-row-3">
                <Field label="First Name" error={errors.first_name} required>
                  <input
                    id="emp-fname"
                    className={`form-input ${errors.first_name ? "error" : ""}`}
                    value={form.first_name || ""}
                    onChange={(e) => set("first_name", e.target.value)}
                    placeholder="Rajesh"
                  />
                </Field>
                <Field label="Middle Name">
                  <input
                    id="emp-mname"
                    className="form-input"
                    value={form.middle_name || ""}
                    onChange={(e) => set("middle_name", e.target.value)}
                    placeholder="Kumar"
                  />
                </Field>
                <Field label="Last Name" error={errors.last_name} required>
                  <input
                    id="emp-lname"
                    className={`form-input ${errors.last_name ? "error" : ""}`}
                    value={form.last_name || ""}
                    onChange={(e) => set("last_name", e.target.value)}
                    placeholder="Sharma"
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Date of Birth">
                  <input
                    id="emp-dob"
                    type="date"
                    className="form-input"
                    value={form.date_of_birth || ""}
                    onChange={(e) => set("date_of_birth", e.target.value)}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    id="emp-gender"
                    className="form-select"
                    value={form.gender || "Male"}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Official Email">
                  <input
                    id="emp-official-email"
                    type="email"
                    className="form-input"
                    value={form.official_email || ""}
                    onChange={(e) => set("official_email", e.target.value)}
                    placeholder="rajesh@company.com"
                  />
                </Field>
                <Field label="Personal Email">
                  <input
                    id="emp-personal-email"
                    type="email"
                    className="form-input"
                    value={form.personal_email || ""}
                    onChange={(e) => set("personal_email", e.target.value)}
                    placeholder="rajesh@gmail.com"
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Contact Number">
                  <input
                    id="emp-phone"
                    className="form-input"
                    value={form.contact_number || ""}
                    onChange={(e) => set("contact_number", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Badge ID">
                  <input
                    id="emp-badge"
                    className="form-input"
                    value={form.badge_id || ""}
                    onChange={(e) => set("badge_id", e.target.value)}
                    placeholder="BADGE-001"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 1: ORG DETAILS ════════════════ */}
          {step === 1 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>Organizational Details</h3>

              <div className="form-row">
                <Field label="Department">
                  <select
                    id="emp-dept"
                    className="form-select"
                    value={form.department_id || ""}
                    onChange={(e) => set("department_id", e.target.value || null)}
                  >
                    <option value="">— Select Department —</option>
                    {masters.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Designation">
                  <select
                    id="emp-desig"
                    className="form-select"
                    value={form.designation_id || ""}
                    onChange={(e) => set("designation_id", e.target.value || null)}
                  >
                    <option value="">— Select Designation —</option>
                    {masters.designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Location">
                  <select
                    id="emp-loc"
                    className="form-select"
                    value={form.location_id || ""}
                    onChange={(e) => set("location_id", e.target.value || null)}
                  >
                    <option value="">— Select Location —</option>
                    {masters.locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Category">
                  <select
                    id="emp-cat"
                    className="form-select"
                    value={form.category_id || ""}
                    onChange={(e) => set("category_id", e.target.value || null)}
                  >
                    <option value="">— Select Category —</option>
                    {masters.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Group">
                  <select
                    id="emp-group"
                    className="form-select"
                    value={form.group_id || ""}
                    onChange={(e) => handleGroupChange(e.target.value || null)}
                  >
                    <option value="">— Select Group —</option>
                    {masters.groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sub-Group">
                  <select
                    id="emp-subgroup"
                    className="form-select"
                    value={form.sub_group_id || ""}
                    onChange={(e) => set("sub_group_id", e.target.value || null)}
                    disabled={!form.group_id || masters.subGroups.length === 0}
                  >
                    <option value="">
                      {!form.group_id
                        ? "Select a group first"
                        : masters.subGroups.length === 0
                        ? "No sub-groups available"
                        : "— Select Sub-Group —"}
                    </option>
                    {masters.subGroups.map((sg) => (
                      <option key={sg.id} value={sg.id}>{sg.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Calendar">
                  <select
                    id="emp-cal"
                    className="form-select"
                    value={form.calendar_id || ""}
                    onChange={(e) => set("calendar_id", e.target.value || null)}
                  >
                    <option value="">— Select Calendar —</option>
                    {masters.calendars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.calendar_name ?? c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reporting Manager">
                  <select
                    id="emp-manager"
                    className="form-select"
                    value={form.reporting_manager_id || ""}
                    onChange={(e) => set("reporting_manager_id", e.target.value || null)}
                  >
                    <option value="">— Select Manager —</option>
                    {masters.managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim()}
                        {m.designation && <> · {m.designation}</>}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <hr className="section-divider" />

              <div className="form-row">
                <Field label="Confirmation Date">
                  <input
                    id="emp-confirm"
                    type="date"
                    className="form-input"
                    value={form.confirmation_date || ""}
                    onChange={(e) => set("confirmation_date", e.target.value)}
                  />
                </Field>
                <Field label="Employment Status">
                  <select
                    id="emp-status"
                    className="form-select"
                    value={form.status || "Active"}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Probation</option>
                    <option>Notice Period</option>
                    <option>Terminated</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: STATUTORY ════════════════ */}
          {step === 2 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-sm)" }}>Statutory Details</h3>
              <div className="stat-info-box">
                <span style={{ fontSize: "1.1rem" }}>🔒</span>
                <div>
                  These details are stored securely and encrypted at rest.
                  Leave any field blank to keep the existing value unchanged.
                  They will be saved via a dedicated secure endpoint.
                </div>
              </div>

              <div className="form-row">
                <Field label="PF Number">
                  <input
                    id="emp-pf"
                    className="form-input"
                    value={statutory.pf_number}
                    onChange={(e) => setStat("pf_number", e.target.value)}
                    placeholder="MHBAN00123450000001"
                  />
                </Field>
                <Field label="ESI Number">
                  <input
                    id="emp-esi"
                    className="form-input"
                    value={statutory.esi_number}
                    onChange={(e) => setStat("esi_number", e.target.value)}
                    placeholder="31-00-123456-000-0001"
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="UAN Number">
                  <input
                    id="emp-uan"
                    className="form-input"
                    value={statutory.uan}
                    onChange={(e) => setStat("uan", e.target.value)}
                    placeholder="100123456789"
                  />
                </Field>
                <Field label="PAN">
                  <input
                    id="emp-pan"
                    className="form-input"
                    value={statutory.pan}
                    onChange={(e) => setStat("pan", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </Field>
              </div>

              <Field label="Aadhaar Number">
                <input
                  id="emp-aadhaar"
                  className="form-input"
                  value={statutory.aadhaar}
                  onChange={(e) => setStat("aadhaar", e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                />
              </Field>

              <hr className="section-divider" />
              <h4 style={{ marginBottom: "var(--sp-md)" }}>Bank Details</h4>

              <div className="form-row">
                <Field label="Bank Name">
                  <input
                    id="emp-bank"
                    className="form-input"
                    value={statutory.bank_name}
                    onChange={(e) => setStat("bank_name", e.target.value)}
                    placeholder="State Bank of India"
                  />
                </Field>
                <Field label="Account Number">
                  <input
                    id="emp-acct"
                    className="form-input"
                    value={statutory.bank_account}
                    onChange={(e) => setStat("bank_account", e.target.value)}
                    placeholder="00000012345678"
                  />
                </Field>
              </div>

              <Field label="IFSC Code">
                <input
                  id="emp-ifsc"
                  className="form-input"
                  style={{ maxWidth: 300 }}
                  value={statutory.bank_ifsc}
                  onChange={(e) => setStat("bank_ifsc", e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
              </Field>
            </div>
          )}

          {/* ════════════════ STEP 3: ADDRESS ════════════════ */}
          {step === 3 && (
            <div className="animate-slide">
              <h3 style={{ marginBottom: "var(--sp-lg)" }}>Address Details</h3>

              <Field label="Current Address">
                <textarea
                  id="emp-addr"
                  className="form-textarea"
                  rows={3}
                  value={form.current_address || ""}
                  onChange={(e) => set("current_address", e.target.value)}
                  placeholder="Flat / House No, Street, Area..."
                />
              </Field>

              <div className="form-row-3">
                <Field label="City">
                  <input
                    id="emp-city"
                    className="form-input"
                    value={form.city || ""}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Mumbai"
                  />
                </Field>
                <Field label="State">
                  <input
                    id="emp-state"
                    className="form-input"
                    value={form.state || ""}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="Maharashtra"
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    id="emp-pin"
                    className="form-input"
                    value={form.pincode || ""}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder="400001"
                    maxLength={6}
                  />
                </Field>
              </div>

              <Field label="Country">
                <input
                  id="emp-country"
                  className="form-input"
                  style={{ maxWidth: 260 }}
                  value={form.country || "India"}
                  onChange={(e) => set("country", e.target.value)}
                />
              </Field>

              <hr className="section-divider" />
              <h4 style={{ marginBottom: "var(--sp-md)" }}>Emergency Contact</h4>

              <div className="form-row-3">
                <Field label="Name">
                  <input
                    id="emp-emergency-name"
                    className="form-input"
                    value={form.emergency_name || ""}
                    onChange={(e) => set("emergency_name", e.target.value)}
                    placeholder="Contact name"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    id="emp-emergency-phone"
                    className="form-input"
                    value={form.emergency_phone || ""}
                    onChange={(e) => set("emergency_phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Relation">
                  <input
                    id="emp-emergency-relation"
                    className="form-input"
                    value={form.emergency_relation || ""}
                    onChange={(e) => set("emergency_relation", e.target.value)}
                    placeholder="Spouse / Parent / Sibling"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Navigation ── */}
        <div className="modal-footer" style={{ padding: "var(--sp-md) var(--sp-lg)" }}>
          <button className="btn btn-ghost" onClick={goBack}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          <div style={{ display: "flex", gap: "var(--sp-sm)", alignItems: "center" }}>
            {step < STEPS.length - 1 ? (
              <button id="btn-next-step" className="btn btn-primary" onClick={goNext}>
                Next →
              </button>
            ) : (
              <button
                id="btn-save-employee"
                className="btn btn-primary btn-lg"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving...
                  </>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
