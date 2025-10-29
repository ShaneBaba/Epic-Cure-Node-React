// temporary 
let folders = [
  { id: '1', name: '2025', parent_id: null, notes: 'Top-level folder', created_at: new Date() },
  { id: '2', name: 'Budget', parent_id: null, notes: '', created_at: new Date() },
];

function createFolder({ name, parentId = null, notes = '' }) {
  const newFolder = {
    id: Date.now().toString(),
    name,
    parent_id: parentId,
    notes,
    created_at: new Date(),
  };
  folders.push(newFolder);
  return Promise.resolve(newFolder);
}

function listFolders({ parentId = 'root' }) {
  const filtered =
    parentId === 'root'
      ? folders.filter((f) => f.parent_id === null)
      : folders.filter((f) => f.parent_id === parentId);
  return Promise.resolve(filtered);
}

module.exports = { createFolder, listFolders };
