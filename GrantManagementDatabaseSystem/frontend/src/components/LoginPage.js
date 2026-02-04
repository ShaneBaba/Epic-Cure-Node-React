import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Popup from "./Popup";
import "./LoginPage.css";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

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
    console.log("API base:", API);
    console.log("Login URL:", `${API}/api/login`);
    
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-center">
        <main className="login-grid">
          {/* Mission Section */}
          <section className="login-mission login-glass">
            <h1 className="login-brand">Epic Cure</h1>
            <h2 className="login-h2">Mission Statement</h2>
            <p className="login-p">
              Epic Cure reduces food waste and fights hunger by rescuing surplus
              goods and delivering them to families in need.
            </p>
            <p className="login-p">
              Through volunteer power and strong partnerships, we nourish people,
              protect the environment, and strengthen our community.
            </p>

            <div className="login-footer-row">
              <a href="/contact" className="login-footer-link">Contact</a>
              <span className="login-footer-spacer" />
              <a href="https://instagram.com/epic-cure" className="login-footer-link">
                @epic-cure
              </a>
              <span className="login-footer-spacer" />
              <a href="/socials" className="login-footer-link">Socials</a>
            </div>
          </section>

          {/* Login Card */}
          <section className="login-card login-glass">
            <div className="login-card-head">
              <div className="login-card-brand">Epic Cure</div>
              <h3 className="login-card-title">Login</h3>
            </div>

            {user ? (
              <>
                <p className="login-signed-in-text">
                  Signed in as <b>{user.username}</b>
                </p>
                <div className="login-btn-row">
                  <button className="login-btn-secondary" onClick={handleLogout}>
                    Sign out
                  </button>
                  <Link to="/documents" className="login-btn-link">
                    Documents
                  </Link>
                  <Link to="/grants" className="login-btn-link">
                    Grants
                  </Link>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleLogin} noValidate className="login-form">
                  <label className="login-label">
                    Username
                    <input
                      className="login-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                      placeholder="JohnDoe"
                    />
                  </label>

                  <label className="login-label">
                    Password
                    <input
                      className="login-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                    />
                  </label>

                  {error && (
                    <div role="alert" className="login-error">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="login-btn-primary"
                  >
                    {submitting ? "Logging in…" : "Login"}
                  </button>
                </form>

                <div className="login-register-row">
                  <span>Don't have an account?</span>{" "}
                  <button
                    className="login-link-btn"
                    onClick={() => setShowRegister(true)}
                  >
                    Register
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Registration Popup */}
      <Popup
        open={showRegister}
        initialMode="register"
        onClose={() => setShowRegister(false)}
        onAuthed={(u) => {
          localStorage.setItem("authUser", JSON.stringify(u));
          setUser(u);
          setShowRegister(false);
        }}
      />
    </div>
  );
}
