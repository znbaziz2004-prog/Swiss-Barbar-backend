const express = require("express");

const {
  sendCode,
  verifyCode,
  loginCustomer,
} = require("../controllers/customerAuthController");

const router = express.Router();

// Send email verification code
router.post("/send-code", sendCode);

// Verify email verification code
router.post("/verify-code", verifyCode);

router.post("/login", loginCustomer);

module.exports = router;