const { pool } = require("../config/db");


// =====================================================
// CREATE SUBSCRIPTION PAYMENT
// =====================================================

const createSubscriptionPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      subscriptionId,
      paymentMethod,
    } = req.body;


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required",
      });
    }


    // =====================================================
    // GET SUBSCRIPTION + PLAN
    // =====================================================

    const [subscriptions] = await connection.query(
      `
      SELECT
        ss.id AS subscription_id,
        ss.shop_id,
        ss.plan_id,
        ss.status AS subscription_status,

        sp.name AS plan_name,
        sp.monthly_price,
        sp.currency,
        sp.billing_interval

      FROM shop_subscriptions ss

      INNER JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      WHERE ss.id = ?
      LIMIT 1
      `,
      [subscriptionId]
    );


    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }


    const subscription = subscriptions[0];


    // =====================================================
    // CHECK SUBSCRIPTION STATUS
    // =====================================================

    if (subscription.subscription_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be created for a pending subscription",
      });
    }


    // =====================================================
    // CHECK EXISTING PENDING PAYMENT
    // =====================================================

    const [existingPayments] = await connection.query(
      `
      SELECT
        id,
        amount,
        currency,
        status,
        payment_method,
        created_at

      FROM subscription_payments

      WHERE subscription_id = ?
        AND status = 'pending'

      ORDER BY id DESC

      LIMIT 1
      `,
      [subscriptionId]
    );


    if (existingPayments.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A pending payment already exists for this subscription",
        data: {
          payment: existingPayments[0],
        },
      });
    }


    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    await connection.beginTransaction();


    const [paymentResult] = await connection.query(
      `
      INSERT INTO subscription_payments
      (
        subscription_id,
        amount,
        currency,
        billing_period_start,
        billing_period_end,
        status,
        payment_method
      )
      VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'pending', ?)
      `,
      [
        subscription.subscription_id,
        subscription.monthly_price,
        subscription.currency,
        paymentMethod || "pending",
      ]
    );


    const paymentId = paymentResult.insertId;


    await connection.commit();


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message: "Subscription payment created successfully",

      data: {
        payment: {
          id: paymentId,
          subscriptionId: subscription.subscription_id,
          amount: subscription.monthly_price,
          currency: subscription.currency,
          status: "pending",
          paymentMethod: paymentMethod || "pending",
        },

        subscription: {
          id: subscription.subscription_id,
          shopId: subscription.shop_id,
          planId: subscription.plan_id,
          planName: subscription.plan_name,
          billingInterval: subscription.billing_interval,
          status: subscription.subscription_status,
        },

        nextStep: "payment_processing",
      },
    });

  } catch (error) {

    // =====================================================
    // ROLLBACK
    // =====================================================

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Create subscription payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription payment",
    });

  } finally {
    connection.release();
  }
};


// =====================================================
// CONFIRM SUBSCRIPTION PAYMENT
// =====================================================

const confirmSubscriptionPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      paymentId,
      transactionReference,
      invoiceNumber,
    } = req.body;


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!paymentId || !transactionReference || !invoiceNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Payment ID, transaction reference and invoice number are required",
      });
    }


    // =====================================================
    // GET PAYMENT
    // =====================================================

    const [payments] = await connection.query(
      `
      SELECT
        sp.id,
        sp.subscription_id,
        sp.amount,
        sp.currency,
        sp.status,
        ss.shop_id

      FROM subscription_payments sp

      INNER JOIN shop_subscriptions ss
        ON ss.id = sp.subscription_id

      WHERE sp.id = ?
      LIMIT 1
      `,
      [paymentId]
    );


    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription payment not found",
      });
    }


    const payment = payments[0];


    // =====================================================
    // CHECK PAYMENT STATUS
    // =====================================================

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been paid",
      });
    }


    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending payments can be confirmed",
      });
    }


    // =====================================================
    // START TRANSACTION
    // =====================================================

    await connection.beginTransaction();


    // =====================================================
    // UPDATE PAYMENT
    // =====================================================

    await connection.query(
      `
      UPDATE subscription_payments
      SET
        status = 'paid',
        transaction_reference = ?,
        invoice_number = ?,
        paid_at = NOW()
      WHERE id = ?
      `,
      [
        transactionReference,
        invoiceNumber,
        paymentId,
      ]
    );


    // =====================================================
    // ACTIVATE SUBSCRIPTION
    // =====================================================

    await connection.query(
      `
      UPDATE shop_subscriptions
      SET
        status = 'active',
        start_date = CURDATE(),
        next_billing_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
      WHERE id = ?
      `,
      [payment.subscription_id]
    );


    // =====================================================
    // COMMIT
    // =====================================================

    await connection.commit();


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.json({
      success: true,
      message: "Subscription payment confirmed successfully",

      data: {
        payment: {
          id: payment.id,
          subscriptionId: payment.subscription_id,
          amount: payment.amount,
          currency: payment.currency,
          status: "paid",
          transactionReference,
          invoiceNumber,
        },

        subscription: {
          id: payment.subscription_id,
          shopId: payment.shop_id,
          status: "active",
          startDate: new Date().toISOString().split("T")[0],
        },

        nextStep: "super_admin_approval",
      },
    });

  } catch (error) {

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Confirm subscription payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm subscription payment",
    });

  } finally {
    connection.release();
  }
};

const getSubscriptionPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT
        sp.id,
        sp.subscription_id,
        sp.amount,
        sp.currency,
        sp.billing_period_start,
        sp.billing_period_end,
        sp.status,
        sp.payment_method,
        sp.transaction_reference,
        sp.invoice_number,
        sp.paid_at,
        sp.created_at,

        ss.shop_id,
        ss.plan_id,

        bs.name AS shop_name,
        sp2.name AS plan_name

      FROM subscription_payments sp

      INNER JOIN shop_subscriptions ss
        ON ss.id = sp.subscription_id

      INNER JOIN barber_shops bs
        ON bs.id = ss.shop_id

      INNER JOIN subscription_plans sp2
        ON sp2.id = ss.plan_id

      ORDER BY sp.id DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        payments,
      },
    });
  } catch (error) {
    console.error("Get subscription payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subscription payments",
    });
  }
};
module.exports = {
  createSubscriptionPayment,
  confirmSubscriptionPayment,
   getSubscriptionPayments,
};