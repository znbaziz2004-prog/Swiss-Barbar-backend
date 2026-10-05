const { pool } = require("../config/db");

// =====================================================
// GET ALL SUBSCRIPTIONS
// =====================================================

const getAllSubscriptions = async (req, res) => {
  try {
    const [subscriptions] = await pool.query(`
      SELECT
        ss.id,
        ss.shop_id,
        ss.plan_id,
        ss.status,
        ss.start_date,
        ss.end_date,
        ss.next_billing_date,
        ss.auto_renew,
        ss.created_at,

        bs.name AS shop_name,
        u.name AS owner_name,
        u.email AS owner_email,

        sp.name AS plan_name,
        sp.monthly_price AS price,
        sp.currency,
        sp.billing_interval AS billing_cycle

      FROM shop_subscriptions ss

      INNER JOIN barber_shops bs
        ON bs.id = ss.shop_id

      LEFT JOIN users u
        ON u.id = bs.owner_id

      INNER JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      ORDER BY ss.id DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        subscriptions,
      },
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subscriptions",
    });
  }
};

// =====================================================
// GET SUBSCRIPTION BY ID
// =====================================================

const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [subscriptions] = await pool.query(
      `
      SELECT
        ss.id,
        ss.shop_id,
        ss.plan_id,
        ss.status,
        ss.start_date,
        ss.end_date,
        ss.next_billing_date,
        ss.auto_renew,
        ss.created_at,

        bs.name AS shop_name,
        u.name AS owner_name,
        u.email AS owner_email,

        sp.name AS plan_name,
        sp.description AS plan_description,
        sp.monthly_price AS price,
        sp.currency,
        sp.billing_interval AS billing_cycle,
        sp.features

      FROM shop_subscriptions ss

      INNER JOIN barber_shops bs
        ON bs.id = ss.shop_id

      LEFT JOIN users u
        ON u.id = bs.owner_id

      INNER JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      WHERE ss.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        subscription: subscriptions[0],
      },
    });
  } catch (error) {
    console.error("Get subscription by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subscription",
    });
  }
};

// =====================================================
// UPDATE SUBSCRIPTION STATUS
// =====================================================

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "active",
      "past_due",
      "cancelled",
      "expired",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`,
      });
    }

    const [subscriptions] = await pool.query(
      `
      SELECT
        ss.id,
        ss.shop_id,
        ss.status,
        bs.status AS shop_status
      FROM shop_subscriptions ss
      INNER JOIN barber_shops bs
        ON bs.id = ss.shop_id
      WHERE ss.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const subscription = subscriptions[0];

    // -------------------------------------------------
    // Activate subscription
    // -------------------------------------------------

    if (status === "active") {
      await pool.query(
        `
        UPDATE shop_subscriptions
        SET
          status = 'active',
          start_date = COALESCE(start_date, CURDATE()),
          next_billing_date = COALESCE(
            next_billing_date,
            DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
          )
        WHERE id = ?
        `,
        [id]
      );
    }

    // -------------------------------------------------
    // Cancel subscription
    // -------------------------------------------------

    else if (status === "cancelled") {
      await pool.query(
        `
        UPDATE shop_subscriptions
        SET
          status = 'cancelled',
          auto_renew = 0
        WHERE id = ?
        `,
        [id]
      );
    }

    // -------------------------------------------------
    // Other statuses
    // -------------------------------------------------

    else {
      await pool.query(
        `
        UPDATE shop_subscriptions
        SET status = ?
        WHERE id = ?
        `,
        [status, id]
      );
    }

    const [updated] = await pool.query(
      `
      SELECT
        ss.id,
        ss.shop_id,
        ss.plan_id,
        ss.status,
        ss.start_date,
        ss.end_date,
        ss.next_billing_date,
        ss.auto_renew
      FROM shop_subscriptions ss
      WHERE ss.id = ?
      LIMIT 1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Subscription status updated to ${status}`,
      data: {
        subscription: updated[0],
      },
    });
  } catch (error) {
    console.error("Update subscription status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subscription status",
    });
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus,
};