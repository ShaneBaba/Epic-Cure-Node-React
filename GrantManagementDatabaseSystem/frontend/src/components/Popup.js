import React, { useState } from "react";

export default function AuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);


    const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${API}/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || `HTTP ${res.status}`);
      } else {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        onAuthed?.(data.user);
        onClose();
      }
    } catch (err) {
      setError("Network error: could not reach backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{mode === "login" ? "Login" : "Create Account"}</h2>
          <button onClick={onClose} style={xStyle}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={errStyle}>{error}</p>}
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>
        <p style={{ marginTop: 10 }}>
          {mode === "login" ? (
            <>Don’t have an account?{" "}
              <button onClick={() => setMode("register")} style={linkBtn}>Register</button></>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} style={linkBtn}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}

const backdropStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalStyle = { background: "#fff", padding: 20, borderRadius: 8, width: 300 };
const inputStyle = { width: "100%", padding: 8, marginTop: 8, borderRadius: 4, border: "1px solid #ccc" };
const btnStyle = { width: "100%", marginTop: 12, padding: 10, background: "#111827", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const errStyle = { color: "red", fontSize: 14, marginTop: 8 };
const xStyle = { border: "none", background: "transparent", fontSize: 20, cursor: "pointer" };
const linkBtn = { border: "none", background: "transparent", color: "#2563eb", cursor: "pointer", padding: 0 };
