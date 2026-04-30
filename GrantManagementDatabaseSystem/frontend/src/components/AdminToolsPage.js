import React, { useState, useEffect } from "react";
import "./AdminToolsPage.css";
import Sidebar from "./Sidebar";
import ManageGrantCategories from "./manageGrantCategories";
import ManageFAQCategories from "./manageFAQCategories";
import ManageUsers from "./ManageUsers";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function AdminToolsPage() {
const [inviteExpanded, setInviteExpanded] = useState(false);
  const token = localStorage.getItem("authToken");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("GRANT_WRITER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [types, setTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeSuccess, setTypeSuccess] = useState("");
  const [typeError, setTypeError] = useState("");
  const [typesExpanded, setTypesExpanded] = useState(false); 
  const [deletingTypeId, setDeletingTypeId] = useState(null);
  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    try {
      const res = await fetch(`${API_BASE}/api/document-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTypes(Array.isArray(data) ? data : []);
    } catch {
      setTypeError("Failed to load types.");
    }
  }

  async function inviteUser(e) {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setInviteLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/admin/invite`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setInviteError(data?.message || "Invite failed.");
      } else {
        setInviteSuccess(data?.message || "Invite sent!");
        setEmail("");
        setRole("GRANT_WRITER");
      }
    } catch {
      setInviteError("Network error. Check the server and try again.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleAddType(e) {
    e.preventDefault();
    setTypeError("");
    setTypeSuccess("");
    if (!newTypeName.trim()) return setTypeError("Type name is required.");
    setTypeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/document-types`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ typeName: newTypeName.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTypeError(data?.message || "Failed to add type.");
      } else {
        setTypeSuccess("Type added successfully!");
        setNewTypeName("");
        fetchTypes();
      }
    } catch {
      setTypeError("Network error.");
    } finally {
      setTypeLoading(false);
    }
  }

  async function handleEditType(e) {
    e.preventDefault();
    setTypeError("");
    setTypeSuccess("");
    if (!editTypeName.trim()) return setTypeError("Type name is required.");
    setTypeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/document-types/${editingType.type_id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ typeName: editTypeName.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTypeError(data?.message || "Failed to update type.");
      } else {
        setTypeSuccess("Type updated successfully!");
        setEditingType(null);
        setEditTypeName("");
        fetchTypes();
      }
    } catch {
      setTypeError("Network error.");
    } finally {
      setTypeLoading(false);
    }
  }

  async function handleDeleteType(type) {
    setTypeError("");
    setTypeSuccess("");

    if (!window.confirm(`Are you sure you want to delete "${type.type_name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/document-types/${type.type_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
      setDeletingTypeId(type.type_id);
      setTypeError(data?.message || "Failed to delete type.");
    } else {
      setDeletingTypeId(null);
      setTypeSuccess("Type deleted successfully!");
      fetchTypes();
    }
    } catch {
      setTypeError("Network error.");
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="admin-page">
        <div className="admin-header">
        <div className="admin-header-content">
          <h2 className="admin-title">ADMIN TOOLS</h2>
          <div className="admin-title-underline"></div>
        </div>
      </div>

        <div className="admin-card">
  <h3
    className="admin-collapsible-header"
    onClick={() => setInviteExpanded((prev) => !prev)}
  >
    Invite User
    <span className="admin-collapse-icon">
      {inviteExpanded ? "▲" : "▼"}
    </span>
  </h3>

  {inviteExpanded && (
    <>
      {inviteError && <div className="admin-error">{inviteError}</div>}
      {inviteSuccess && <div className="admin-success">{inviteSuccess}</div>}

      <form onSubmit={inviteUser}>
        <div className="admin-form-row">
          <label>Email</label>
          <input
            type="email"
            placeholder="newuser@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="admin-form-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="GRANT_WRITER">Grant Writer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="admin-actions" style={{ marginTop: "1rem" }}>
          <button className="admin-btn-primary" type="submit" disabled={inviteLoading}>
            {inviteLoading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>
    </>
  )}
</div>

        <ManageUsers />

        <div className="admin-card">
          <h3
            className="admin-collapsible-header"
            onClick={() => setTypesExpanded((prev) => !prev)}
          >
            Manage Document Types
            <span className="admin-collapse-icon">{typesExpanded ? "▲" : "▼"}</span>
          </h3>

          {typesExpanded && (
            <>
              {typeSuccess && <div className="admin-success">{typeSuccess}</div>}

              <form onSubmit={handleAddType} className="admin-add-row">
                <input
                  placeholder="New type name..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
                <button className="admin-btn-primary" type="submit" disabled={typeLoading}>
                  Add
                </button>
              </form>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type Name</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((type) => (
                    <React.Fragment key={type.type_id}>
                      <tr>
                        <td>
                          {editingType?.type_id === type.type_id ? (
                            <input
                              value={editTypeName}
                              onChange={(e) => setEditTypeName(e.target.value)}
                            />
                          ) : (
                            type.type_name
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            {editingType?.type_id === type.type_id ? (
                              <>
                                <button
                                  className="admin-btn-primary"
                                  onClick={handleEditType}
                                  disabled={typeLoading}
                                >
                                  Save
                                </button>
                                <button
                                  className="admin-btn-secondary"
                                  onClick={() => {
                                    setEditingType(null);
                                    setEditTypeName("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="admin-btn-primary"
                                  onClick={() => {
                                    setEditingType(type);
                                    setEditTypeName(type.type_name);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="admin-btn-danger"
                                  onClick={() => handleDeleteType(type)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {typeError && deletingTypeId === type.type_id && (
                        <tr>
                          <td colSpan={2}>
                            <div className="admin-error" style={{ marginTop: "0.5rem" }}>
                              {typeError}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {types.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", color: "#6b7280" }}>
                        No types found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
              </div>
              <ManageGrantCategories />
              <ManageFAQCategories />
      </main>
    </div>
  );
}