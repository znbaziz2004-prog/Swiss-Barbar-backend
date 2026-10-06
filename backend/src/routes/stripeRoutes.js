const express = require("express");

const {
  createCheckoutSession,
  createAppointmentCheckoutSession,
} = require("../controllers/stripeController");

const {
  handleStripeWebhook,
} = require("../controllers/stripeWebhookController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Subscription Payment
|--------------------------------------------------------------------------
*/

router.post(
  "/create-checkout-session",
  authMiddleware,
  createCheckoutSession
);


/*
|--------------------------------------------------------------------------
| Appointment Payment
|--------------------------------------------------------------------------
*/

router.post(
  "/create-appointment-checkout",
  authMiddleware,
  createAppointmentCheckoutSession
);


/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
*/

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;