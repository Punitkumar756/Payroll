import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "admin",
    password: "[PASSWORD]",
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      // Read role from localStorage after login
      const stored = localStorage.getItem("hrms_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "HR" || user.role === "Manager") {
          navigate("/admin/dashboard");
        } else {
          navigate("/self-service/dashboard");
        }
      }
      toast.success("Welcome back!");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Invalid username or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-slide">
        <div className="login-logo">
          <div className="login-logo-icon">🏢</div>
          <h1>HRMS Portal</h1>
          <p>Dayton Natural Resource Pvt Ltd</p>
        </div>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                style={{ paddingRight: 40 }}
              />

              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--clr-text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ justifyContent: "center", marginTop: "var(--sp-md)" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18 }} />{" "}
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <p
          className="text-muted text-center"
          style={{ marginTop: "var(--sp-lg)", fontSize: "0.78rem" }}
        >
          Single-organization HRMS v1.1 — Powered by Dayton Natural Resource Pvt
          Ltd
        </p>
      </div>
    </div>
  );
}
