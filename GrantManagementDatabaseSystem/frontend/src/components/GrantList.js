import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationPopup from "./NotificationPopup";
import "./GrantList.css";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editingGrant, setEditingGrant] = useState(null);
    const [showGrantDetails, setShowGrantDetails] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [notification, setNotification] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dueWindow, setDueWindow] = useState(false); // 60-day toggle

    const fetchGrants = async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await fetch(
                `http://localhost:4000/api/grants${params ? `?${params}` : ""}`
            );

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error("Expected array, got:", data);
                setGrants([]);
                return;
            }

            setGrants(data);
        } catch (err) {
            console.error(err);
            setGrants([]);
        }
    };

    useEffect(() => {
        fetchGrants();
    }, []);

    const applyFilters = () => {
        const filters = {};

        if (searchName.trim()) filters.name = searchName.trim();
        if (statusFilter) filters.status = statusFilter;
        if (dueWindow) filters.dueWindow = "60"; // flag only

        fetchGrants(filters);
    };

    const clearFilters = () => {
        setSearchName("");
        setStatusFilter("");
        setDueWindow(false);
        fetchGrants();
    };

    const triggerNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 3000);
    };

    const addGrant = async (newGrant) => {
        const res = await fetch("http://localhost:4000/api/grants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGrant),
        });

        const data = await res.json();
        setGrants((prev) => [...prev, data]);
        triggerNotification("New grant added!");
    };

    const updateGrant = async (updatedGrant) => {
        const res = await fetch(
            `http://localhost:4000/api/grants/${updatedGrant.id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedGrant),
            }
        );

        const data = await res.json();
        setGrants((prev) =>
            prev.map((g) => (g.id === data.id ? data : g))
        );
        triggerNotification("Grant updated!");
    };

    const deleteGrant = async (id) => {
        if (!window.confirm("Delete this grant?")) return;

        await fetch(`http://localhost:4000/api/grants/${id}`, {
            method: "DELETE",
        });

        setGrants((prev) => prev.filter((g) => g.id !== id));
        setShowEditPopup(false);
        triggerNotification("Grant deleted!");
    };

    return (
        <div className="layout">
            <Sidebar />
            <NotificationPopup message={notification} />

            <div className="grant-page">
                <h2>Grant List</h2>

                <button onClick={() => setShowAddPopup(true)}>
                    Add Grant
                </button>

                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Search grant name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Submitted/Under Review">
                            Submitted/Under Review
                        </option>
                    </select>

                    <button
                        className={dueWindow ? "active" : ""}
                        onClick={() => setDueWindow((prev) => !prev)}
                    >
                        +/- 60 Days
                    </button>

                    <button onClick={applyFilters}>Apply Filters</button>
                    <button onClick={clearFilters}>Clear Filters</button>
                </div>

                <table className="grant-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Due Date</th>
                            <th>Zip Codes</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Website</th>
                            <th>Documents</th>
                            <th>Edit</th>
                        </tr>
                    </thead>

                    <tbody>
                        {grants.map((g) => (
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
                                <td>{g.submissionstatus}</td>
                                <td>{g.category}</td>
                                <td>{g.website}</td>
                                <td>{g.documents}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditingGrant(g);
                                            setShowEditPopup(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showAddPopup && (
                    <GrantPopup
                        title="Add New Grant"
                        onClose={() => setShowAddPopup(false)}
                        onSave={addGrant}
                    />
                )}

                {showEditPopup && editingGrant && (
                    <GrantPopup
                        title="Edit Grant"
                        onClose={() => setShowEditPopup(false)}
                        onSave={updateGrant}
                        onDelete={deleteGrant}
                        existingGrant={editingGrant}
                    />
                )}

                {showGrantDetails && selectedGrant && (
                    <div
                        className="popup-overlay"
                        onClick={() => setShowGrantDetails(false)}
                    >
                        <div className="popup">
                            <button
                                className="close-btn"
                                onClick={() => setShowGrantDetails(false)}
                            >
                                X
                            </button>

                            <h3>{selectedGrant.name}</h3>
                            <p>Status: {selectedGrant.submissionstatus}</p>
                            <p>Category: {selectedGrant.category}</p>
                            <p>Zip Codes: {selectedGrant.zipcodes}</p>
                            <p>Website: {selectedGrant.website}</p>
                            <p>Documents: {selectedGrant.documents}</p>
                            <p>Due Date: {selectedGrant.duedate}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function GrantPopup({ title, onClose, onSave, existingGrant, onDelete }) {
    const [grantData, setGrantData] = useState(
        existingGrant || {
            name: "",
            zipcodes: "",
            submissionstatus: "Not Started",
            category: "",
            duedate: "",
            website: "",
            documents: "",
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGrantData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const payload = { ...grantData };
        if (existingGrant) payload.id = existingGrant.id;
        onSave(payload);
        onClose();
    };

    return (
        <div
            className="popup-overlay"
            onClick={(e) =>
                e.target.className === "popup-overlay" && onClose()
            }
        >
            <div className="popup">
                <button className="close-btn" onClick={onClose}>
                    X
                </button>

                <h3>{title}</h3>

                {["name", "category", "zipcodes", "website", "documents"].map(
                    (field) => (
                        <div className="input-row" key={field}>
                            <label>
                                {field[0].toUpperCase() + field.slice(1)}:
                            </label>
                            <input
                                type="text"
                                name={field}
                                value={grantData[field]}
                                onChange={handleChange}
                            />
                        </div>
                    )
                )}

                <div className="input-row">
                    <label>Status:</label>
                    <select
                        name="submissionstatus"
                        value={grantData.submissionstatus}
                        onChange={handleChange}
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Submitted/Under Review">
                            Submitted/Under Review
                        </option>
                    </select>
                </div>

                <div className="input-row">
                    <label>Due Date:</label>
                    <input
                        type="date"
                        name="duedate"
                        value={grantData.duedate}
                        onChange={handleChange}
                    />
                </div>

                <div className="button-row">
                    <button onClick={handleSubmit}>Save</button>

                    {existingGrant && (
                        <button
                            className="delete-btn"
                            onClick={() => onDelete(existingGrant.id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GrantList;
