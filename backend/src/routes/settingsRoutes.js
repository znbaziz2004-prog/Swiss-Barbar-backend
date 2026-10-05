const express = require("express");

const {
  getSettings,
  saveSettings,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getSettings
);

router.put(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  saveSettings
);

module.exports = router;