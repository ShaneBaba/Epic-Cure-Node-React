import React, {useEffect, useState} from "react";
import "./DocumentsPage.css";
import Sidebar from "./Sidebar";

function DocumentsPage(){

  const [documents, setDocuments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
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
  status:"",
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

return (
     <div className="layout">
      <Sidebar /> 
    <main className="documents-page">
      <h2>Documents</h2>

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
          {documents.map((d) => (
            <tr key={d.id} onClick={() => handleRowClick(d)}>
              <td>{d.name}</td>
              <td>{d.type}</td>
              <td>{d.status}</td>
              <td>{d.date}</td>
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
            <select name="type" value={newDoc.type} onChange={handleChange} >
            <option value="Budget">Budget</option>
            <option value="Grant Proposal">Grant Proposal</option>
            <option value="Financial">Financial</option>
            <option value="Research">Research</option>
            </select>

            <label>Status:</label>
            <select name="status" value={newDoc.status} onChange={handleChange}>
            <option value="Draft">Draft</option>
            <option value="In-review">In-review</option>
            <option value="In-progress">In-progress</option>
            <option value="Final">Final</option>
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