const DocumentModel = require("../models/documentModel");

// Function for all documents (display)
async function getDocuments(req, res) {
  try {
    const documents = await DocumentModel.getAllDocuments();
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching documents" });
  }
}

// Function for a particular document (by id)
async function getDocument(req, res) {
  try {
    const { id } = req.params;
    const document = await DocumentModel.getDocumentById(parseInt(id));
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ message: "Error fetching document" });
  }
}
// Function for creating a document
async function createDocument(req, res) {
  try {
    const data = req.body;
    const userId = req.user?.id;

    data.createdById = userId;
    data.lastEditedById = userId;

    const newDocument = await DocumentModel.addDocument(data, userId);
    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating document" });
  }
}

// Function for updating a document
async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user?.id;

    data.lastEditedById = userId; 

    const updatedDocument = await DocumentModel.updateDocument(parseInt(id), data, userId);
    if (!updatedDocument) return res.status(404).json({ message: "Document not found" });
    res.json(updatedDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating document" });
  }
}

// Function for deleting a document
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const deleted = await DocumentModel.deleteDocument(parseInt(id));
    if (!deleted) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting document" });
  }
}

module.exports = { getDocuments, getDocument, createDocument, updateDocument, deleteDocument };
