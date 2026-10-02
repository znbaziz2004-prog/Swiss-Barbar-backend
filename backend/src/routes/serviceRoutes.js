const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
} = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Create service
router.post(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  createService
);


// Get all services
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getServices
);


// Get single service
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getServiceById
);


// Update service
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateService
);


// Update service status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateServiceStatus
);


// Delete service
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  deleteService
);


module.exports = router;