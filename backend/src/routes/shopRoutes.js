const express = require("express");

const {
  createShop,
  registerShop,
  getShopProfile,
  updateShopProfile,
  getAllShops,
  getShopById,
  updateShopStatus,
} = require("../controllers/shopController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

router.post("/register", registerShop);

/*
 * =========================================================
 * SUPER ADMIN — ALL SHOPS
 * =========================================================
 */

// Get all barber shops
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllShops
);


/*
 * =========================================================
 * SHOP PROFILE
 * =========================================================
 */

// Get current user's shop profile
//
// IMPORTANT:
// This route must come BEFORE /:id
// otherwise "profile" can be treated as an ID.
router.get(
  "/profile",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getShopProfile
);


// Update current user's shop profile
router.patch(
  "/profile",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  updateShopProfile
);


/*
 * =========================================================
 * SUPER ADMIN — SHOP STATUS
 * =========================================================
 */

// Activate / suspend / deactivate / set pending
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateShopStatus
);


/*
 * =========================================================
 * SUPER ADMIN — SINGLE SHOP
 * =========================================================
 */

// Get specific shop details
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getShopById
);


module.exports = router;