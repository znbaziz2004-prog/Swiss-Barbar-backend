const express = require("express");

const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotificationStatus,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

/*
 * Get all notifications
 *
 * Accessible by shop staff/management.
 */
router.get(
  "/",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getNotifications
);

/*
 * Get notification by ID
 */
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getNotificationById
);

/*
 * Create notification manually
 *
 * Normally appointment notifications should be
 * created automatically by appointment actions.
 */
router.post(
  "/",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  createNotification
);

/*
 * Update notification status
 */
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  updateNotificationStatus
);

module.exports = router;