const express = require("express");

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
} = require("../controllers/branchController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Create branch
router.post(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  createBranch
);


// Get all branches
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getBranches
);


// Get single branch
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  getBranchById
);


// Update branch
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateBranch
);


// Update branch status
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  updateBranchStatus
);


// Delete branch
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin", "owner"),
  deleteBranch
);


module.exports = router;