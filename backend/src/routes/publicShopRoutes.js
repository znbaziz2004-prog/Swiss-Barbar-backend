const express = require("express");

const {
  getFeaturedShops,
  getPublicShops,
} = require("../controllers/publicShopController");

const router = express.Router();



// Public featured barber shops
router.get("/featured", getFeaturedShops);
router.get("/", getPublicShops);

module.exports = router;