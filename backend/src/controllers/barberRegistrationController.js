const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");


// =====================================================
// BARBER / SHOP REGISTRATION
// =====================================================

const registerBarber = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      email,
      phone,
      password,

      // Shop information
      shopName,
      description,
      shopPhone,
      shopEmail,
      website,

      // Address
      address,
      city,
      postalCode,
      canton,

      // Subscription
      planId,

      // Optional registration add-ons
      addOns,
    } = req.body;


    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !shopName ||
      !address ||
      !city ||
      !postalCode ||
      !planId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, password, shop name, address, city, postal code and plan are required",
      });
    }


    // =====================================================
    // VALIDATE PLAN
    // =====================================================

    const [plans] = await connection.query(
      `
      SELECT
        id,
        name,
        monthly_price,
        currency,
        billing_interval,
        status
      FROM subscription_plans
      WHERE id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected subscription plan is not available",
      });
    }

    const selectedPlan = plans[0];


    // =====================================================
    // CHECK EXISTING USER
    // =====================================================

    const [existingUsers] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }


    // =====================================================
    // START TRANSACTION
    // =====================================================

    await connection.beginTransaction();


    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const passwordHash = await bcrypt.hash(password, 12);


    // =====================================================
    // CREATE OWNER
    // =====================================================

    const [userResult] = await connection.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone,
        password_hash,
        role,
        status
      )
      VALUES (?, ?, ?, ?, 'owner', 'inactive')
      `,
      [
        name,
        email,
        phone,
        passwordHash,
      ]
    );

    const userId = userResult.insertId;


    // =====================================================
    // CREATE BARBER SHOP
    // =====================================================

    const [shopResult] = await connection.query(
      `
      INSERT INTO barber_shops
      (
        owner_id,
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        postal_code,
        canton,
        country,
        currency,
        timezone,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Switzerland', 'CHF', 'Europe/Zurich', 'pending')
      `,
      [
        userId,
        shopName,
        description || null,
        shopPhone || phone,
        shopEmail || email,
        website || null,
        address,
        city,
        postalCode,
        canton || null,
      ]
    );

    const shopId = shopResult.insertId;


    // =====================================================
    // CREATE BARBER REGISTRATION
    // =====================================================

    const registrationData = {
      description: description || null,
      shopPhone: shopPhone || phone,
      shopEmail: shopEmail || email,
      website: website || null,
      address,
      city,
      postalCode,
      canton: canton || null,
    };

    const normalizedAddOns = addOns || {};


    await connection.query(
      `
      INSERT INTO barber_registrations
      (
        user_id,
        shop_id,
        registration_status,
        business_name,
        registration_data,
        add_ons
      )
      VALUES (?, ?, 'pending', ?, ?, ?)
      `,
      [
        userId,
        shopId,
        shopName,
        JSON.stringify(registrationData),
        JSON.stringify(normalizedAddOns),
      ]
    );


    // =====================================================
    // CREATE PENDING SUBSCRIPTION
    // =====================================================

    const [subscriptionResult] = await connection.query(
      `
      INSERT INTO shop_subscriptions
      (
        shop_id,
        plan_id,
        status,
        auto_renew
      )
      VALUES (?, ?, 'pending', TRUE)
      `,
      [
        shopId,
        selectedPlan.id,
      ]
    );

    const subscriptionId = subscriptionResult.insertId;


    // =====================================================
    // COMMIT TRANSACTION
    // =====================================================

    await connection.commit();


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Barber registration submitted successfully. Your account is pending approval and payment.",

      data: {
        user: {
          id: userId,
          name,
          email,
          phone,
          role: "owner",
          status: "inactive",
        },

        shop: {
          id: shopId,
          name: shopName,
          status: "pending",
        },

        registration: {
          status: "pending",
        },

        subscription: {
          id: subscriptionId,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          monthlyPrice: selectedPlan.monthly_price,
          currency: selectedPlan.currency,
          billingInterval: selectedPlan.billing_interval,
          status: "pending",
        },

        nextStep: "payment",
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

    console.error("Barber registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Barber registration failed",
    });

  } finally {
    connection.release();
  }
};


module.exports = {
  registerBarber,
};