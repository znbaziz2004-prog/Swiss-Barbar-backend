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
// =====================================================
// GET ALL BARBER REGISTRATIONS — SUPER ADMIN
// =====================================================

const getRegistrations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        br.id,
        br.registration_status AS status,
        br.business_name AS shop_name,

        bs.phone AS shop_phone,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,

        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,

        sp.name AS plan_name,

        br.created_at,
        br.updated_at

      FROM barber_registrations br

      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id

      INNER JOIN users u
        ON u.id = br.user_id

      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id

      LEFT JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      ORDER BY br.created_at DESC
    `);

    return res.json({
      success: true,
      registrations: rows,
    });
  } catch (error) {
    console.error("Get registrations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load registrations",
    });
  }
};


// =====================================================
// GET SINGLE REGISTRATION — SUPER ADMIN
// =====================================================

const getRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        br.id,
        br.registration_status AS status,
        br.business_name AS shop_name,

        br.registration_data,
        br.add_ons,
        br.rejection_reason,
        br.reviewed_by,
        br.reviewed_at,

        bs.phone AS shop_phone,
        bs.email AS shop_email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.currency,
        bs.timezone,

        u.id AS owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.monthly_price,
        sp.currency AS plan_currency,
        sp.billing_interval,

        ss.id AS subscription_id,
        ss.status AS subscription_status,

        br.created_at,
        br.updated_at

      FROM barber_registrations br

      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id

      INNER JOIN users u
        ON u.id = br.user_id

      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id

      LEFT JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      WHERE br.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const registration = rows[0];

    // Convert JSON fields when MySQL returns them as strings
    if (typeof registration.registration_data === "string") {
      try {
        registration.registration_data = JSON.parse(
          registration.registration_data
        );
      } catch (error) {
        registration.registration_data = {};
      }
    }

    if (typeof registration.add_ons === "string") {
      try {
        registration.add_ons = JSON.parse(registration.add_ons);
      } catch (error) {
        registration.add_ons = {};
      }
    }

    return res.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Get registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load registration",
    });
  }
};


// =====================================================
// APPROVE REGISTRATION — SUPER ADMIN
// =====================================================

const approveRegistration = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    // Get registration
    const [registrations] = await connection.query(
      `
      SELECT
        id,
        user_id,
        shop_id,
        registration_status
      FROM barber_registrations
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const registration = registrations[0];

    if (registration.registration_status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Registration is already approved",
      });
    }

    if (registration.registration_status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Rejected registration cannot be approved",
      });
    }

    await connection.beginTransaction();

    // Approve registration
    await connection.query(
      `
      UPDATE barber_registrations
      SET
        registration_status = 'approved',
        reviewed_by = ?,
        reviewed_at = NOW()
      WHERE id = ?
      `,
      [
        req.user?.id || null,
        id,
      ]
    );

    // Activate owner account
    await connection.query(
      `
      UPDATE users
      SET status = 'active'
      WHERE id = ?
      `,
      [registration.user_id]
    );

    // Activate shop
    await connection.query(
      `
      UPDATE barber_shops
      SET status = 'active'
      WHERE id = ?
      `,
      [registration.shop_id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Registration approved successfully",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Approve registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve registration",
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// REJECT REGISTRATION — SUPER ADMIN
// =====================================================

const rejectRegistration = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const [registrations] = await connection.query(
      `
      SELECT
        id,
        user_id,
        shop_id,
        registration_status
      FROM barber_registrations
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const registration = registrations[0];

    if (registration.registration_status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved registration cannot be rejected",
      });
    }

    if (registration.registration_status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Registration is already rejected",
      });
    }

    await connection.beginTransaction();

    // Reject registration
    await connection.query(
      `
      UPDATE barber_registrations
      SET
        registration_status = 'rejected',
        rejection_reason = ?,
        reviewed_by = ?,
        reviewed_at = NOW()
      WHERE id = ?
      `,
      [
        reason.trim(),
        req.user?.id || null,
        id,
      ]
    );

    // Keep owner inactive
    await connection.query(
      `
      UPDATE users
      SET status = 'inactive'
      WHERE id = ?
      `,
      [registration.user_id]
    );

    // Keep shop inactive/pending
    await connection.query(
      `
      UPDATE barber_shops
      SET status = 'inactive'
      WHERE id = ?
      `,
      [registration.shop_id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Registration rejected successfully",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Reject registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject registration",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  registerBarber,
  getRegistrations,
  getRegistration,
  approveRegistration,
  rejectRegistration,
};