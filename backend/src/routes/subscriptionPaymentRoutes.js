const express = require("express");

const {
  createSubscriptionPayment,
   confirmSubscriptionPayment,
} = require("../controllers/subscriptionPaymentController");

const router = express.Router();

// Create subscription payment
router.post("/create", createSubscriptionPayment);

router.post("/confirm", confirmSubscriptionPayment);

module.exports = router;