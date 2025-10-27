import { useState } from "react";
import { Link } from "react-router-dom"; 
import "./DocumentsPage.css";

function DocumentsPage() {
  return (
     <div className="documents-page">
    <div className="documents-container">

      <div className="documents-header">
        <h1>Documents</h1>
      </div>

      <div className="documents-controls">
        <input
          type="text"
          placeholder="Search..."
          className="documents-search"
        />

        <button className="documents-button">Sort By</button>
         <Link to="/AddDocuments">
          <button className="documents-button">Upload Document</button>
         </Link>
      </div>

      <table className="documents-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Document Type</th>
              <th>Document Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockDocuments.map((doc) => (
              <tr>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td>{doc.status}</td>
                <td>{doc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      
    </div>
    </div>
  );
}

export default DocumentsPage;