const express = require("express");

const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  updateStaffStatus,
} = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();


// =====================================================
// GET ALL STAFF
// =====================================================
// Super Admin can see all shops.
// Owner / Manager / Receptionist / Barber
// are restricted to their own shop.

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
  getAllStaff
);


// =====================================================
// GET STAFF BY ID
// =====================================================

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
  getStaffById
);


// =====================================================
// CREATE STAFF
// =====================================================
// Only Super Admin, Owner and Manager can create staff.

router.post(
  "/",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  createStaff
);


// =====================================================
// UPDATE STAFF
// =====================================================
// Only Super Admin, Owner and Manager can update staff.

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  updateStaff
);


// =====================================================
// UPDATE STAFF STATUS
// =====================================================
// Only Super Admin, Owner and Manager can
// activate/deactivate staff.

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  updateStaffStatus
);


module.exports = router;