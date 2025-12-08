const db = require('../db');

// Map database row to frontend-friendly object
function mapRow(row) {
  return {
    id: row.document_id,
    name: row.document_name,
    status: row.document_status,
    date: row.document_date ? row.document_date.toISOString().split("T")[0] : "",
    type: row.document_type,
    notes: row.document_notes,
    documentlink: row.documentlink,
    createdById: row.created_by_id,
    lastEditedById: row.last_edited_by_id,
    createdByName: row.created_by_name || null,
    lastEditedByName: row.last_edited_by_name || null
  };
}

// Get all documents with usernames
async function getAllDocuments() {
  const query = `
    SELECT d.*,
           u1.username AS created_by_name,
           u2.username AS last_edited_by_name
    FROM documents d
    LEFT JOIN users u1 ON d.created_by_id = u1.user_id
    LEFT JOIN users u2 ON d.last_edited_by_id = u2.user_id
    ORDER BY d.document_id;
  `;
  const result = await db.query(query);
  return result.rows.map(mapRow);
}

// Get single document by id with usernames
async function getDocumentById(id) {
  const query = `
    SELECT d.*,
           u1.username AS created_by_name,
           u2.username AS last_edited_by_name
    FROM documents d
    LEFT JOIN users u1 ON d.created_by_id = u1.user_id
    LEFT JOIN users u2 ON d.last_edited_by_id = u2.user_id
    WHERE d.document_id = $1;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

// Add new document
async function addDocument(data, userId) {
  const query = `
    INSERT INTO documents
      (document_name, document_status, document_date, document_type, document_notes, created_by_id, last_edited_by_id, documentlink)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [
    data.name,
    data.status,
    data.date,
    data.type,
    data.notes || null,
    userId, // createdBy
    userId, // lastEditedBy
    data.documentlink || null
  ];
  const result = await db.query(query, values);
  return getDocumentById(result.rows[0].document_id); // return with usernames
}

// Update existing document
async function updateDocument(id, data, userId) {
  const query = `
    UPDATE documents SET
      document_name = $1,
      document_status = $2,
      document_date = $3,
      document_type = $4,
      document_notes = $5,
      last_edited_by_id = $6,
      documentlink = $7
    WHERE document_id = $8
    RETURNING *;
  `;
  const values = [
    data.name,
    data.status,
    data.date,
    data.type,
    data.notes || null,
    userId, // lastEditedBy
    data.documentlink || null,
    id
  ];
  const result = await db.query(query, values);
  if (!result.rows.length) return null;
  return getDocumentById(id); // return updated row with usernames
}

// Delete document
async function deleteDocument(id) {
  const result = await db.query('DELETE FROM documents WHERE document_id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument
};
