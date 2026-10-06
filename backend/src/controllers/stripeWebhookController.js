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

      const paymentType = session.metadata?.paymentType;

      /*
      |--------------------------------------------------------------------------
      | APPOINTMENT PAYMENT
      |--------------------------------------------------------------------------
      */

      if (paymentType === "appointment") {
        const appointmentId = Number(
          session.metadata?.appointmentId
        );

        if (!appointmentId) {
          return res.status(200).json({
            received: true,
            message: "No appointment ID in Stripe metadata.",
          });
        }

        const [appointments] = await pool.query(
          `
          SELECT
            id,
            shop_id,
            total_amount,
            currency
          FROM appointments
          WHERE id = ?
          LIMIT 1
          `,
          [appointmentId]
        );

        if (appointments.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Appointment not found.",
          });
        }

        const appointment = appointments[0];

        const transactionReference =
          session.payment_intent || session.id;

        const amount =
          Number(session.amount_total) / 100;

        const currency =
          (session.currency || appointment.currency || "CHF")
            .toUpperCase();

        /*
        |--------------------------------------------------------------------------
        | Find Stripe payment
        |--------------------------------------------------------------------------
        */

        const [payments] = await pool.query(
          `
          SELECT
            id,
            amount,
            currency,
            status
          FROM payments
          WHERE appointment_id = ?
            AND transaction_reference = ?
          LIMIT 1
          `,
          [
            appointmentId,
            session.id,
          ]
        );

        if (payments.length === 0) {
          /*
          Create payment if it does not exist
          */

          await pool.query(
            `
            INSERT INTO payments
            (
              appointment_id,
              amount,
              currency,
              method,
              status,
              transaction_reference,
              paid_at
            )
            VALUES (?, ?, ?, 'stripe', 'paid', ?, NOW())
            `,
            [
              appointmentId,
              amount,
              currency,
              session.id,
            ]
          );
        } else {
          /*
          Update existing pending payment
          */

          await pool.query(
            `
            UPDATE payments
            SET
              status = 'paid',
              method = 'stripe',
              transaction_reference = ?,
              paid_at = NOW()
            WHERE id = ?
            `,
            [
              transactionReference,
              payments[0].id,
            ]
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Mark Appointment Paid
        |--------------------------------------------------------------------------
        */

        await pool.query(
          `
          UPDATE appointments
          SET
            payment_status = 'paid',
            updated_at = NOW()
          WHERE id = ?
          `,
          [appointmentId]
        );

        console.log(
          `✅ Appointment payment completed: ${appointmentId}`
        );

        return res.status(200).json({
          received: true,
          message: "Appointment payment processed successfully.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SUBSCRIPTION PAYMENT
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Prevent duplicate subscription payment
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Activate Subscription
      |--------------------------------------------------------------------------
      */

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

      console.log(
        `✅ Subscription payment completed: ${subscriptionId}`
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