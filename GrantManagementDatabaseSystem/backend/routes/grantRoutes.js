const express = require("express");
const {
    getGrants,
    createGrant,
    updateGrant,
    deleteGrant,
    getCategories,
} = require("../controllers/grantController");

const router = express.Router();

router.get("/", getGrants);
router.post("/", createGrant);
router.put("/:id", updateGrant);
router.delete("/:id", deleteGrant);
router.get("/categories", getCategories);

module.exports = router;
