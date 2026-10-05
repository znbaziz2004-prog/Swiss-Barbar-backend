const Stripe = require("stripe");

const secretKey = process.env.STRIPE_SECRET_KEY;

const stripe = secretKey
  ? new Stripe(secretKey)
  : null;

module.exports = stripe;