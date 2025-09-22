const express = require("express");
const { getGrants, createGrant } = require("../controllers/grantController");
const router = express.Router();

router.get("/", getGrants);
router.post("/", createGrant);

module.exports = router;
