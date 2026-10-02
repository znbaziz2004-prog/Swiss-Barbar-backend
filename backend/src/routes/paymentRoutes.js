const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

// Create payment
router.post(
  "/",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist"
  ),
  shopAccessMiddleware,
  createPayment
);

// Get all payments
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
  getPayments
);

// Get payment by ID
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
  getPaymentById
);

// Update payment status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist"
  ),
  shopAccessMiddleware,
  updatePaymentStatus
);

module.exports = router;