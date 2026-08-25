import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { employeesApi } from "../../api";
import toast from "react-hot-toast";
import { Search, UserPlus, Info, Trash2, User } from "lucide-react";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const statusFilter = searchParams.get('status') || 'all';

  const load = async () => {
    setLoading(true);
    try {
      const data = await employeesApi.list({
        search: search || null,
      });
      setEmployees(data);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const isActive = emp.status === 'Active';
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'inactive' && isActive) return false;
    return true;
  });

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-header-left">
          <h1>Employees</h1>
          <p>Manage your organization's workforce</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select 
            className="form-select" 
            style={{ borderRadius: "100px", padding: "0.5rem 1rem", border: "1px solid var(--clr-border)", outline: "none", cursor: "pointer", background: "var(--clr-bg-input)", color: "var(--clr-text-primary)" }}
            value={statusFilter}
            onChange={(e) => setSearchParams(e.target.value === 'all' ? {} : { status: e.target.value })}
          >
            <option value="all">All Employees</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <div className="input-wrapper" style={{ position: "relative", minWidth: "250px", marginBottom: 0 }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--clr-text-muted)" }} />
            <input 
              type="text" 
              className="form-input"
              placeholder="Search by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              style={{ paddingLeft: "2.5rem", borderRadius: "100px", margin: 0 }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/admin/employees/create")}>
            <UserPlus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>
            <span className="spinner" style={{ marginRight: "0.5rem" }}></span> Loading employees...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>#</th>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Location</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.id}>
                    <td style={{ textAlign: "center", color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>
                      {(index + 1).toString().padStart(3, "0")}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ 
                          width: "40px", height: "40px", 
                          borderRadius: "50%", 
                          background: "var(--clr-bg-input)", 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--clr-text-muted)",
                          position: "relative"
                        }}>
                          <User size={20} />
                          {/* Active Status Badge directly on Avatar */}
                          <div style={{
                            position: "absolute",
                            bottom: 0, right: 0,
                            width: "12px", height: "12px",
                            borderRadius: "50%",
                            background: emp.status === 'Active' ? "var(--clr-success)" : "var(--clr-text-muted)",
                            border: "2px solid var(--clr-bg-card)"
                          }}></div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>{emp.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{emp.employee_code}</span></td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.designation || "-"}</td>
                    <td>{emp.location || "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button 
                          className="btn"
                          onClick={() => navigate(`/admin/employees/${emp.id}`)} 
                          style={{ padding: "0.5rem", background: "var(--clr-bg-input)", color: "var(--clr-text-primary)", border: "none" }}
                          title="View Details"
                        >
                          <Info size={18} />
                        </button>
                        <button 
                          className="btn"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to completely delete this employee? This action cannot be undone.')) {
                              try {
                                await employeesApi.remove(emp.id);
                                toast.success("Employee deleted");
                                load();
                              } catch (err) {
                                toast.error("Failed to delete employee");
                              }
                            }
                          }}
                          style={{ padding: "0.5rem", background: "rgba(220,38,38,0.1)", color: "var(--clr-danger)", border: "none" }}
                          title="Delete Employee"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>
                      No employees found. <button className="btn btn-link" onClick={() => navigate("/admin/employees/create")} style={{ padding: 0, background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Create one now</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
