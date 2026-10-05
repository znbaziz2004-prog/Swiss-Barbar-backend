const express = require("express");

const {
  createCheckoutSession,
} = require("../controllers/stripeController");

const {
  handleStripeWebhook,
} = require("../controllers/stripeWebhookController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-checkout-session",
  authMiddleware,
  createCheckoutSession
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;