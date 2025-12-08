const express = require("express");
const { getDocuments, createDocument, getDocument, deleteDocument, updateDocument } = require("../controllers/documentController");
const router = express.Router();

router.get("/", getDocuments);       
router.post("/", createDocument);   
router.get("/:id", getDocument);     
router.delete("/:id", deleteDocument);
router.put("/:id", updateDocument);  

module.exports = router;
