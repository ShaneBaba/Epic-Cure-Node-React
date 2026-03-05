import React, { useState } from "react";
import "./Dashboard.css"; // or whatever your dashboard page uses
import "./GrantList.css"; // optional if it shares card styles

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function AdminToolsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("GRANT_WRITER");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function inviteUser(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const resp = await fetch(`${API_BASE}/api/admin/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          role,
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Invite failed.");
      } else {
        setSuccess(data?.message || "Invite sent!");
        setEmail("");
        setRole("GRANT_WRITER");
      }
    } catch {
      setError("Network error. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grant-page">
      <h2>Admin Tools</h2>

      <div className="popup" style={{ maxWidth: 520 }}>
        <h3>Invite User</h3>

        <form onSubmit={inviteUser}>
          <div className="input-row">
            <label>Email</label>
            <input
              type="email"
              placeholder="newuser@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-row">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="GRANT_WRITER">Grant Writer</option>
              <option value="ADMIN">Admin</option>
            </select>
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
                marginTop: "0.75rem",
              }}
            >
              {success}
            </div>
          ) : null}

          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}