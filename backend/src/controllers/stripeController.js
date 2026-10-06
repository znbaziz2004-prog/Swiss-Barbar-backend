const stripe = require("../config/stripe");
const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| Subscription Checkout
|--------------------------------------------------------------------------
*/

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
        paymentType: "subscription",
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


/*
|--------------------------------------------------------------------------
| Appointment Checkout
|--------------------------------------------------------------------------
*/

const createAppointmentCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.",
      });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get appointment
    |--------------------------------------------------------------------------
    */

    const [appointments] = await pool.query(
      `
      SELECT
        a.id,
        a.shop_id,
        a.customer_id,
        a.total_amount,
        a.currency,
        a.status,
        a.appointment_date,
        a.start_time,
        a.end_time,

        bs.name AS shop_name,

        c.name AS customer_name,
        c.email AS customer_email

      FROM appointments a

      INNER JOIN barber_shops bs
        ON bs.id = a.shop_id

      INNER JOIN customers c
        ON c.id = a.customer_id

      WHERE a.id = ?

      LIMIT 1
      `,
      [Number(appointmentId)]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const appointment = appointments[0];

    /*
    |--------------------------------------------------------------------------
    | Shop Access
    |--------------------------------------------------------------------------
    */

    if (
      req.user.role !== "super_admin" &&
      req.shopId !== appointment.shop_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this appointment.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Amount
    |--------------------------------------------------------------------------
    */

    const amount = Number(appointment.total_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment payment amount.",
      });
    }

    const currency = (
      appointment.currency || "CHF"
    ).toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Active Payment
    |--------------------------------------------------------------------------
    */

    const [existingPayments] = await pool.query(
      `
      SELECT
        id,
        status
      FROM payments
      WHERE appointment_id = ?
        AND status IN ('pending', 'paid')
      ORDER BY id DESC
      LIMIT 1
      `,
      [appointment.id]
    );

    if (existingPayments.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An active payment already exists for this appointment.",
        data: {
          paymentId: existingPayments[0].id,
          status: existingPayments[0].status,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Stripe Checkout Session
    |--------------------------------------------------------------------------
    */

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email:
        appointment.customer_email || undefined,

      line_items: [
        {
          price_data: {
            currency,

            product_data: {
              name: `${appointment.shop_name} Appointment`,

              description:
                `${appointment.appointment_date} at ${appointment.start_time}`,
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
        paymentType: "appointment",
        appointmentId: String(appointment.id),
        shopId: String(appointment.shop_id),
        customerId: String(appointment.customer_id),
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Create Pending Payment Record
    |--------------------------------------------------------------------------
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
        transaction_reference
      )
      VALUES (?, ?, ?, 'stripe', 'pending', ?)
      `,
      [
        appointment.id,
        amount,
        appointment.currency || "CHF",
        session.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Appointment Stripe Checkout session created successfully.",

      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
        appointmentId: appointment.id,
        amount,
        currency: appointment.currency || "CHF",
        customerEmail: appointment.customer_email,
      },
    });

  } catch (error) {
    console.error(
      "Appointment Stripe Checkout Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not create appointment Stripe Checkout session.",
      error: error.message,
    });
  }
};


module.exports = {
  createCheckoutSession,
  createAppointmentCheckoutSession,
};