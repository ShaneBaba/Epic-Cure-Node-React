const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getAllTypes, getUsedTypes, addType, updateType, deleteType } = require('../models/documentTypeModel');

router.get('/document-types', requireAuth, async (req, res) => {
  try {
    const types = await getAllTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching types' });
  }
});

router.get('/document-types/used', requireAuth, async (req, res) => {
  try {
    const types = await getUsedTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching used types' });
  }
});

router.post('/document-types', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { typeName } = req.body;
    if (!typeName?.trim()) return res.status(400).json({ message: 'Type name is required' });
    const type = await addType(typeName.trim());
    res.status(201).json(type);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Type already exists' });
    res.status(500).json({ message: 'Error adding type' });
  }
});

router.put('/document-types/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { typeName } = req.body;
    if (!typeName?.trim()) return res.status(400).json({ message: 'Type name is required' });
    const type = await updateType(parseInt(req.params.id), typeName.trim());
    if (!type) return res.status(404).json({ message: 'Type not found' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: 'Error updating type' });
  }
});

router.delete('/document-types/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await deleteType(parseInt(req.params.id));
    if (result.error) return res.status(400).json({ message: result.error });
    res.json({ message: 'Type deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting type' });
  }
});

module.exports = router;