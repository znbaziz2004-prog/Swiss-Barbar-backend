const express = require("express");

const {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus,
} = require("../controllers/subscriptionController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// SUPER ADMIN — ALL SUBSCRIPTIONS
// =====================================================

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllSubscriptions
);

// =====================================================
// SUPER ADMIN — SINGLE SUBSCRIPTION
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getSubscriptionById
);

// =====================================================
// SUPER ADMIN — UPDATE STATUS
// =====================================================

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateSubscriptionStatus
);

module.exports = router;