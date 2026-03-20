const db = require('../db');

async function getAllTypes() {
  const result = await db.query('SELECT * FROM document_types ORDER BY type_name');
  return result.rows;
}

async function getUsedTypes() {
  const result = await db.query(`
    SELECT DISTINCT dt.*
    FROM document_types dt
    INNER JOIN documents d ON d.document_type = dt.type_name
    ORDER BY dt.type_name
  `);
  return result.rows;
}

async function addType(typeName) {
  const result = await db.query(
    'INSERT INTO document_types (type_name) VALUES ($1) RETURNING *',
    [typeName]
  );
  return result.rows[0];
}

async function updateType(id, typeName) {
  const old = await db.query('SELECT type_name FROM document_types WHERE type_id = $1', [id]);
  if (!old.rows[0]) return null;

  const oldName = old.rows[0].type_name;

  await db.query('UPDATE documents SET document_type = $1 WHERE document_type = $2', [typeName, oldName]);

  const result = await db.query(
    'UPDATE document_types SET type_name = $1 WHERE type_id = $2 RETURNING *',
    [typeName, id]
  );
  return result.rows[0];
}
async function deleteType(id) {
  const typeResult = await db.query('SELECT type_name FROM document_types WHERE type_id = $1', [id]);
  if (!typeResult.rows[0]) return { error: 'Type not found' };

  const typeName = typeResult.rows[0].type_name;

  const inUse = await db.query(
    'SELECT COUNT(*) FROM documents WHERE document_type = $1',
    [typeName]
  );

  const count = parseInt(inUse.rows[0].count);
  if (count > 0) {
    return { error: `Cannot delete — ${count} document(s) are using this type. Update them first.` };
  }

  await db.query('DELETE FROM document_types WHERE type_id = $1', [id]);
  return { success: true };
}

module.exports = { getAllTypes, getUsedTypes, addType, updateType, deleteType };