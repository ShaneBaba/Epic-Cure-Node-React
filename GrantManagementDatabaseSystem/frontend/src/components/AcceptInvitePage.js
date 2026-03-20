import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import Sidebar from "./Sidebar";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function AcceptInvitePage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // 6-digit
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function validateUsername(u) {
    const v = (u || "").trim();
    if (!v) return "Username is required.";
    if (v.length < 3) return "Username must be at least 3 characters.";
    if (v.length > 30) return "Username must be 30 characters or less.";
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) {
      return "Username can only use letters, numbers, dot, dash, and underscore.";
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const eNorm = email.trim().toLowerCase();
    const cNorm = code.trim();
    const uNorm = username.trim();

    if (!eNorm) {
      setError("Email is required.");
      return;
    }

    if (!/^\d{6}$/.test(cNorm)) {
      setError("Invite code must be exactly 6 digits.");
      return;
    }

    const usernameError = validateUsername(uNorm);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: eNorm,
          code: cNorm,
          username: uNorm,
          password,
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(
          data?.message ||
            "Invite code is invalid or expired. Ask an admin to resend your invite."
        );
      } else {
        setSuccess(data?.message || "Invitation accepted. You can now log in.");
        setTimeout(() => navigate("/login"), 900);
      }
    } catch {
      setError("Network error. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell cardTitle="Accept Invitation">
      <p className="login-p" style={{ marginTop: 0 }}>
        Enter your invite code, choose a username, and set your password to activate your Epic Cure
        account.
        <br />
        <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Invite codes expire in 8 hours.
        </span>
      </p>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="login-label">
          Email
          <input
            className="login-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="login-label">
          6-Digit Invite Code
          <input
            className="login-input"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>

        <label className="login-label">
          Username
          <input
            className="login-input"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="login-label">
          Create Password
          <input
            className="login-input"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label className="login-label">
          Confirm Password
          <input
            className="login-input"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <button className="login-btn-primary" disabled={loading}>
          {loading ? "Activating..." : "Accept Invite"}
        </button>

        <div className="login-btn-row">
          <Link className="login-btn-link" to="/login">
            Back to Login
          </Link>
        </div>

        {error ? <div className="login-error">{error}</div> : null}

        {success ? (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              padding: "0.75rem",
              fontSize: "0.875rem",
            }}
          >
            {success}
          </div>
        ) : null}
      </form>
    </AuthShell>
  );
}