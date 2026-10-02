const express = require("express");

const {
  getAppointmentReport,
  getRevenueReport,
  getServicePerformanceReport,
  getStaffPerformanceReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

const reportRoles = [
  "super_admin",
  "owner",
  "manager",
  "receptionist",
];

// ==========================================
// APPOINTMENT REPORT
// ==========================================
router.get(
  "/appointments",
  authMiddleware,
  authorizeRoles(...reportRoles),
  shopAccessMiddleware,
  getAppointmentReport
);

// ==========================================
// REVENUE REPORT
// ==========================================
router.get(
  "/revenue",
  authMiddleware,
  authorizeRoles(...reportRoles),
  shopAccessMiddleware,
  getRevenueReport
);

// ==========================================
// SERVICE PERFORMANCE
// ==========================================
router.get(
  "/services",
  authMiddleware,
  authorizeRoles(...reportRoles),
  shopAccessMiddleware,
  getServicePerformanceReport
);

// ==========================================
// STAFF PERFORMANCE
// ==========================================
router.get(
  "/staff",
  authMiddleware,
  authorizeRoles(...reportRoles),
  shopAccessMiddleware,
  getStaffPerformanceReport
);

module.exports = router;