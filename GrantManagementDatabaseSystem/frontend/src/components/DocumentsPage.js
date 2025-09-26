import { useState } from "react";
import "./DocumentsPage.css";

function DocumentsPage() {
  return (
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
        <button className="documents-button">Add</button>
        <button className="documents-button">Upload Document</button>
      </div>

      <table className="documents-table">
        <thead>
          <tr>
            <th>Grant ID</th>
            <th>Document Name</th>
            <th>Document Type</th>
            <th>Document Status</th>
            <th>Date</th>
          </tr>
        </thead>
      </table>
      
    </div>
  );
}

export default DocumentsPage;