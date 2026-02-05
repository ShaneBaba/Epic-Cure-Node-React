const express = require("express");
const {
  getGrants,
  createGrant,
  updateGrant,
  deleteGrant,
  getCategories,
} = require("../controllers/grantController");

const { requireAuth, requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

// All grant routes require login
router.use(requireAuth);

router.get("/", getGrants);
router.post("/", createGrant);
router.put("/:id", updateGrant);

// Only admins can permanently delete grants
router.get("/categories", getCategories);
router.delete("/:id", requireAdmin, deleteGrant);



module.exports = router;
