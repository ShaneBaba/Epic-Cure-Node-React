import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationPopup from "./NotificationPopup";
import "./GrantList.css";

function normalizeDate(d) {
    const [year, month, day] = String(d).split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function GrantList() {
    const location = useLocation();

    const [grants, setGrants] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showGrantDetails, setShowGrantDetails] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [notification, setNotification] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dueWindow, setDueWindow] = useState(false);
    const [zipFilter, setZipFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [editingGrant, setEditingGrant] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
    const token = localStorage.getItem("authToken");
    const authUserRaw = localStorage.getItem("authUser");
    const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    const isAdmin = authUser?.role === "ADMIN";
    const [currentPage, setCurrentPage] = useState(1);
    const grantsPerPage = 10;

    const queryParams = new URLSearchParams(location.search);
    const dashboardFilter = queryParams.get("filter") || "";

    const authHeaders = React.useMemo(() => {
        return token
            ? { Authorization: `Bearer ${token}` }
            : {};
    }, [token]);

    const getStatusBadge = (status) => {
        const map = {
            "Not Started": "status-draft",
            "In Progress": "status-inprogress",
            "Complete": "status-inreview",
            "Submitted/Under Review": "status-final",
        };
        const cls = map[status] || "status-default";
        return <span className={`status-badge ${cls}`}>{status}</span>;
    };

    const triggerNotification = (msg) => {
        setNotification(msg);

        const timer = setTimeout(() => {
            setNotification("");
        }, 3000);

        return () => clearTimeout(timer);
    };

    const fetchGrants = async (filters = {}) => {
        const controller = new AbortController();

        try {
            setError("");

            const params = new URLSearchParams(filters).toString();
            const url = `${API}/api/grants${params ? `?${params}` : ""}`;

            const res = await fetch(url, {
                headers: authHeaders,
                signal: controller.signal
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || `Request failed (${res.status})`);
            }

            const list = Array.isArray(data) ? data : data?.grants;
            setGrants(Array.isArray(list) ? list : []);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Error loading grants:", err);
                setGrants([]);
                setError(err.message || "Could not load grants");
            }
        }

        return () => controller.abort();
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API}/api/grant-categories`, {
                headers: authHeaders,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || `Request failed (${res.status})`);
            }

            const list = Array.isArray(data) ? data : data?.categories;
            setCategories(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Failed to load categories:", err);
            setCategories([]);
        }
    };

    useEffect(() => {
        if (!token) {
            setError("You are not logged in. Please log in again.");
            setGrants([]);
            setCategories([]);
            return;
        }

        fetchGrants();
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!token) return;

        const filters = {};

        if (searchName.trim()) filters.name = searchName.trim();
        if (statusFilter) filters.status = statusFilter;
        if (dueWindow) filters.dueWindow = "60";
        if (zipFilter.trim()) filters.zipcodes = zipFilter.trim();
        if (categoryFilter.trim()) filters.category = categoryFilter.trim();

        fetchGrants(filters);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchName, statusFilter, dueWindow, zipFilter, categoryFilter]);

    useEffect(() => {
        const handleFocus = () => {
            fetchCategories();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    useEffect(() => {
        const handleUpdate = () => {
            fetchCategories();
        };

        window.addEventListener("categoriesUpdated", handleUpdate);

        return () => {
            window.removeEventListener("categoriesUpdated", handleUpdate);
        };
    }, []);

    const usedCategories = React.useMemo(() => {
        const set = new Set();

        grants.forEach((g) => {
            if (g.category) set.add(g.category);
        });

        return Array.from(set).sort();
    }, [grants]);

    const clearFilters = () => {
        setSearchName("");
        setStatusFilter("");
        setDueWindow(false);
        setZipFilter("");
        setCategoryFilter("");
        fetchGrants();
    };

    const addGrant = async (newGrant) => {
        try {
            const res = await fetch(`${API}/api/grants`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify(newGrant),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data?.message || "Failed to create grant");
                return false;
            }

            setGrants((prev) => [...prev, data]);
            fetchCategories();
            triggerNotification("New grant added!");
            return true;

        } catch (err) {
            console.error("Add grant failed:", err);
            alert("Failed to create grant");
            return false;
        }
    };

    const updateGrant = async (updatedGrant) => {
        try {
            const res = await fetch(`${API}/api/grants/${updatedGrant.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify(updatedGrant),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data?.message || "Failed to update grant");
                return false;
            }

            setGrants((prev) =>
                prev.map((g) => (g.id === data.id ? data : g))
            );

            fetchCategories();
            triggerNotification("Grant updated!");
            return true;

        } catch (err) {
            console.error("Update grant failed:", err);
            alert("Failed to update grant");
            return false;
        }
    };

    const deleteGrant = async (id) => {
        if (!isAdmin) {
            triggerNotification("Only admins can permanently delete grants.");
            return;
        }

        if (!window.confirm("Delete this grant?")) return;

        try {
            const res = await fetch(`${API}/api/grants/${id}`, {
                method: "DELETE",
                headers: authHeaders,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || `Delete failed (${res.status})`);
            }

            setGrants((prev) => prev.filter((g) => g.id !== id));
            if (selectedGrant?.id === id) {
                setShowGrantDetails(false);
                setSelectedGrant(null);
            }
            setShowEditPopup(false);
            setEditingGrant(null);
            fetchCategories();
            triggerNotification("Grant deleted!");
        } catch (err) {
            console.error("Delete grant failed:", err);
            setError(err.message || "Failed to delete grant");
        }
    };

    const filteredGrants = React.useMemo(() => {
        const today = normalizeDate(new Date().toISOString().split("T")[0]);

        return grants.filter((g) => {
            if (!g?.duedate) {
                return dashboardFilter ? false : true;
            }

            const due = normalizeDate(g.duedate);
            const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
            const status = String(g?.submissionstatus || "");
            const isComplete = status === "Complete";

            switch (dashboardFilter) {
                case "week":
                    return diffDays >= 0 && diffDays <= 7;
                case "month":
                    return diffDays > 7 && diffDays <= 30;
                case "overdue":
                    return diffDays < 0 && !isComplete;
                case "upcoming":
                    return diffDays > 30;
                default:
                    return true;
            }
        });
    }, [grants, dashboardFilter]);

    const totalPages = Math.ceil(filteredGrants.length / grantsPerPage);

    const indexOfLastGrant = currentPage * grantsPerPage;
    const indexOfFirstGrant = indexOfLastGrant - grantsPerPage;

    const currentGrants = filteredGrants.slice(
        indexOfFirstGrant,
        indexOfLastGrant
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredGrants.length, dashboardFilter]);

    return (
        <div className="layout">
            <Sidebar />
            <NotificationPopup message={notification} />

            <main className="grants-page">
                <div className="grants-header">
                    <div className="grants-header-content">
                        <h2 className="grants-title">GRANTS</h2>
                        <div className="grants-title-underline"></div>
                    </div>
                </div>

                {error && <div className="dashboard-error">{error}</div>}

                {dashboardFilter && (
                    <p className="grants-count">
                        Filtered by dashboard section: {
                            dashboardFilter === "week"
                                ? "Due This Week"
                                : dashboardFilter === "month"
                                    ? "Due This Month"
                                    : dashboardFilter === "overdue"
                                        ? "Overdue"
                                        : dashboardFilter === "upcoming"
                                            ? "Upcoming Grants"
                                            : dashboardFilter
                        }
                    </p>
                )}

                <div className="grants-controls">
                    <label className="search-label" htmlFor="search">Search:</label>
                    <input
                        className="grants-search"
                        type="text"
                        placeholder="Search..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />

                    <input
                        className="grants-search"
                        type="text"
                        placeholder="Search..."
                        value={zipFilter}
                        onChange={(e) => setZipFilter(e.target.value)}
                    />

                    <select
                        className="grants-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {usedCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        className="grants-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Submitted/Under Review">Submitted/Under Review</option>
                    </select>

                    <button
                        className={`grants-toggle ${dueWindow ? "active" : ""}`}
                        onClick={() => setDueWindow((prev) => !prev)}
                    >
                        +/- 60 Days
                    </button>

                    <button className="grants-button" onClick={clearFilters}>Clear</button>
                </div>

                <button className="btn-upload" onClick={() => setShowAddPopup(true)}>Add Grant</button>

                <p className="grants-count">
                    Showing {filteredGrants.length === 0 ? 0 : indexOfFirstGrant + 1}–{Math.min(indexOfLastGrant, filteredGrants.length)} of {filteredGrants.length} grant{filteredGrants.length !== 1 ? "s" : ""}
                </p>

                <table className="grants-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Due Date</th>
                            <th>Zip Codes</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Website</th>
                            <th>Application Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentGrants.length > 0 ? (
                            currentGrants.map((g) => (
                                <tr key={g.id}>
                                    <td
                                        className="grant-link"
                                        onClick={() => {
                                            setSelectedGrant(g);
                                            setShowGrantDetails(true);
                                        }}
                                    >
                                        {g.name}
                                    </td>
                                    <td>{g.duedate}</td>
                                    <td>{g.zipcodes}</td>
                                    <td>{getStatusBadge(g.submissionstatus)}</td>
                                    <td>{g.category}</td>
                                    <td>
                                        {g.website ? (
                                            <a
                                                href={g.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="grant-link"
                                            >
                                                {g.website}
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        {g.documents ? (
                                            <a
                                                href={g.documents}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="grant-link"
                                            >
                                                {g.documents}
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7}>No grants match this filter</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {(() => {
                            const pages = [];
                            const delta = 2;
                            const left = currentPage - delta;
                            const right = currentPage + delta;
                            let lastPushed = null;

                            for (let i = 1; i <= totalPages; i++) {
                                if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                                    if (lastPushed && i - lastPushed > 1) {
                                        pages.push(
                                            <span key={`ellipsis-${i}`} className="pagination-ellipsis">
                                                ...
                                            </span>
                                        );
                                    }

                                    pages.push(
                                        <button
                                            key={i}
                                            className={currentPage === i ? "active-page" : ""}
                                            onClick={() => setCurrentPage(i)}
                                        >
                                            {i}
                                        </button>
                                    );

                                    lastPushed = i;
                                }
                            }

                            return pages;
                        })()}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}

                {showAddPopup && (
                    <GrantPopup
                        title="Add New Grant"
                        onClose={() => setShowAddPopup(false)}
                        onSave={addGrant}
                        isAdmin={isAdmin}
                        categories={categories}
                    />
                )}

                {showEditPopup && editingGrant && (
                    <GrantPopup
                        title="Edit Grant"
                        onClose={() => setShowEditPopup(false)}
                        onSave={updateGrant}
                        onDelete={deleteGrant}
                        existingGrant={editingGrant}
                        isAdmin={isAdmin}
                        categories={categories}
                    />
                )}

                {showGrantDetails && selectedGrant && (
                    <div
                        className="popup-overlay"
                        onClick={() => setShowGrantDetails(false)}
                    >
                        <div
                            className="popup"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="close-btn"
                                onClick={() => setShowGrantDetails(false)}
                            >
                                ×
                            </button>

                            <h3>{selectedGrant.name}</h3>
                            <p>Status: {selectedGrant.submissionstatus}</p>
                            <p>Category: {selectedGrant.category}</p>
                            <p>Zip Codes: {selectedGrant.zipcodes}</p>
                            <p>
                                Website:{" "}
                                {selectedGrant.website ? (
                                    <a
                                        href={selectedGrant.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grant-link"
                                    >
                                        {selectedGrant.website}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </p>

                            <p>
                                Application Link:{" "}
                                {selectedGrant.documents ? (
                                    <a
                                        href={selectedGrant.documents}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grant-link"
                                    >
                                        {selectedGrant.documents}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </p>
                            <p>Due Date: {selectedGrant.duedate}</p>
                            <p>Created By: {selectedGrant.createdByName}</p>
                            <p>Last Edited By: {selectedGrant.lastEditedByName}</p>
                            <div className="actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => {
                                        setEditingGrant(selectedGrant);
                                        setShowGrantDetails(false);
                                        setShowEditPopup(true);
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn-delete"
                                    onClick={() => deleteGrant(selectedGrant.id)}
                                    disabled={!isAdmin}
                                    title={!isAdmin ? "Only admins can permanently delete grants" : ""}
                                    style={!isAdmin ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                                >
                                    Delete
                                </button>
                            </div>

                            {!isAdmin && (
                                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                                    Only admins can permanently delete grants.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function GrantPopup({ title, onClose, onSave, existingGrant, onDelete, isAdmin, categories }) {

    const [grantData, setGrantData] = useState(
        existingGrant ||
        {
            name: "",
            zipcodes: "",
            submissionstatus: "Not Started",
            category: "",
            duedate: "",
            website: "",
            documents: "",
        });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGrantData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!grantData.name.trim()) return alert("Grant Name is required");
        if (!grantData.category.trim()) return alert("Category is required");
        if (!grantData.zipcodes.trim()) return alert("Zip Codes are required");
        if (!grantData.submissionstatus) return alert("Status is required");
        if (!grantData.duedate) return alert("Due Date is required");
        const payload = { ...grantData };
        if (existingGrant) payload.id = existingGrant.id;
        const result = await onSave(payload);
        if (result !== false) {
            onClose();
        }
    };

    return (
        <div
            className="popup-overlay"
            onClick={(e) => e.target.className === "popup-overlay" && onClose()}
        >
            <div className="popup">
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>

                <h3>{title}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="input-row">
                        <label>Name:</label>
                        <input
                            className="grants-input"
                            type="text"
                            name="name"
                            value={grantData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-row">
                        <label>Category:</label>
                        <select
                            className="grants-select"
                            name="category"
                            value={grantData.category}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_name}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {["zipcodes", "website", "documents"].map((field) => (
                        <div className="input-row" key={field}>
                            <label>
                                {field === "documents"
                                    ? "Application Link"
                                    : field[0].toUpperCase() + field.slice(1)}
                                :
                            </label>
                            <input
                                className="grants-input"
                                type="text"
                                name={field}
                                value={grantData[field]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}

                    <div className="input-row">
                        <label>Status:</label>
                        <select
                            className="grants-select"
                            name="submissionstatus"
                            value={grantData.submissionstatus}
                            onChange={handleChange}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Complete">Complete</option>
                            <option value="Submitted/Under Review">Submitted/Under Review</option>
                        </select>
                    </div>

                    <div className="input-row">
                        <label>Due Date:</label>
                        <input
                            className="grants-input"
                            type="date"
                            name="duedate"
                            value={grantData.duedate}
                            onChange={(e) =>
                                setGrantData((prev) => ({ ...prev, duedate: e.target.value }))
                            }
                        />
                    </div>
                    <p>Created By: {grantData.createdByName}</p>
                    <p>Last Edited By: {grantData.lastEditedByName}</p>
                    <div className="actions">
                        <button className="btn-save" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GrantList;