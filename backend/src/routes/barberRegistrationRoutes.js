const express = require("express");

const {
  registerBarber,
} = require("../controllers/barberRegistrationController");

const router = express.Router();

// Public barber/shop registration
router.post("/register", registerBarber);

module.exports = router;