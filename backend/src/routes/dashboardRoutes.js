const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getDashboardStats
);

module.exports = router;