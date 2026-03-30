const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");

const FAQ = require("../models/faqModel");

router.use(requireAuth);

router.get("/faqs", async (req, res) => {
    const { search, category } = req.query;
    const data = await FAQ.getFAQs({ search, category });
    res.json(data);
});

router.post("/faqs", async (req, res) => {
    const userId = req.user?.id;
    const faq = await FAQ.addFAQ(req.body, userId);
    res.status(201).json(faq);
});

router.put("/faqs/:id", async (req, res) => {
    const userId = req.user?.id;
    const updated = await FAQ.updateFAQ(req.params.id, req.body, userId);

    if (!updated) {
        return res.status(404).json({ message: "FAQ not found" });
    }

    res.json(updated);
});

router.delete("/faqs/:id", requireAdmin, async (req, res) => {
    const success = await FAQ.deleteFAQ(req.params.id);

    if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted" });
});

router.get("/faqs/categories", async (req, res) => {
    const categories = await FAQ.getUsedCategories();
    res.json(categories);
});

module.exports = router;