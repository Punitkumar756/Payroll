import React, { useEffect, useState } from "react";
import { usersApi } from "../../api";
import toast from "react-hot-toast";
import { Shield, ShieldOff, Check, X } from "lucide-react";

export default function UsersRolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus) await usersApi.deactivate(id);
      else await usersApi.activate(id);
      toast.success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update user status");
    }
  };

  const handleRoleChange = async (id, roleId) => {
    try {
      await usersApi.assignRole(id, roleId);
      toast.success("Role updated successfully");
      load();
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users & Roles</h1>
          <p>Manage system access, permissions, and security</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>
            <span className="spinner" style={{ marginRight: "0.5rem" }} /> Loading users...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: "1.5rem" }}>User</th>
                  <th>Employee Profile</th>
                  <th style={{ width: "200px" }}>Role Access</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: "1.5rem" }}>
                      <div style={{ fontWeight: 600 }}>{u.username}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>ID: {u.id}</div>
                    </td>
                    <td>
                      {u.employee_name ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 500 }}>{u.employee_name}</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>{u.employee_code}</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--clr-text-muted)", fontStyle: "italic" }}>No linked profile</span>
                      )}
                    </td>
                    <td>
                      <div className="input-wrapper" style={{ margin: 0 }}>
                        <select
                          className="form-select"
                          value={u.role_id}
                          onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                          style={{ padding: "0.5rem 1rem", borderRadius: "100px", background: "var(--clr-bg-input)", border: "1px solid var(--clr-border)" }}
                        >
                          <option value={1}>Administrator</option>
                          <option value={2}>Manager</option>
                          <option value={3}>Employee</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="badge" style={{ background: "rgba(22, 163, 74, 0.1)", color: "var(--clr-success)" }}>
                          <Check size={14} style={{ marginRight: "4px" }} /> Active
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(100, 116, 139, 0.1)", color: "var(--clr-text-muted)" }}>
                          <X size={14} style={{ marginRight: "4px" }} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "1.5rem" }}>
                      <button
                        className="btn"
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        style={{ 
                          background: u.is_active ? "rgba(220,38,38,0.05)" : "rgba(22,163,74,0.05)",
                          color: u.is_active ? "var(--clr-danger)" : "var(--clr-success)",
                          border: "none",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          padding: "0.5rem 1rem",
                          borderRadius: "100px"
                        }}
                      >
                        {u.is_active ? (
                          <><ShieldOff size={16} style={{ marginRight: "6px" }} /> Revoke Access</>
                        ) : (
                          <><Shield size={16} style={{ marginRight: "6px" }} /> Grant Access</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--clr-text-muted)" }}>
                      No users found.
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
