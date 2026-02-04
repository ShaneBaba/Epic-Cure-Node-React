const express = require("express");
const {
  getGrants,
  createGrant,
  updateGrant,
  deleteGrant,
} = require("../controllers/grantController");

//const { requireAuth, requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

// 🔐 All grant routes require login
//router.use(requireAuth);

router.get("/", getGrants);
router.post("/", createGrant);
router.put("/:id", updateGrant);

// 🔒 Admin-only delete
//router.delete("/:id", requireAdmin, deleteGrant);

module.exports = router;
