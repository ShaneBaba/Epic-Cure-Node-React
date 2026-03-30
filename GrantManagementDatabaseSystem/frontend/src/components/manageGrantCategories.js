import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function ManageGrantCategories() {
    const token = localStorage.getItem("authToken");

    const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const [categories, setCategories] = useState([]);
    const [newName, setNewName] = useState("");
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch(`${API_BASE}/api/grant-categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load categories.");
        }
    }

    async function handleAdd(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newName.trim()) {
            return setError("Category name is required.");
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/grant-categories`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ name: newName.trim() }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.message || "Failed to add category.");
            } else {
                setSuccess("Category added!");
                setNewName("");
                fetchCategories();
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
        fetchCategories();
        window.dispatchEvent(new Event("categoriesUpdated"));
    }

    async function handleEdit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!editName.trim()) {
            return setError("Category name is required.");
        }

        setLoading(true);

        try {
            const res = await fetch(
                `${API_BASE}/api/grant-categories/${editing.category_id}`,
                {
                    method: "PUT",
                    headers: authHeaders,
                    body: JSON.stringify({ name: editName.trim() }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.message || "Failed to update category.");
            } else {
                setSuccess("Category updated!");
                setEditing(null);
                setEditName("");
                fetchCategories();
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
        fetchCategories();
        window.dispatchEvent(new Event("categoriesUpdated"));
    }

    async function handleDelete(cat) {
        setError("");
        setSuccess("");

        if (!window.confirm(`Delete "${cat.category_name}"?`)) return;

        try {
            const res = await fetch(
                `${API_BASE}/api/grant-categories/${cat.category_id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data?.error) {
                setError(data?.error || "Failed to delete category.");
            } else {
                setSuccess("Category deleted!");
                fetchCategories();
            }
        } catch {
            setError("Network error.");
        }
        fetchCategories();
        window.dispatchEvent(new Event("categoriesUpdated"));
    }

    return (
        <div className="admin-card">
            <h3
                className="admin-collapsible-header"
                onClick={() => setExpanded((prev) => !prev)}
            >
                Manage Grant Categories
                <span className="admin-collapse-icon">
                    {expanded ? "▲" : "▼"}
                </span>
            </h3>

            {expanded && (
                <>
                    {error && <div className="admin-error">{error}</div>}
                    {success && <div className="admin-success">{success}</div>}

                    <form onSubmit={handleAdd} className="admin-add-row">
                        <input
                            placeholder="New category..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button className="admin-btn-primary" disabled={loading}>
                            Add
                        </button>
                    </form>

                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.category_id}>
                                    <td>
                                        {editing?.category_id === cat.category_id ? (
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        ) : (
                                            cat.category_name
                                        )}
                                    </td>

                                    <td>
                                        <div className="admin-actions">
                                            {editing?.category_id === cat.category_id ? (
                                                <>
                                                    <button
                                                        className="admin-btn-primary"
                                                        onClick={handleEdit}
                                                        disabled={loading}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className="admin-btn-secondary"
                                                        onClick={() => {
                                                            setEditing(null);
                                                            setEditName("");
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
                                                            setEditing(cat);
                                                            setEditName(cat.category_name);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="admin-btn-danger"
                                                        onClick={() => handleDelete(cat)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ textAlign: "center" }}>
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

export default ManageGrantCategories;