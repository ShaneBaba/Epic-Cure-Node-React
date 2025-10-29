let documents = [
  {
    id: 1,
    kind: "folder",
    name: "2025",
    type: "-",
    status: "-",
    date: "2025-01-05",
    notes: "",
    document: "",
    createdby: "",
  },
  {
    id: 2,
    kind: "document",
    name: "Budget - May",
    type: "Financial",
    status: "In-review",
    date: "2025-10-20",
    notes: "Budget for the month",
    document: "https://example.com/budget-may",
    createdby: "Ayati",
  },
];

function getAllDocuments() {
  return documents; 
}

function addDocument(doc) {
  doc.id = documents.length + 1;
  documents.push(doc);
  return doc;
}

function getDocumentById(id) {
  return documents.find((d) => d.id === parseInt(id, 10));
}

function deleteDocument(id) {
  const idx = documents.findIndex((d) => d.id === parseInt(id, 10));
  if (idx !== -1) return documents.splice(idx, 1)[0];
  return null;
}

module.exports = { getAllDocuments, addDocument, getDocumentById, deleteDocument };
