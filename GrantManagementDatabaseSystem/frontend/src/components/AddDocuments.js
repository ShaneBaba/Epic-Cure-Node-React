import { useState } from "react";
import { Link } from "react-router-dom"; 

function AddDocuments() {
  return (
    <div className="adddocuments-page">

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

      <label htmlFor="createBy">Created By:</label>
    </div>
  );
}

export default AddDocuments;
