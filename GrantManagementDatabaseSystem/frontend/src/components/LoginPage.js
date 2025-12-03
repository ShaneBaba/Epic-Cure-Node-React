import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Popup from "./Popup"; 

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
        credentials: "include",
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
    <div style={sx.shell}>
      {}
      <div style={sx.center}>
        {}
        <main style={sx.grid}>
          {}
          <section style={sx.mission}>
            <h1 style={sx.brand}>Epic Cure</h1>
            <h2 style={sx.h2}>Mission Statement</h2>
            <p style={sx.p}>
              Epic Cure reduces food waste and fights hunger by rescuing surplus
              goods and delivering them to families in need.
            </p>
            <p style={sx.p}>
              Through volunteer power and strong partnerships, we nourish people,
              protect the environment, and strengthen our community.
            </p>

            <div style={sx.footerRow}>
              <a href="/contact" style={sx.footerLink}>Contact</a>
              <span style={{ flex: 1 }} />
              <a href="https://instagram.com/epic-cure" style={sx.footerLink}>@epic-cure</a>
              <span style={{ flex: 1 }} />
              <a href="/socials" style={sx.footerLink}>Socials</a>
            </div>
          </section>

          {}
          <section style={sx.card}>
            <div style={sx.cardHead}>
              <div style={sx.cardBrand}>Epic Cure</div>
              <h3 style={{ margin: 0 }}>Login</h3>
            </div>

            {user ? (
              <>
                <p style={{ marginTop: 0 }}>
                  Signed in as <b>{user.username}</b>
                </p>
                <div style={sx.btnRow}>
                  <button style={sx.btnSecondary} onClick={handleLogout}>Sign out</button>
                  <Link to="/documents" style={sx.btnLink}>Documents</Link>
                  <Link to="/grants" style={sx.btnLink}>Grants</Link>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleLogin} noValidate style={sx.form}>
                  <label style={sx.label}>
                    Username
                    <input
                      style={sx.input}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                      placeholder="yourname"
                    />
                  </label>

                  <label style={sx.label}>
                    Password
                    <input
                      style={sx.input}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                    />
                  </label>

                  {error && <div role="alert" style={sx.error}>{error}</div>}

                  <button type="submit" disabled={submitting} style={sx.btnPrimary}>
                    {submitting ? "Logging in…" : "Login"}
                  </button>
                </form>

                <div style={sx.registerRow}>
                  <span>Don’t have an account?</span>{" "}
                  <button style={sx.linkBtn} onClick={() => setShowRegister(true)}>
                    Register
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {}
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

const brand = "#38bdf8";   
const brand2 = "#8b5cf6";
const ink = "#0f172a";     

const glass = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.35)",
  boxShadow: "0 20px 60px rgba(2,6,23,.20)",
  borderRadius: 18,
};

const panelPad = { padding: 28 };

const sx = {
  
  shell: {
    minHeight: "100vh",
    margin: 0,
    background:
      `linear-gradient(135deg, ${brand} 0%, ${brand2} 48%, #0b1020 100%)`,
    color: ink,
  },

  
  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },

  
  grid: {
    width: "min(1120px, 100%)",
    display: "grid",
    gridTemplateColumns: "1.15fr .85fr",
    gap: 28,
  },

  
  mission: {
    ...glass,
    ...panelPad,
  },
  brand: { margin: 0, fontSize: 44, letterSpacing: 0.3 },
  h2: { margin: "8px 0 14px", color: "#475569", fontWeight: 700 },
  p: { margin: "10px 0", lineHeight: 1.6 },
  footerRow: {
    marginTop: 20,
    paddingTop: 14,
    borderTop: "1px solid rgba(148,163,184,.35)",
    display: "flex",
    gap: 14,
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLink: { color: ink, textDecoration: "none", fontWeight: 600 },


  card: {
    ...glass,
    ...panelPad,
  },
  cardHead: { display: "flex", gap: 10, alignItems: "baseline", marginBottom: 10 },
  cardBrand: { color: brand, fontWeight: 800, letterSpacing: 0.2 },

  form: { display: "grid", gap: 12, marginTop: 8 },
  label: { fontSize: 14, color: "#475569", display: "grid", gap: 8 },
  input: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 16,
    outline: "none",
    background: "#fff",
  },
  btnPrimary: {
    marginTop: 6,
    width: "100%",
    border: 0,
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#0ea5e9",
    color: "#fff",
    boxShadow: "0 6px 18px rgba(14,165,233,.35)",
  },
  btnSecondary: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnLink: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    padding: "10px 14px",
    textDecoration: "none",
    color: ink,
    fontWeight: 600,
  },
  btnRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
  },
  registerRow: { marginTop: 12, fontSize: 14, color: "#334155" },
  linkBtn: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#0ea5e9",
    cursor: "pointer",
    fontWeight: 700,
    textDecoration: "underline",
  },

  
  "@media(maxWidth:860px)": {}, 
};


