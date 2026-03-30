const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");

const {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
} = require("../models/faqCategoryModel");

router.get("/faq-categories", requireAuth, async (req, res) => {
    res.json(await getAllCategories());
});

router.post("/faq-categories", requireAuth, requireAdmin, async (req, res) => {
    res.status(201).json(await addCategory(req.body.name));
});

router.put("/faq-categories/:id", requireAuth, requireAdmin, async (req, res) => {
    res.json(await updateCategory(req.params.id, req.body.name));
});

router.delete("/faq-categories/:id", requireAuth, requireAdmin, async (req, res) => {
    res.json(await deleteCategory(req.params.id));
});

module.exports = router;