import React, { useEffect, useState } from "react";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newGrant, setNewGrant] = useState({
        name: "",
        zipcodes: "",
        submissionstatus: "",
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
        setNewGrant({ name: "", duedate: "", category: "" });
        setShowPopup(false);
    };

    // Allow closing popup when clicking outside
    const handleOverlayClick = (e) => {
        if (e.target.className === "popup-overlay") {
            setShowPopup(false);
        }
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
                        <th>Zip Code</th>
                        <th>Submission Status</th>
                        <th>Category</th>
                        <th>Website</th>
                        <th>Documents</th>
                    </tr>
                </thead>
                <tbody>
                    {grants.map((g) => (
                        <tr key={g.id}>
                            <td>{g.name}</td>
                            <td>{g.duedate}</td>
                            <td>{g.zipcode}</td>
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
                        <button
                            style={styles.closeBtn}
                            onClick={() => setShowPopup(false)}
                        > X
                        </button>
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
    },
    popup: {
        position: "relative",
        backgroundColor: "#fff",
        padding: "24px 28px",
        borderRadius: "10px",
        width: "400px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
        animation: "scaleIn 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    inputRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
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

