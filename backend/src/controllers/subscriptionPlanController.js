const { pool } = require("../config/db");

const getAllPlans = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        description,
        monthly_price,
        currency,
        billing_interval,
        features,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      ORDER BY monthly_price ASC, id ASC
    `);

    const plans = rows.map((plan) => ({
      ...plan,
      price: Number(plan.monthly_price),
      billing_cycle: plan.billing_interval,
      features:
        typeof plan.features === "string"
          ? (() => {
              try {
                return JSON.parse(plan.features);
              } catch {
                return [];
              }
            })()
          : plan.features || [],
    }));

    return res.status(200).json({
      success: true,
      data: {
        plans,
      },
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
    });
  }
};

const getPlanById = async (req, res) => {
  try {
    const planId = Number(req.params.id);

    if (!planId || planId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        monthly_price,
        currency,
        billing_interval,
        features,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const plan = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        plan: {
          ...plan,
          price: Number(plan.monthly_price),
          billing_cycle: plan.billing_interval,
          features:
            typeof plan.features === "string"
              ? (() => {
                  try {
                    return JSON.parse(plan.features);
                  } catch {
                    return [];
                  }
                })()
              : plan.features || [],
        },
      },
    });
  } catch (error) {
    console.error("Get subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plan",
    });
  }
};

const createPlan = async (req, res) => {
  try {
    const {
      name,
      description = "",
      price,
      monthly_price,
      currency = "CHF",
      billing_cycle,
      billing_interval,
      features = [],
      status = "active",
    } = req.body;

    const finalPrice =
      monthly_price !== undefined ? monthly_price : price;

    const finalBillingInterval =
      billing_interval || billing_cycle || "monthly";

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required",
      });
    }

    if (
      finalPrice === undefined ||
      finalPrice === null ||
      Number.isNaN(Number(finalPrice)) ||
      Number(finalPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid plan price is required",
      });
    }

    if (!["monthly", "yearly"].includes(finalBillingInterval)) {
      return res.status(400).json({
        success: false,
        message: "Billing interval must be monthly or yearly",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const featuresValue =
      typeof features === "string"
        ? features
        : JSON.stringify(features || []);

    const [result] = await pool.query(
      `
      INSERT INTO subscription_plans
      (
        name,
        description,
        monthly_price,
        currency,
        billing_interval,
        features,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(name).trim(),
        description,
        Number(finalPrice),
        currency,
        finalBillingInterval,
        featuresValue,
        status,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        monthly_price,
        currency,
        billing_interval,
        features,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: {
        plan: rows[0],
      },
    });
  } catch (error) {
    console.error("Create subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription plan",
    });
  }
};

const updatePlan = async (req, res) => {
  try {
    const planId = Number(req.params.id);

    if (!planId || planId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const {
      name,
      description,
      price,
      monthly_price,
      currency,
      billing_cycle,
      billing_interval,
      features,
      status,
    } = req.body;

    const [existingRows] = await pool.query(
      `
      SELECT *
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const existing = existingRows[0];

    const finalName =
      name !== undefined ? String(name).trim() : existing.name;

    const finalDescription =
      description !== undefined
        ? description
        : existing.description;

    const finalPrice =
      monthly_price !== undefined
        ? monthly_price
        : price !== undefined
          ? price
          : existing.monthly_price;

    const finalCurrency =
      currency !== undefined
        ? currency
        : existing.currency;

    const finalBillingInterval =
      billing_interval ||
      billing_cycle ||
      existing.billing_interval;

    const finalFeatures =
      features !== undefined
        ? typeof features === "string"
          ? features
          : JSON.stringify(features || [])
        : existing.features;

    const finalStatus =
      status !== undefined
        ? status
        : existing.status;

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required",
      });
    }

    if (
      Number.isNaN(Number(finalPrice)) ||
      Number(finalPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid plan price is required",
      });
    }

    if (!["monthly", "yearly"].includes(finalBillingInterval)) {
      return res.status(400).json({
        success: false,
        message: "Billing interval must be monthly or yearly",
      });
    }

    if (!["active", "inactive"].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    await pool.query(
      `
      UPDATE subscription_plans
      SET
        name = ?,
        description = ?,
        monthly_price = ?,
        currency = ?,
        billing_interval = ?,
        features = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        finalName,
        finalDescription,
        Number(finalPrice),
        finalCurrency,
        finalBillingInterval,
        finalFeatures,
        finalStatus,
        planId,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        monthly_price,
        currency,
        billing_interval,
        features,
        status,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: {
        plan: rows[0],
      },
    });
  } catch (error) {
    console.error("Update subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subscription plan",
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const planId = Number(req.params.id);

    if (!planId || planId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const [subscriptions] = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM shop_subscriptions
      WHERE plan_id = ?
        AND status IN ('pending', 'active', 'past_due')
      `,
      [planId]
    );

    if (Number(subscriptions[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This plan cannot be deleted because it is currently used by an active or pending subscription.",
      });
    }

    await pool.query(
      `
      DELETE FROM subscription_plans
      WHERE id = ?
      `,
      [planId]
    );

    return res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete subscription plan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete subscription plan",
    });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};