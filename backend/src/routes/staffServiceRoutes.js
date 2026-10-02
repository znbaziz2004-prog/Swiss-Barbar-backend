const express = require("express");

const {
  getStaffServices,
  assignService,
  removeService,
  replaceStaffServices,
} = require("../controllers/staffServiceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();


// =====================================================
// GET STAFF SERVICES
// =====================================================

router.get(
  "/:staffId/services",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getStaffServices
);


// =====================================================
// ASSIGN SERVICE
// =====================================================
// Owner / Manager / Super Admin

router.post(
  "/:staffId/services",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  assignService
);


// =====================================================
// REPLACE ALL STAFF SERVICES
// =====================================================
// Owner / Manager / Super Admin

router.put(
  "/:staffId/services",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  replaceStaffServices
);


// =====================================================
// REMOVE SERVICE
// =====================================================
// Owner / Manager / Super Admin

router.delete(
  "/:staffId/services/:serviceId",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
  ),
  shopAccessMiddleware,
  removeService
);


module.exports = router;