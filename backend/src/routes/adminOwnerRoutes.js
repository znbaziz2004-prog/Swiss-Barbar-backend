const express = require("express");

const {
  getAllOwners,
   getOwnerById,
   updateOwnerStatus,

} = require("../controllers/adminOwnerController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * Super Admin only
 */

// Get all owners

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getOwnerById
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  getAllOwners
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("super_admin"),
  updateOwnerStatus
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  getOwnerById
);



module.exports = router;