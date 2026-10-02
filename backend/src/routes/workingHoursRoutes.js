const express = require("express");

const {
  createWorkingHour,
  getWorkingHours,
  updateWorkingHour,
  deleteWorkingHour,
} = require("../controllers/workingHoursController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  createWorkingHour
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getWorkingHours
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateWorkingHour
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  deleteWorkingHour
);

module.exports = router;