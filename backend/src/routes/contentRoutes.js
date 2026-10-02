const express = require("express");

const {
  getContents,
  getContentById,
  createContent,
  updateContent,
  updateContentStatus,
  deleteContent,
} = require("../controllers/contentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

const readRoles = [
  "super_admin",
  "owner",
  "manager",
  "receptionist",
];

const writeRoles = [
  "super_admin",
  "owner",
  "manager",
];

// GET ALL CONTENT
router.get(
  "/",
  authMiddleware,
  authorizeRoles(...readRoles),
  shopAccessMiddleware,
  getContents
);

// GET SINGLE CONTENT
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(...readRoles),
  shopAccessMiddleware,
  getContentById
);

// CREATE CONTENT
router.post(
  "/",
  authMiddleware,
  authorizeRoles(...writeRoles),
  shopAccessMiddleware,
  createContent
);

// UPDATE CONTENT
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(...writeRoles),
  shopAccessMiddleware,
  updateContent
);

// UPDATE CONTENT STATUS
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(...writeRoles),
  shopAccessMiddleware,
  updateContentStatus
);

// DELETE CONTENT
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(...writeRoles),
  shopAccessMiddleware,
  deleteContent
);

module.exports = router;