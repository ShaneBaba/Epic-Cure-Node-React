import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
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
        body: JSON.stringify({ username, password }),
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
      <div className="login-center">
        <main className="login-grid">
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
          </section>

          <section className="login-card login-glass">
            <div className="login-card-head">
              <div className="login-card-brand">Epic Cure</div>
              <br />
              <h3 className="login-card-title">Login</h3>
            </div>

            {!user && (
              <form onSubmit={handleLogin} noValidate className="login-form">
                <label className="login-label">
                  Username
                  <input
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
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
            )}

            {user && (
              <div className="login-signed-in-text">
                Logging you in…

                <button
                  className="login-btn-secondary"
                  onClick={handleLogout}
                  style={{ marginLeft: 12 }}
                >
                  Sign out
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
