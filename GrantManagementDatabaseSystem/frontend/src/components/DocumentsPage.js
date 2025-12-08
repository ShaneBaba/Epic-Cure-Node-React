import React, { useEffect, useState, useMemo } from "react";
import "./DocumentsPage.css";
import Sidebar from "./Sidebar";

function DocumentsPage() {

const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setLoggedInUser(JSON.parse(saved));
  }, []);

  const loggedInUserId = loggedInUser?.id;
  const loggedInUserName = loggedInUser?.username;
  const [documents, setDocuments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editDoc, setEditDoc] = useState(null);

  const Type_Options = ["-", "Budget", "Grant Proposal", "Financial", "Research", "Other"];
  const Status_Options = ["-", "Draft", "In-progress", "In-review", "Final"];

  const [newDoc, setNewDoc] = useState({
    name: "", type: "", status: "", date: "", notes: "", documentlink: "", });

  useEffect(() => {
    fetch("http://localhost:4000/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch(() => setDocuments([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditDoc((prev) => ({ ...prev, [name]: value }));
  };

  const addDocument = async () => {
    if (!newDoc.name.trim()) return alert("Document Name is required");
    if (!newDoc.type) return alert("Document Type is required");
    if (!newDoc.status) return alert("Document Status is required");
    if (!newDoc.date) return alert("Document Date is required");

    const payload = { ...newDoc, createdById: loggedInUserId, lastEditedById: loggedInUserId };

    const res = await fetch("http://localhost:4000/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      return alert(msg.message || "Failed to save document");
    }

    const created = await res.json();
    setDocuments((prev) => [...prev, created]);
    setNewDoc({ name: "", type: "", status: "", date: "", notes: "", documentlink: "" });
    setShowPopup(false);
    };

  const handleRowClick = (doc) => {
    setSelectedDoc(doc);
    setEditDoc({ ...doc });
    setIsEditing(false);
    setShowDocDetails(true);
  };

  const saveEdit = async () => {
    if (!editDoc.name.trim()) return alert("Document Name is required");
    if (!editDoc.type) return alert("Document Type is required");
    if (!editDoc.status) return alert("Document Status is required");
    if (!editDoc.date) return alert("Document Date is required");
    const payload = { ...editDoc, lastEditedById: loggedInUserId, };

    const res = await fetch(`http://localhost:4000/api/documents/${selectedDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      return alert(msg.message || "Failed to update document");
    }

    const updated = await res.json();
    setDocuments((prev) => prev.map((d) => (d.id === selectedDoc.id ? updated : d)));
    setSelectedDoc(updated);
    setIsEditing(false);
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    const res = await fetch(`http://localhost:4000/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      return alert(msg.message || "Failed to delete document");
    }

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) {
      setShowDocDetails(false);
      setSelectedDoc(null);
    }
  };

  const parseToDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (!isNaN(d)) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return null;
  };

  const startD = parseToDate(startDate);
  const endD = parseToDate(endDate);

  const filteredDocuments = useMemo(() => {
    const filterQuery = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (filterQuery) {
        const data = `${d.name} ${d.notes} ${d.createdById} ${d.type} ${d.status}`.toLowerCase();
        if (!data.includes(filterQuery)) return false;
      }
      if (filterType && d.type !== filterType) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      const docDate = parseToDate(d.date);
      if (startD && (!docDate || docDate < startD)) return false;
      if (endD && (!docDate || docDate > endD)) return false;
      return true;
    });
  }, [documents, query, filterType, filterStatus, startD, endD]);

  const clearFilters = () => {
    setQuery("");
    setFilterType("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
  };

  const displayDate = (val) => {
    if (!val) return "";
    const d = parseToDate(val);
    return d ? d.toLocaleDateString("en-US") : val;
  };

  const handleOverlayClick = (e) => {
    if (e.target.className.includes("popup-overlay")) {
      setShowPopup(false);
      setShowDocDetails(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="documents-page">
        <h2 className="documents-title">Documents</h2>

        <div className="documents-controls">
          <label className="search-label" htmlFor="search">Search:</label>
          <input
            className="documents-search"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select className="documents-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {Type_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <select className="documents-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {Status_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <input type="date" className="documents-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span style={{ opacity: 0.6 }}>to</span>
          <input type="date" className="documents-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <button className="documents-button" onClick={clearFilters}>Clear</button>
        </div>

        <button className="btn-upload" onClick={() => setShowPopup(true)}>Upload Document</button>

        <table className="documents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Link</th>
              <th>Created By</th>
              <th>Updated By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocuments.length > 0 ? filteredDocuments.map((d) => (
              <tr key={d.id} onClick={() => handleRowClick(d)}>
                <td>{d.name}</td>
                <td>{d.type}</td>
                <td>{d.status}</td>
                <td>{displayDate(d.date)}</td>
                <td>{d.notes}</td>
                <td>{d.documentlink && <a href={d.documentlink} target="_blank" rel="noopener noreferrer">{d.documentlink}</a>}</td>
                <td>{d.createdByName}</td>
                <td>{d.lastEditedByName}</td>
                <td> <button className="btn-delete" onClick={(e) => { e.stopPropagation(); deleteDocument(d.id); }}>Delete</button></td>
              </tr>
            )) : (
              <tr><td colSpan={9}>No documents yet</td></tr>
            )}
          </tbody>
        </table>

        {showPopup && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>

              <h3>Upload Document</h3>
              <label>Name:</label>
              <input name="name" value={newDoc.name} onChange={handleChange} />

              <label>Type:</label>
              <select name="type" value={newDoc.type} onChange={handleChange}>
                {Type_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>

              <label>Status:</label>
              <select name="status" value={newDoc.status} onChange={handleChange}>
                {Status_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>

              <label>Date:</label>
              <input type="date" name="date" value={newDoc.date} onChange={handleChange} />

              <label>Notes:</label>
              <input name="notes" value={newDoc.notes} onChange={handleChange} />

              <label>Document Link:</label>
              <input name="documentlink" value={newDoc.documentlink} onChange={handleChange} />

              <p>Created By: {loggedInUserName}</p>
              <p>Updated By: {loggedInUserName}</p>


              <div className="actions">
                <button onClick={() => setShowPopup(false)}>Cancel</button>
                <button onClick={addDocument}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showDocDetails && selectedDoc && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup">
              <button className="close-btn" onClick={() => setShowDocDetails(false)} />

              {!isEditing ? (
                <>
                  <h3>{selectedDoc.name}</h3>
                  <p>Type: {selectedDoc.type}</p>
                  <p>Status: {selectedDoc.status}</p>
                  <p>Date: {displayDate(selectedDoc.date)}</p>
                  <p>Notes: {selectedDoc.notes}</p>
                  <p>Document: {selectedDoc.documentlink && <a href={selectedDoc.documentlink} target="_blank" rel="noopener noreferrer">{selectedDoc.documentlink}</a>}</p>
                  <p>Created By: {selectedDoc.createdByName}</p>
                  <p>Last Edited By: {selectedDoc.lastEditedByName}</p>
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                </>
              ) : (
                <>
                  <h3>Edit Document</h3>
                  <label>Name:</label>
                  <input name="name" value={editDoc.name} onChange={handleChangeEdit} />

                  <label>Type:</label>
                  <select name="type" value={editDoc.type} onChange={handleChangeEdit}>
                    {Type_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>

                  <label>Status:</label>
                  <select name="status" value={editDoc.status} onChange={handleChangeEdit}>
                    {Status_Options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>

                  <label>Date:</label>
                  <input type="date" name="date" value={editDoc.date} onChange={handleChangeEdit} />

                  <label>Notes:</label>
                  <input name="notes" value={editDoc.notes} onChange={handleChangeEdit} />

                  <label>Document Link:</label>
                  <input name="documentlink" value={editDoc.documentlink} onChange={handleChangeEdit} />

                  <p>Created By: {editDoc.createdByName}</p>
                  <p>Updated By: {loggedInUserName}</p>

                  <div className="actions">
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                    <button onClick={saveEdit}>Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default DocumentsPage;
