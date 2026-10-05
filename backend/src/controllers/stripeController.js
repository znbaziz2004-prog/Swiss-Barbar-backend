const stripe = require("../config/stripe");
const { pool } = require("../config/db");

const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.",
      });
    }

    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required.",
      });
    }

    const [subscriptions] = await pool.query(
      `
      SELECT
        ss.id,
        ss.shop_id,
        ss.plan_id,
        ss.status,
        sp.name AS plan_name,
        sp.monthly_price,
        sp.currency,
        bs.name AS shop_name
      FROM shop_subscriptions ss
      JOIN subscription_plans sp
        ON sp.id = ss.plan_id
      JOIN barber_shops bs
        ON bs.id = ss.shop_id
      WHERE ss.id = ?
      LIMIT 1
      `,
      [Number(subscriptionId)]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    const subscription = subscriptions[0];

    const amount = Number(subscription.monthly_price);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription amount.",
      });
    }

    const currency = (
      subscription.currency || "CHF"
    ).toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${subscription.plan_name} Subscription`,
              description: subscription.shop_name,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],

      success_url:
        "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "http://localhost:5173/payment-cancelled",

      metadata: {
        subscriptionId: String(subscription.id),
        shopId: String(subscription.shop_id),
        planId: String(subscription.plan_id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Stripe Checkout session created successfully.",
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
        subscriptionId: subscription.id,
        amount,
        currency: subscription.currency || "CHF",
      },
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create Stripe Checkout session.",
      error: error.message,
    });
  }
};

module.exports = {
  createCheckoutSession,
};