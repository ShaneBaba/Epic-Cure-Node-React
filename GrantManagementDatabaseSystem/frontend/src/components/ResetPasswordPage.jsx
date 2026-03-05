import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const token = query.get("token") || "";
  const tokenMissing = !token;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tokenMissing) {
      setError("Reset token is missing. Please use the link from your email.");
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
      const resp = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(
          data?.message || "Reset failed. Request a new link and try again."
        );
      } else {
        setSuccess(data?.message || "Password updated.");
        setTimeout(() => navigate("/login"), 800);
      }
    } catch {
      setError("Network error. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell cardTitle="Reset Password">
      <p className="login-p" style={{ marginTop: 0 }}>
        Create a new password for your account.
      </p>

      {tokenMissing ? (
        <div className="login-error">
          Token missing. Please use the reset link from your email, or request a
          new one.
        </div>
      ) : null}

      <form className="login-form" onSubmit={onSubmit}>
        <label className="login-label">
          New Password
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

        <button className="login-btn-primary" disabled={loading || tokenMissing}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        <div className="login-btn-row">
          <Link className="login-btn-link" to="/forgot-password">
            Request New Link
          </Link>
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