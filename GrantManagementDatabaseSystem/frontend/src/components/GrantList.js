import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editingGrant, setEditingGrant] = useState(null);
    const [showGrantDetails, setShowGrantDetails] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);

    useEffect(() => {
        fetch("http://localhost:4000/api/grants")
            .then((res) => res.json())
            .then((data) => setGrants(data));
    }, []);

    const addGrant = async (newGrant) => {
        const res = await fetch("http://localhost:4000/api/grants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGrant),
        });
        const data = await res.json();
        setGrants([...grants, data]);
    };

    const updateGrant = async (updatedGrant) => {
        const res = await fetch(`http://localhost:4000/api/grants/${updatedGrant.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedGrant),
        });
        const data = await res.json();
        setGrants(grants.map((g) => (g.id === data.id ? data : g)));
    };

    const deleteGrant = async (id) => {
        if (!window.confirm("Are you sure you want to delete this grant?")) return;

        await fetch(`http://localhost:4000/api/grants/${id}`, {
            method: "DELETE",
        });

        setGrants(grants.filter((g) => g.id !== id));
        setShowEditPopup(false);
    };


    return (
        <div className="layout">
            <Sidebar />
            <div style={{ padding: "1rem" }}>
                <h2>Grant List</h2>
                <button onClick={() => setShowAddPopup(true)}>Add Grant</button>

                <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Due Date</th>
                            <th>Zip Codes</th>
                            <th>Submission Status</th>
                            <th>Category</th>
                            <th>Wesbite</th>
                            <th>Documents</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grants.map((g) => (
                            <tr key={g.id} style={{ borderBottom: "1px solid #ccc" }}>
                                <td
                                    style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
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
                                    <button onClick={() => { setEditingGrant(g); setShowEditPopup(true); }}>Edit</button>
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
                    <div className="popup-overlay" style={styles.overlay} onClick={() => setShowGrantDetails(false)}>
                        <div style={styles.popup}>
                            <button style={styles.closeBtn} onClick={() => setShowGrantDetails(false)}>X</button>
                            <h3>{selectedGrant.name}</h3>
                            <p>Status: {selectedGrant.submissionstatus}</p>
                            <p>Category: {selectedGrant.category}</p>
                            <p>Zip Codes: {selectedGrant.zipcodes}</p>
                            <p>Website: {selectedGrant.website}</p>
                            <p>Documents: {selectedGrant.documents}</p>
                            <p>Due Date: {selectedGrant.duedate}</p>
                            <p>Last edited by:</p>
                            <p>Created by:</p>
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
        <div className="popup-overlay" style={styles.overlay} onClick={(e) => e.target.className === "popup-overlay" && onClose()}>
            <div style={styles.popup}>
                <button style={styles.closeBtn} onClick={onClose}>X</button>
                <h3>{title}</h3>
                {["name", "category", "zipcodes", "website", "documents"].map((field) => (
                    <div style={styles.inputRow} key={field}>
                        <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                        <input
                            type="text"
                            name={field}
                            value={grantData[field]}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                ))}

                <div style={styles.inputRow}>
                    <label>Submission Status:</label>
                    <select name="submissionstatus" value={grantData.submissionstatus} onChange={handleChange} style={styles.input}>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Submitted/Under Review">Submitted/Under Review</option>
                    </select>
                </div>

                <div style={styles.inputRow}>
                    <label>Due Date:</label>
                    <input type="date" name="duedate" value={grantData.duedate} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.buttonRow}>
                    <button onClick={handleSubmit}>Save</button>

                    {existingGrant && (
                        <button
                            style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
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

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    popup: {
        position: "relative",
        backgroundColor: "#fff",
        padding: "40px 28px 24px 28px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        overflowX: "hidden",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        wordWrap: "break-word",
        whiteSpace: "normal",
        wordBreak: "break-all",
        overflowWrap: "break-word",
    },
    inputRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
    input: {
        flexGrow: 1,
        padding: "8px 10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "10px",
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "12px",
        background: "none",
        border: "none",
        fontSize: "22px",
        fontWeight: "bold",
        color: "#555",
        cursor: "pointer",
        lineHeight: "1",
    },
};

export default GrantList;