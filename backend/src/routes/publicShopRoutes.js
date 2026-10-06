const express = require("express");

const {
  getFeaturedShops,
  getPublicShops,
  getPublicShopById,
  getPublicShopServices,
  getPublicShopBookingData,
} = require("../controllers/publicShopController");

const router = express.Router();

// Public featured barber shops
router.get("/featured", getFeaturedShops);

// Public barber shops
router.get("/", getPublicShops);

// Public shop services
router.get("/:id/services", getPublicShopServices);

// Public shop booking data
router.get("/:id/booking-data", getPublicShopBookingData);

// Public shop details
router.get("/:id", getPublicShopById);

module.exports = router;