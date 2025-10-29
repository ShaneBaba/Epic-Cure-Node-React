const express = require("express");
const { getGrants, createGrant, updateGrant } = require("../controllers/grantController");
const router = express.Router();

router.get("/", getGrants);
router.post("/", createGrant);
router.put("/:id", updateGrant);

module.exports = router;