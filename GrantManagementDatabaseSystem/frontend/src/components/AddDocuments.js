import { useState } from "react";
import { Link } from "react-router-dom"; 

function AddDocuments() {
  return (
    <div className="adddocuments-page">

        <header className="documents-headerbar">
        <div className="logo">Epic-cure-logo</div>
        <nav className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/grants">Grants</Link>
          <Link to="/documents">Documents</Link>
          <Link to="/home">Logout</Link>
        </nav>

      </header>

      <label htmlFor="grantId">Grant ID</label>
      <select name="grantId" id="grantId">
        <option value="G001">G001</option>
        <option value="G002">G002</option>
        <option value="G003">G003</option>
        <option value="G004">G004</option>
      </select>

      <label htmlFor="docName">Document Name</label>
      <input type="text" id="docName" name="docName" placeholder="" />

      <label htmlFor="docType">Document Type</label>
      <select name="docType" id="docType">
        <option value="Budget">Budget</option>
        <option value="GrantProposal">Grant Proposal</option>
      </select>

      <label htmlFor="docStatus">Document Status</label>
      <select name="docStatus" id="docStatus">
        <option value="Draft">Draft</option>
        <option value="Inreview">In-review</option>
        <option value="Inprogress">In-progress</option>
        <option value="Final">Final</option>
      </select>

      <label htmlFor="uploadDate">Date</label>
      <input type="date" id="uploadDate" name="uploadDate" />

      <label htmlFor="docNotes">Notes</label>
      <input type="text" id="docNotes" name="docNotes" placeholder="" />

      <button className="document-edit-button">Edit</button>
      <button className="document-delete-button">Delete</button>

      <label htmlFor="createBy">Created By:</label>
      <label htmlFor="editedBy">Edited By:</label>
    </div>
  );
}

export default AddDocuments;
