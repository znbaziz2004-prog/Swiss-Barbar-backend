const express = require("express");

const {
  createReview,
  getReviews,
  getReviewById,
  updateReviewStatus,
  getReviewSummary,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

/*
 * Customer submits review
 *
 * Public for now because customer booking/review flow
 * will later use a secure customer mechanism.
 */
router.post("/", createReview);

/*
 * Get shop reviews
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
  getReviews
);

/*
 * Review summary
 */
router.get(
  "/summary",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getReviewSummary
);

/*
 * Get single review
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
  getReviewById
);

/*
 * Approve / reject review
 */
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager"
    
  ),
  shopAccessMiddleware,
  updateReviewStatus
);

module.exports = router;