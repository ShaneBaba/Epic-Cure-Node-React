import React, { useEffect, useState, useMemo } from "react";
import "./DocumentsPage.css";
import Sidebar from "./Sidebar";

function DocumentsPage(){

  const [documents, setDocuments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const Type_Options = ["Budget", "Grant Proposal", "Financial", "Research", "-"];
  const Status_Options = ["Draft", "In-progress", "In-review","Final", "-" ];

  //upload document popup
  const [newDoc, setNewDoc] = useState({
    name: "",
    type:"",
    status:"",
    date:"",
    notes:"",
    document:"",
    createdby:"",
  });

 useEffect(() => {
  fetch("http://localhost:4000/api/documents")
  .then((res) => res.json())
  .then((data) => setDocuments(data))
  .catch(() => setDocuments([]));
 }, []); 

 //handle change
 const handleChange = (e) => {
  const { name, value } = e.target;
  setNewDoc((prev) => ({...prev, [name]: value}));
 };

 //add document - make sure there is a name and date
 const addDocument = async () => {
  if (!newDoc.name.trim()) return alert ("Please enter a document name.");
  if (!newDoc.date) return alert ("Please select a date.");

  const payload = {
    name: newDoc.name.trim(),
    type: newDoc.type.trim(),
    status: newDoc.status,
    date: newDoc.date,
    notes: newDoc.notes.trim(),
    kind: "document",
    document: newDoc.document.trim(),
    createdby: newDoc.createdby.trim(),
 };


const res = await fetch ("http://localhost:4000/api/documents",{
method: "POST",
headers: { "Content-Type": "application/json"},
body: JSON.stringify(payload),
});

if (!res.ok) {
  const msg = await res.json().catch(() =>({}));
  return alert (msg.message || "Falied to save document");
}

const created = await res.json();

const displayRow = {
  ...created,
  date: new Date (created.date).toLocaleDateString("en-US"),
};

setDocuments ((prev) => [...prev, displayRow]);

setNewDoc ({
  name:"",
  type:"Budget",
  status:"Draft",
  date:"",
  notes:"",
  document:"",
  createdby:"",
});

setShowPopup(false);
};
const handleOverlayClick = (e) => {
  if (e.target.className === "popup-overlay"){
    setShowPopup(false);
    setShowDocDetails(false);
  }
};
const handleRowClick = (doc) => {
  setSelectedDoc(doc);
  setShowDocDetails(true);
};

const deleteDocument = async (id) => {

   if (!window.confirm("Are you sure you?")) return;
   const res = await fetch(`http://localhost:4000/api/documents/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    return alert(msg.message || "Failed to delete document");
  }
   setDocuments((prev) => prev.filter((d) => d.id !== id));

  if (selectedDoc && String(selectedDoc.id) === String(id)) {
    setShowDocDetails(false);
    setSelectedDoc(null);
  }
};
const parseToDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (!isNaN(d)) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val);
  if (m) {
    const mm = parseInt (m[1],10) - 1;
    const dd = parseInt (m[2], 10);
    const yy = parseInt (m[3], 10);
    return new Date (yy, mm, dd);
  }
  return null;
};
const startD = parseToDate(startDate);
const endD = parseToDate(endDate);

const filteredDocuments = useMemo (() => {
  const filterQuery = query.trim().toLowerCase();
  return documents.filter((d) => {

    if (filterQuery) {
      const data = `${d.name ?? ""} ${d.notes ?? ""} ${d.createdby ?? ""} ${d.type ?? ""} ${d.status ?? ""}`.toLowerCase();
      if (!data.includes(filterQuery)) return false;
    }

    if (filterType && (d.type ?? "")!== filterType) return false;
    if (filterStatus && (d.status ?? "") !== filterStatus) return false;

    if (startD || endD){
      const documentDate = parseToDate (d.date);
      if (!documentDate) return false;
      if (startD && documentDate < startD) return false;
      if (endD && documentDate > endD) return false;
    }
    return true;
  });
}, [ documents, query, filterType, filterStatus, startD, endD]);

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
   

return (
     <div className="layout">
      <Sidebar /> 
    <main className="documents-page">
       <h2>Documents</h2>
    
      <div className = "documents-controls">
        <input className = "documents-search"
        value = {query}
        onChange = {(e) => setQuery(e.target.value)} />

       <select
              className="documents-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              {Type_Options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              className="documents-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {Status_Options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="documents-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
              placeholder="Start date"
            />
            <span style={{ opacity: 0.6 }}>to</span>
            <input
              type="date"
              className="documents-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
              placeholder="End date"
            />

            <button className="documents-button" onClick={clearFilters}>
              Clear
            </button>



      </div>
      <button onClick={() => setShowPopup(true)}>Upload Document</button>

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((d) => (
            <tr key={d.id} onClick={() => handleRowClick(d)}>
              <td>{d.name}</td>
              <td>{d.type}</td>
              <td>{d.status}</td>
              <td>{displayDate(d.date)}</td>
              <td>{d.notes}</td>
              <td>{d.document}</td>
              <td>{d.createdby}</td>
              <td> <button onClick={(e) => { e.stopPropagation();   
                  deleteDocument(d.id);
                  }}> Delete </button></td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={7}>No documents yet</td>
            </tr>
          )}
        </tbody>
      </table>

      {showPopup && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup">
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              
            </button>
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
            <input
              type="date"
              name="date"
              value={newDoc.date}
              onChange={handleChange}
            />

            <label>Notes:</label>
            <input name="notes" value={newDoc.notes} onChange={handleChange} />

            <label>Document Link:</label>
            <input
              name="document"
              value={newDoc.document}
              onChange={handleChange}
            />

            <label>Created By:</label>
            <input
              name="createdby"
              value={newDoc.createdby}
              onChange={handleChange}
            />

            <div className = "actions">
            <button onClick = {() => setShowPopup(false)}>Cancel</button>
            <button onClick={addDocument}>Save</button>
             </div>

          </div>
        </div>
      )}

      {showDocDetails && selectedDoc && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup">
            <button
              className="close-btn"
              onClick={() => setShowDocDetails(false)}
            >
              
            </button>
            <h3>{selectedDoc.name}</h3>
            <p>Type: {selectedDoc.type}</p>
            <p>Status: {selectedDoc.status}</p>
            <p>Date: {selectedDoc.date}</p>
            <p>Notes: {selectedDoc.notes}</p>
            <p>Document: {selectedDoc.document}</p>
            <p>Created By: {selectedDoc.createdby}</p>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default DocumentsPage;