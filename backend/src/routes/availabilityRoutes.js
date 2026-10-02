const express = require("express");

const {
  getAvailableSlots,
} = require("../controllers/availabilityController");

const router = express.Router();

router.get("/", getAvailableSlots);

module.exports = router;