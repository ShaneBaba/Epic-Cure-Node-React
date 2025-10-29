import React, { useEffect, useState } from "react";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [showGrantDetails, setShowGrantDetails] = useState(false);
    const [newGrant, setNewGrant] = useState({
        name: "",
        zipcodes: "",
        submissionstatus: "Not Started",
        category: "",
        duedate: "",
        website: "",
        documents: "",
    });

    useEffect(() => {
        fetch("http://localhost:4000/api/grants")
            .then((res) => res.json())
            .then((data) => setGrants(data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewGrant((prev) => ({ ...prev, [name]: value }));
    };

    const addGrant = async () => {
        const res = await fetch("http://localhost:4000/api/grants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGrant),
        });
        const data = await res.json();
        setGrants([...grants, data]);
        setNewGrant({
            name: "",
            zipcodes: "",
            submissionstatus: "",
            category: "",
            duedate: "",
            website: "",
            documents: "" });
        setShowPopup(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === "popup-overlay") {
            setShowPopup(false);
        }
    };

    const handleGrantClick = (grant) => {
        setSelectedGrant(grant);
        setShowGrantDetails(true);
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Grant List</h2>
            <button onClick={() => setShowPopup(true)}>Add Grant</button>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Due Date</th>
                        <th>Zip Code(s)</th>
                        <th>Submission Status</th>
                        <th>Category</th>
                        <th>Website</th>
                        <th>Documents</th>
                    </tr>
                </thead>
                <tbody>
                    {grants.map((g) => (
                        <tr key={g.id}>
                            <td
                                style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                                onClick={() => handleGrantClick(g)}
                            >
                                {g.name}
                            </td>
                            <td>{g.duedate}</td>
                            <td>{g.zipcodes}</td>
                            <td>{g.submissionstatus}</td>
                            <td>{g.category}</td>
                            <td>{g.website}</td>
                            <td>{g.documents}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showPopup && (
                <div
                    className="popup-overlay"
                    style={styles.overlay}
                    onClick={handleOverlayClick}
                >
                    <div style={styles.popup}>
                        <button style={styles.closeBtn} onClick={() => setShowPopup(false)}>X</button>
                        <h3>Add New Grant</h3>
                        <div style={styles.inputRow}>
                            <label>Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={newGrant.name}
                                onChange={handleChange}
                                placeholder="Florida Food"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label>Submission Status:</label>
                            <select
                                type="text"
                                name="submissionstatus"
                                value={newGrant.submissionstatus}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                                <option value="Submitted/Under Review">Submitted/Under Review</option>
                            </select>
                        </div>
                        <div style={styles.inputRow}>
                            <label>Category:</label>
                            <input
                                type="text"
                                name="category"
                                value={newGrant.category}
                                onChange={handleChange}
                                placeholder="Gov. Assistance"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label>Serving Zip Codes:</label>
                            <input
                                type="text"
                                name="zipcodes"
                                value={newGrant.zipcodes}
                                onChange={handleChange}
                                placeholder="12345"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label>Link to website:</label>
                            <input
                                type="text"
                                name="website"
                                value={newGrant.website}
                                onChange={handleChange}
                                placeholder="www.grant.com"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label>Link(s) to working document(s):</label>
                            <input
                                type="text"
                                name="documents"
                                value={newGrant.documents}
                                onChange={handleChange}
                                placeholder="google doc link"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label>Due Date:</label>
                            <input
                                type="date"
                                name="duedate"
                                value={newGrant.duedate}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.buttonRow}>
                            <button onClick={addGrant}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showGrantDetails && selectedGrant && (
                <div
                    className="popup-overlay"
                    style={styles.overlay}
                    onClick={(e) => {
                        if (e.target.className === "popup-overlay") {
                            setShowGrantDetails(false);
                        }
                    }}
                >
                    <div style={styles.popup}>
                        <button
                            style={styles.closeBtn}
                            onClick={() => setShowGrantDetails(false)}
                        >
                            X
                        </button>
                        <h3>{selectedGrant.name}</h3>
                        <p>Submission Status: {selectedGrant.submissionstatus}</p>
                        <p>Category: {selectedGrant.category}</p>
                        <p>Zip Codes: {selectedGrant.zipcodes}</p>
                        <p>Website: {selectedGrant.website}</p>
                        <p>Documents: {selectedGrant.documents}</p>
                        <p>Due Date: {selectedGrant.duedate}</p>
                        <p>Created by: </p>
                        <p>Last edited by: </p>
                    </div>
                </div>
            )}
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
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: "fadeIn 0.3s ease",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px",
    },
    popup: {
        position: "relative",
        backgroundColor: "#fff",
        padding: "24px 28px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
        animation: "scaleIn 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        overflowY: "auto",
        overflowX: "hidden",
        wordWrap: "break-word",
        whiteSpace: "normal",
        boxSizing: "border-box",
    },
    inputRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        wordWrap: "break-word",
    },
    input: {
        flexGrow: 1,
        padding: "8px 10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        wordWrap: "break-word",
    },
    label: {
        flexShrink: 0,
        fontWeight: "500",
        minWidth: "100px",
        wordWrap: "break-word",
        whiteSpace: "normal",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "10px",
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "12px",
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
    },
};


export default GrantList;

