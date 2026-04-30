import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function ManageUsers() {
  const token = localStorage.getItem("authToken");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to load users.");
        setUsers([]);
        return;
      }

      const hydrated = Array.isArray(data)
        ? data.map((user) => ({
            ...user,
            pendingRole: user.role,
          }))
        : [];

      setUsers(hydrated);
    } catch {
      setError("Failed to load users.");
      setUsers([]);
    }
  }

  function handleRoleChange(userId, newRole) {
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === userId ? { ...user, pendingRole: newRole } : user
      )
    );
  }

  async function handleSaveRole(user) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.user_id}/role`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ role: user.pendingRole }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to update role.");
      } else {
        setSuccess(data?.message || "Role updated successfully.");
        fetchUsers();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(user) {
    setError("");
    setSuccess("");

    const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const actionLabel = newStatus === "DISABLED" ? "disable" : "enable";

    if (!window.confirm(`Are you sure you want to ${actionLabel} ${user.email}?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.user_id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to update status.");
      } else {
        setSuccess(data?.message || "User status updated successfully.");
        fetchUsers();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 NEW FUNCTION: Delete invited users
  async function handleDeleteInvitedUser(user) {
    setError("");
    setSuccess("");

    if (user.status !== "INVITED") {
      setError("Only invited users can be deleted.");
      return;
    }

    if (!window.confirm(`Delete invite for ${user.email}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.user_id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to delete invited user.");
      } else {
        setSuccess(data?.message || "Invited user deleted successfully.");
        fetchUsers();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`admin-card ${expanded ? "admin-card-wide" : ""}`}>
      <h3
        className="admin-collapsible-header"
        onClick={() => setExpanded((prev) => !prev)}
      >
        Manage Users
        <span className="admin-collapse-icon">{expanded ? "▲" : "▼"}</span>
      </h3>

      {expanded && (
        <>
          {error && <div className="admin-error">{error}</div>}
          {success && <div className="admin-success">{success}</div>}

          <div className="admin-table-wrap">
            <table className="admin-table admin-users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.username || "-"}</td>
                    <td>{user.email}</td>

                    <td>
                      <select
                        value={user.pendingRole || user.role}
                        onChange={(e) =>
                          handleRoleChange(user.user_id, e.target.value)
                        }
                      >
                        <option value="GRANT_WRITER">Grant Writer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={`admin-status-badge ${
                          user.status === "ACTIVE"
                            ? "is-active"
                            : user.status === "DISABLED"
                            ? "is-disabled"
                            : "is-invited"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-user-actions">
                        <button
                          className="admin-btn-primary"
                          onClick={() => handleSaveRole(user)}
                          disabled={loading || user.pendingRole === user.role}
                        >
                          Save Role
                        </button>

                        {user.status === "INVITED" ? (
                          <>
                            <span className="admin-status-note">Awaiting Invite</span>

                            <button
                              className="admin-btn-danger"
                              onClick={() => handleDeleteInvitedUser(user)}
                              disabled={loading}
                            >
                              Delete Invite
                            </button>
                          </>
                        ) : (
                          <button
                            className={
                              user.status === "ACTIVE"
                                ? "admin-btn-danger"
                                : "admin-btn-secondary"
                            }
                            onClick={() => handleToggleStatus(user)}
                            disabled={loading}
                          >
                            {user.status === "ACTIVE" ? "Disable" : "Enable"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageUsers;