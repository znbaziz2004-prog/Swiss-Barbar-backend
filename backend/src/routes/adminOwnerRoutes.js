const express = require("express");

const {
  getAllOwners,
  getOwnerById,
  updateOwnerStatus,

  getBarberRegistrations,
  getBarberRegistrationById,
  getPendingBarberRegistrations,

  reviewBarberRegistration,
  updateShopFeaturedStatus,
} = require("../controllers/adminOwnerController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * =========================================================
 * BARBER REGISTRATIONS
 * =========================================================
 */

// Get all registrations
// Optional: ?status=pending / approved / rejected
router.get(
  "/registrations",
  authMiddleware,
  authorizeRoles("super_admin"),
  getBarberRegistrations
);

// Get pending registrations
router.get(
  "/registrations/pending",
  authMiddleware,
  authorizeRoles("super_admin"),
  getPendingBarberRegistrations
);

// Get single registration
router.get(
  "/registrations/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getBarberRegistrationById
);

// Approve / Reject registration
router.patch(
  "/registrations/:id/review",
  authMiddleware,
  authorizeRoles("super_admin"),
  reviewBarberRegistration
);


/*
 * =========================================================
 * OWNERS
 * =========================================================
 */

// Get all owners
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllOwners
);

// Get owner by ID
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getOwnerById
);

// Update owner status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateOwnerStatus
);


/*
 * =========================================================
 * SHOPS
 * =========================================================
 */

// Update shop featured status
router.patch(
  "/shops/:id/featured",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateShopFeaturedStatus
);

module.exports = router;