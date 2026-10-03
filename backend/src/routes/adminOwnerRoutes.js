const express = require("express");

const {
  getAllOwners,
   getOwnerById,
   updateOwnerStatus,
   reviewBarberRegistration,
  getPendingBarberRegistrations,
   updateShopFeaturedStatus,

} = require("../controllers/adminOwnerController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * Super Admin only
 */

// Get all owners

router.get(
  "/registrations/pending",
  authMiddleware,
  authorizeRoles("super_admin"),
  getPendingBarberRegistrations
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getOwnerById
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllOwners
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateOwnerStatus
);

router.patch(
  "/registrations/:id/review",
  authMiddleware,
  authorizeRoles("super_admin"),
  reviewBarberRegistration
);

router.patch(
  "/shops/:id/featured",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateShopFeaturedStatus
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getOwnerById
);



module.exports = router;