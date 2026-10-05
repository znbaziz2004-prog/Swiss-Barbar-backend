const express = require("express");

const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/subscriptionPlanController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllPlans
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getPlanById
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  createPlan
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  updatePlan
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  deletePlan
);

module.exports = router;