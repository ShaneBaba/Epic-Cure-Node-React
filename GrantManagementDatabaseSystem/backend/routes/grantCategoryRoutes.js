const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

const {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
} = require('../models/grantCategoryModel');

router.get('/grant-categories', requireAuth, async (req, res) => {
    res.json(await getAllCategories());
});

router.post('/grant-categories', requireAuth, requireAdmin, async (req, res) => {
    const { name } = req.body;
    res.status(201).json(await addCategory(name));
});

router.put('/grant-categories/:id', requireAuth, requireAdmin, async (req, res) => {
    res.json(await updateCategory(req.params.id, req.body.name));
});

router.delete('/grant-categories/:id', requireAuth, requireAdmin, async (req, res) => {
    res.json(await deleteCategory(req.params.id));
});

module.exports = router;