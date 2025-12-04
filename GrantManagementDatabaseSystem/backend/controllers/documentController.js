const DocumentModel = require("../models/documentModel");

function listDocuments(req, res) {
  const docs = DocumentModel.getAllDocuments();
  return res.json(docs); 
}

function createDocument(req, res) {
  const { name, type, status, date, notes, kind, document, createdby } = req.body;
  if (!name || !date) return res.status(400).json({ message: "name and date are required" });

  const created = DocumentModel.addDocument({
    name: String(name).trim(),
    type: String(type || "-").trim(),
    status: status || "Not Started",
    date, 
    notes: String(notes || ""),
    kind: kind || "document",
    document: String(document || ""),
    createdby: String(createdby || ""),
  });

  return res.status(201).json(created);
}

function getDocument(req, res) {
  const doc = DocumentModel.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  return res.json(doc);
}

function removeDocument(req, res) {
  const deleted = DocumentModel.deleteDocument(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  return res.json({ ok: true, deleted });
}

function updateDocument(req, res) {
  const id = req.params.id;
  const updates = req.body;

  const updated = DocumentModel.updateDocument(id, updates);

  if (!updated) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json(updated);
}

module.exports = { listDocuments, createDocument, getDocument, removeDocument, updateDocument };
