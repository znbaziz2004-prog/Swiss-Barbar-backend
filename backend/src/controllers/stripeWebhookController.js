const stripe = require("../config/stripe");
const { pool } = require("../config/db");

const handleStripeWebhook = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured.",
      });
    }

    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const subscriptionId = Number(
        session.metadata?.subscriptionId
      );

      if (!subscriptionId) {
        return res.status(200).json({
          received: true,
          message: "No subscription ID in Stripe metadata.",
        });
      }

      const [subscriptions] = await pool.query(
        `
        SELECT
          ss.id,
          ss.shop_id,
          ss.plan_id,
          sp.monthly_price,
          sp.currency
        FROM shop_subscriptions ss
        JOIN subscription_plans sp
          ON sp.id = ss.plan_id
        WHERE ss.id = ?
        LIMIT 1
        `,
        [subscriptionId]
      );

      if (subscriptions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found.",
        });
      }

      const subscription = subscriptions[0];

      const transactionReference =
        session.payment_intent ||
        session.id;

      const amount =
        Number(subscription.monthly_price) || 0;

      const currency =
        subscription.currency || "CHF";

      // Prevent duplicate payment records
      const [existingPayments] = await pool.query(
        `
        SELECT id
        FROM subscription_payments
        WHERE transaction_reference = ?
        LIMIT 1
        `,
        [transactionReference]
      );

      if (existingPayments.length === 0) {
        await pool.query(
          `
          INSERT INTO subscription_payments
          (
            subscription_id,
            amount,
            currency,
            status,
            payment_method,
            transaction_reference,
            paid_at
          )
          VALUES (?, ?, ?, 'paid', 'stripe', ?, NOW())
          `,
          [
            subscriptionId,
            amount,
            currency,
            transactionReference,
          ]
        );
      }

      // Activate subscription
      await pool.query(
        `
        UPDATE shop_subscriptions
        SET
          status = 'active',
          start_date = COALESCE(start_date, CURDATE()),
          updated_at = NOW()
        WHERE id = ?
        `,
        [subscriptionId]
      );
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe Webhook Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};

module.exports = {
  handleStripeWebhook,
};