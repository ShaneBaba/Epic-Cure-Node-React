const Folder = require('../models/folderModel');

exports.create = async (req, res, next) => {
  try {
    const { name, parentId, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Folder name required' });
    const folder = await Folder.createFolder({ name: name.trim(), parentId: parentId || null, notes: notes || '' });
    res.status(201).json(folder);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { parentId = 'root' } = req.query;
    const folders = await Folder.listFolders({ parentId });
    res.json(folders);
  } catch (err) { next(err); }
};