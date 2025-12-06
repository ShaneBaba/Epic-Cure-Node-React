const express = require("express");
const {listDocuments, createDocument, getDocument, removeDocument, updateDocument }  = require("../controllers/documentController");
const router = express.Router();

router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.delete("/:id", removeDocument);
router.put("/:id", updateDocument);

module.exports = router;
