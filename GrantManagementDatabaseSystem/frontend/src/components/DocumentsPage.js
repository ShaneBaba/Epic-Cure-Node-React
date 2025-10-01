import { useState } from "react";
import { Link } from "react-router-dom"; 
import "./DocumentsPage.css";

function DocumentsPage() {
  const mockDocuments = [
    {
      grantId: "G001",
      name: "Food Bank Research",
      type: "Research Proposal",
      status: "Completed",
      date: "01-01-2025",
    },
    {
      grantId: "G002",
      name: "Food and Food Budget Plan",
      type: "Budget Plan",
      status: "In-review",
      date: "02-02-2025",
    },
    {
      grantId: "G003",
      name: "Foodie's Place Grant Proposal",
      type: "Grant Proposal",
      status: "In-progress",
      date: "03-03-2025",
    },
  ];

  return (
     <div className="documents-page">
      
      <header className="documents-headerbar">
        <div className="logo">Epic-cure-logo</div>
        <nav className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/grants">Grants</Link>
          <Link to="/home">Logout</Link>
        </nav>
      </header>
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
              <th>Grant ID</th>
              <th>Document Name</th>
              <th>Document Type</th>
              <th>Document Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockDocuments.map((doc) => (
              <tr key={doc.grantId}>
                <td>{doc.grantId}</td>
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