import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "admin",
    password: "Admin@1234",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="login-layout-image">
      {/* LEFT PANEL - Hero Content */}
      <div className="image-visual-panel">

        <div className="image-visual-content">
          <div className="image-brand-header stagger-1">
            <img src="/Dayton.png" alt="Dayton Logo" className="image-logo" />
            <span className="image-brand-name">Dayton Natural Resource</span>
          </div>

          <div className="image-hero-text">
            <h1 className="image-headline stagger-2">
              Empower Your Workforce
            </h1>

            <div className="features-grid stagger-3">
              <div className="feature-card">
                <span className="feature-icon">👥</span>
                <h4>Unified HR</h4>
                <p>Simplify operations and scale effortlessly.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">⚡</span>
                <h4>Payroll</h4>
                <p>Accurate, tax-compliant automated payouts.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📈</span>
                <h4>Analytics</h4>
                <p>Deep insights and predictive reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="image-form-panel">
        <div className="image-form-wrapper">
          <div className="image-form-header stagger-1">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} id="login-form" className="modern-form">
            <div className="form-group stagger-2">
              <label className="form-label-caps" htmlFor="username">
                USERNAME
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  className="form-input-modern"
                  placeholder="admin"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group stagger-3">
              <label className="form-label-caps" htmlFor="password">
                PASSWORD
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className="form-input-modern"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-options stagger-4">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-modern-primary w-full stagger-5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
