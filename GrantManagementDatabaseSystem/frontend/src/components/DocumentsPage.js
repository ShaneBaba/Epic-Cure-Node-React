//imports
import React, { useEffect, useState, useMemo } from "react";
import "./DocumentsPage.css";
import Sidebar from "./Sidebar";
import FileUploader from "./FileUploader";


function DocumentsPage() {

const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setLoggedInUser(JSON.parse(saved));
  }, []);

  const loggedInUserId = loggedInUser?.id;
  const loggedInUserName = loggedInUser?.username;

  const token = localStorage.getItem("authToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const isAdmin = loggedInUser?.role === "ADMIN";

  const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

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
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const Type_Options = [
  "-",
  "Grant Proposal",
  "Financial",
  "Research",
  "Audited Financial Statements",
  "501c3 Determination Letter",
  "Budget - Fiscal Year",
  "Budget - Project",
  "Budget - Organizational",
  "Letters of Support",
  "Proposals",
  "Board of Directors Information",
  "Other IRS Forms",
  "Other"];
  const Status_Options = ["-", "Draft", "In-progress", "In-review", "Final"];

  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "",
    status: "",
    date: "",
    notes: "",
    documentlink: "",
  });

  useEffect(() => {
    if (!token) {
      setDocuments([]);
      setError("You are not logged in. Please log in again.");
      return;
    }

    fetch(`${API}/api/documents`, { headers: authHeaders })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

        const list = Array.isArray(data) ? data : data?.documents;
        setDocuments(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load documents:", err);
        setDocuments([]);
        setError(err.message || "Could not load documents");
      });
    
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadSuccess = (filePath, blobName) => {
  setNewDoc((prev) => ({ ...prev, documentlink: filePath, blobName: blobName }));
};

  const handleEditUploadSuccess = (filePath) => {
    setEditDoc((prev) => ({ ...prev, documentlink: filePath }));
  };

  const addDocument = async () => {
    if (!newDoc.name.trim()) return alert("Document Name is required");
    if (!newDoc.type) return alert("Document Type is required");
    if (!newDoc.status) return alert("Document Status is required");
    if (!newDoc.date) return alert("Document Date is required");

    const payload = {
      ...newDoc,
      createdById: loggedInUserId,
      lastEditedById: loggedInUserId,
    };

    const res = await fetch(`${API}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return alert(data?.message || "Failed to save document");
    }

    setDocuments((prev) => [...prev, data]);
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

    const payload = { ...editDoc, lastEditedById: loggedInUserId };

    const res = await fetch(`${API}/api/documents/${selectedDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return alert(data?.message || "Failed to update document");
    }

    setDocuments((prev) => prev.map((d) => (d.id === selectedDoc.id ? data : d)));
    setSelectedDoc(data);
    setIsEditing(false);
  };

  const deleteDocument = async (id) => {
    if (!isAdmin) {
      alert("Only admins can permanently delete documents.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this document?")) return;

    const res = await fetch(`${API}/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return alert(data?.message || "Failed to delete document");
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
    const safeDocs = Array.isArray(documents) ? documents : [];
    
    return safeDocs.filter((d) => {
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


  useEffect(() => {
  setCurrentPage(1);
}, [query, filterType, filterStatus, startDate, endDate]);

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

  const documentsPerPage = 10;

  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;

  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDoc,
    indexOfLastDoc
  );
//end of logic

//frontend 
  return (
    <div className="layout">
      <Sidebar />

      <main className="documents-page">
        <h2 className="documents-title">Documents</h2>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="documents-controls">
          <label className="search-label" htmlFor="search">Search:</label>
          <input
            className="documents-search"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="documents-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {Type_Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            className="documents-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Status_Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <input
            type="date"
            className="documents-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ opacity: 0.6 }}>to</span>
          <input
            type="date"
            className="documents-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="documents-button" onClick={clearFilters}>Clear</button>
        </div>

        <button className="btn-upload" onClick={() => setShowPopup(true)}>
          Upload Document
        </button>

        <table className="documents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Document</th>
            </tr>
          </thead>

          <tbody>
            {currentDocuments.length > 0 ? currentDocuments.map((d) => (
              <tr key={d.id} onClick={() => handleRowClick(d)}>
                <td>{d.name}</td>
                <td>{d.type}</td>
                <td>{d.status}</td>
                <td>{displayDate(d.date)}</td>
                <td>{d.notes}</td>
                <td>
                  {d.documentlink && (
                    <a 
                      href={d.documentlink?.startsWith('http') ? d.documentlink : `${API}${d.documentlink}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View File
                    </a>
                  )}
                </td>
              </tr>
            )) 
           : (
              <tr>
              <td colSpan={6}>No documents yet</td>
                </tr>            
              )}
          </tbody>
        </table>

              {totalPages > 1 && (
  <div className="pagination">
    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>

    {(() => {
      const pages = [];
      const delta = 2;
      const left = currentPage - delta;
      const right = currentPage + delta;

      let lastPushed = null;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i <= right)) {
          if (lastPushed && i - lastPushed > 1) {
            pages.push(<span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>);
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

    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
  </div>
)}

        {showPopup && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup">
              <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>

              <h3>Upload Document</h3>
              <label>Name:</label>
              <input name="name" value={newDoc.name} onChange={handleChange} />

              <label>Type:</label>
              <select name="type" value={newDoc.type} onChange={handleChange}>
                {Type_Options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <label>Status:</label>
              <select name="status" value={newDoc.status} onChange={handleChange}>
                {Status_Options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <label>Date:</label>
              <input type="date" name="date" value={newDoc.date} onChange={handleChange} />

              <label>Notes:</label>
              <input name="notes" value={newDoc.notes} onChange={handleChange} />

              <label>Upload Document:</label>
              <FileUploader 
                onUploadSuccess={handleUploadSuccess}
                currentFile={newDoc.documentlink}
              />
              
              <p>Created By: {loggedInUserName}</p>
              <p>Updated By: {loggedInUserName}</p>

              <div className="actions">
                <button className="btn-save" onClick={addDocument}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showDocDetails && selectedDoc && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup">
              <button className="close-btn" onClick={() => setShowDocDetails(false)}>×</button>

              {!isEditing ? (
                <>
                  <h3>{selectedDoc.name}</h3>
                  <p>Type: {selectedDoc.type}</p>
                  <p>Status: {selectedDoc.status}</p>
                  <p>Date: {displayDate(selectedDoc.date)}</p>
                  <p>Notes: {selectedDoc.notes}</p>
                  <p>
                    Document: {selectedDoc.documentlink ? (
                      <a 
                        href={selectedDoc.documentlink?.startsWith('http') 
                        ? selectedDoc.documentlink 
                        : `${API}${selectedDoc.documentlink}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    ) : 'No file uploaded'}
                  </p>
                  <p>Created By: {selectedDoc.createdByName}</p>
                  <p>Last Edited By: {selectedDoc.lastEditedByName}</p>
                  <div className="actions">
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                    <button className="btn-delete" onClick={(e) => { e.stopPropagation(); deleteDocument(selectedDoc.id); }}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Edit Document</h3>
                  <label>Name:</label>
                  <input name="name" value={editDoc.name} onChange={handleChangeEdit} />

                  <label>Type:</label>
                  <select name="type" value={editDoc.type} onChange={handleChangeEdit}>
                    {Type_Options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <label>Status:</label>
                  <select name="status" value={editDoc.status} onChange={handleChangeEdit}>
                    {Status_Options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <label>Date:</label>
                  <input type="date" name="date" value={editDoc.date} onChange={handleChangeEdit} />

                  <label>Notes:</label>
                  <input name="notes" value={editDoc.notes} onChange={handleChangeEdit} />

                  <label>Upload Document:</label>
                  <FileUploader 
                    onUploadSuccess={handleEditUploadSuccess}
                    currentFile={editDoc.documentlink}
                  />
                  
                  <p>Created By: {editDoc.createdByName}</p>
                  <p>Updated By: {loggedInUserName}</p>

                  <div className="actions">
                    <button className="btn-save" onClick={saveEdit}>Save</button>
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