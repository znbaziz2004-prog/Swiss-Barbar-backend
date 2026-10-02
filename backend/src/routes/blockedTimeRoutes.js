const express = require("express");

const {
  createBlockedTime,
  getBlockedTimes,
  updateBlockedTime,
  deleteBlockedTime,
} = require("../controllers/blockedTimeController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  createBlockedTime
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getBlockedTimes
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateBlockedTime
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  deleteBlockedTime
);

module.exports = router;