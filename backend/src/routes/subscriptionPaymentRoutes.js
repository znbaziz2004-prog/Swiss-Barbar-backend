const express = require("express");

const {
  createSubscriptionPayment,
   confirmSubscriptionPayment,
   getSubscriptionPayments,
} = require("../controllers/subscriptionPaymentController");

const router = express.Router();

router.get("/", getSubscriptionPayments);

// Create subscription payment
router.post("/create", createSubscriptionPayment);

router.post("/confirm", confirmSubscriptionPayment);

module.exports = router;