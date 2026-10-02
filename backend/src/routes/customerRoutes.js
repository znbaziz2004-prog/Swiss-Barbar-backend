const express = require("express");

const {
  getCustomers,
  getCustomerById,
  updateCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

/*
 * Get customers
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
  getCustomers
);

/*
 * Get customer details + appointment history
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
  getCustomerById
);

/*
 * Update customer
 *
 * Barber is intentionally excluded.
 */
router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist"
  ),
  shopAccessMiddleware,
  updateCustomer
);

module.exports = router;