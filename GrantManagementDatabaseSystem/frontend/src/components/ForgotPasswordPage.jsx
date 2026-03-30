import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step control
  const [step, setStep] = useState("REQUEST"); // REQUEST | RESET

  // Inputs
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // 6-digit
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const eNorm = email.trim().toLowerCase();
    if (!eNorm) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: eNorm }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Something went wrong.");
        return;
      }

      // Even if email doesn't exist, backend should respond generically.
      setSuccess(data?.message || "If an account exists, we emailed you a 6-digit code.");
      setStep("RESET"); // ✅ switch UI to code+password
    } catch {
      setError("Network error. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const eNorm = email.trim().toLowerCase();
    const cNorm = code.trim();

    if (!eNorm) {
      setError("Email is required.");
      return;
    }
    if (!/^\d{6}$/.test(cNorm)) {
      setError("Code must be exactly 6 digits.");
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
        body: JSON.stringify({ email: eNorm, code: cNorm, password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Reset failed. Request a new code and try again.");
        return;
      }

      setSuccess(data?.message || "Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch {
      setError("Network error. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToEmail() {
    setError("");
    setSuccess("");
    setCode("");
    setPassword("");
    setConfirm("");
    setStep("REQUEST");
  }

  return (
    <AuthShell cardTitle="Forgot Password.">
      {step === "REQUEST" ? (
        <>
          <p className="login-p" style={{ marginTop: 0 }}>
            Enter your email and we’ll send you a 6-digit reset code.
          </p>

          <form className="login-form" onSubmit={handleSendCode}>
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

            <button className="login-btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>

            <div className="login-btn-row">
              <Link className="login-btn-link" to="/login">
                Back to Login
              </Link>
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            {success ? (
              <div className="login-success">
                {success}
              </div>
            ) : null}
          </form>
        </>
      ) : (
        <>
          <p className="login-p" style={{ marginTop: 0 }}>
            Enter the 6-digit code we emailed you and choose a new password.
            <br />
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Codes expire in 10 minutes.
            </span>
          </p>

          <form className="login-form" onSubmit={handleResetPassword}>
            <label className="login-label">
              Email
              <input
                className="login-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="login-label">
              6-Digit Code
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

            <button className="login-btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>

            <div className="login-btn-row">
              <button
                type="button"
                className="login-btn-secondary"
                onClick={handleBackToEmail}
              >
                Use Different Email
              </button>

              <button
                type="button"
                className="login-btn-secondary"
                onClick={() => setStep("REQUEST")}
              >
                Resend Code
              </button>

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
        </>
      )}
    </AuthShell>
  );
}