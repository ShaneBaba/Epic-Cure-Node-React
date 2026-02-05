const express = require("express");
const {
  getDocuments,
  createDocument,
  getDocument,
  deleteDocument,
  updateDocument,
} = require("../controllers/documentController");

const { requireAuth, requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

// All document routes require login
router.use(requireAuth);

router.get("/", getDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);

// Only admins can permanently delete documents
router.delete("/:id", requireAdmin, deleteDocument);

module.exports = router;
