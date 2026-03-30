import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-shell">

      {/* ── Left: Mission panel ── */}
      <section className="login-mission">
        <div className="login-mission-top">
          <h1 className="login-brand">Epic-Cure</h1>
          <p className="login-brand-sub">Grant Management System</p>
        </div>

        <div className="login-mission-middle">
          <h2 className="login-h2">Eliminating, Feeding & Teaching </h2>
          <p className="login-p">
            WHAT WE DO
          </p>
          <p className="login-p">
            Eliminate food waste and hunger through food rescue and distribution and leverage 
            senior citizens to teach children safely prepare meals, providing them with practicals 
            life skills and self-confidence from real achievement, while simultaneously connecting generations through a shared purpose.
          </p>
        </div>

        <div className="login-mission-bottom">
          <a href="https://www.epic-cure.org" className="login-footer-link" target="_blank" rel="noopener noreferrer">
            epic-cure.org
          </a>
          <Link to="/forgot-password" className="login-footer-link">
            Need help?
          </Link>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          <div className="login-card-head">
            <h3 className="login-card-title">Epic-Cure<br /><span>Login.</span></h3>
          </div>

          {!user ? (
            <form onSubmit={handleLogin} noValidate className="login-form">
              <label className="login-label">
                Email address
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="login-label">
                Password
                <input
                  className="login-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {error && <div role="alert" className="login-error">{error}</div>}

              <button type="submit" disabled={submitting} className="login-btn-primary">
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <div className="login-register-row">
                <Link className="login-forgot-link" to="/forgot-password">
                  Forgot your password?
                </Link>
              </div>
            </form>
          ) : (
            <div className="login-signed-in-text">
              Logging you in…
              <button className="login-btn-secondary" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}