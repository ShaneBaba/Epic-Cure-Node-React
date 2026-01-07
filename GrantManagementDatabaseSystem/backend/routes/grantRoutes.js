const express = require("express");
const {
    getGrants,
    createGrant,
    updateGrant,
    deleteGrant,
} = require("../controllers/grantController");

const router = express.Router();

router.get("/", getGrants);
router.post("/", createGrant);
router.put("/:id", updateGrant);
router.delete("/:id", deleteGrant);

module.exports = router;
