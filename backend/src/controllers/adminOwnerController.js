const { pool } = require("../config/db");

/*
 * =========================================================
 * GET ALL OWNERS
 * =========================================================
 */

const getAllOwners = async (req, res) => {
  try {
    const [owners] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.created_at,
        u.updated_at,

        COUNT(bs.id) AS shops_count,
        GROUP_CONCAT(
          DISTINCT bs.name
          ORDER BY bs.name
          SEPARATOR ', '
        ) AS shop_names

      FROM users u

      LEFT JOIN barber_shops bs
        ON bs.owner_id = u.id

      WHERE u.role = 'owner'

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.created_at,
        u.updated_at

      ORDER BY u.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        owners,
      },
    });
  } catch (error) {
    console.error("Get all owners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch owners",
    });
  }
};

const getOwnerById = async (req, res) => {
  try {
    const ownerId = Number(req.params.id);

    if (!ownerId || ownerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID",
      });
    }

    const [owners] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
        AND role = 'owner'
      LIMIT 1
      `,
      [ownerId]
    );

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const [shops] = await pool.query(
      `
      SELECT
        id,
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
        tax_rate,
        status,
        created_at,
        updated_at
      FROM barber_shops
      WHERE owner_id = ?
      ORDER BY created_at DESC
      `,
      [ownerId]
    );

    return res.status(200).json({
  success: true,
  data: {
    owner: {
      ...owners[0],
      shops,
    },
  },
});
  } catch (error) {
    console.error("Get owner by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner details",
    });
  }
};

const updateOwnerStatus = async (req, res) => {
  try {
    const ownerId = Number(req.params.id);
    const { status } = req.body;

    if (!ownerId || ownerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID",
      });
    }

    const allowedStatuses = [
      "active",
      "inactive",
      "suspended",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: active, inactive, suspended",
      });
    }

    const [owners] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status
      FROM users
      WHERE id = ?
        AND role = 'owner'
      LIMIT 1
      `,
      [ownerId]
    );

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const previousStatus = owners[0].status;

    await pool.query(
      `
      UPDATE users
      SET status = ?
      WHERE id = ?
        AND role = 'owner'
      `,
      [status, ownerId]
    );

    const [updatedOwners] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status,
        updated_at
      FROM users
      WHERE id = ?
        AND role = 'owner'
      LIMIT 1
      `,
      [ownerId]
    );

    return res.status(200).json({
      success: true,
      message: "Owner status updated successfully",
      data: {
        previous_status: previousStatus,
        owner: updatedOwners[0],
      },
    });
  } catch (error) {
    console.error(
      "Update owner status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update owner status",
    });
  }
};

const reviewBarberRegistration = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const registrationId = Number(req.params.id);
    const { action, rejectionReason } = req.body;
    const reviewerId = req.user.id;

    if (!registrationId || registrationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either approve or reject",
      });
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const [registrations] = await connection.query(
      `
      SELECT
        br.id,
        br.user_id,
        br.shop_id,
        br.registration_status,
        br.business_name,
        u.name AS owner_name,
        u.email AS owner_email,
        u.status AS owner_status,
        bs.status AS shop_status,
        ss.id AS subscription_id,
        ss.status AS subscription_status
      FROM barber_registrations br
      INNER JOIN users u
        ON u.id = br.user_id
      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id
      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id
      WHERE br.id = ?
      LIMIT 1
      `,
      [registrationId]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber registration not found",
      });
    }

    const registration = registrations[0];

    if (registration.registration_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Registration has already been ${registration.registration_status}`,
      });
    }

    if (action === "approve") {
      if (registration.subscription_status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Registration cannot be approved because subscription is not active",
        });
      }
    }

    await connection.beginTransaction();

    if (action === "approve") {
      await connection.query(
        `
        UPDATE barber_registrations
        SET
          registration_status = 'approved',
          rejection_reason = NULL,
          reviewed_by = ?,
          reviewed_at = NOW()
        WHERE id = ?
        `,
        [reviewerId, registrationId]
      );

      await connection.query(
        `
        UPDATE barber_shops
        SET status = 'active'
        WHERE id = ?
        `,
        [registration.shop_id]
      );

      await connection.query(
        `
        UPDATE users
        SET status = 'active'
        WHERE id = ?
          AND role = 'owner'
        `,
        [registration.user_id]
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Barber registration approved successfully",
        data: {
          registration: {
            id: registration.id,
            status: "approved",
          },
          owner: {
            id: registration.user_id,
            status: "active",
          },
          shop: {
            id: registration.shop_id,
            status: "active",
          },
          subscription: {
            id: registration.subscription_id,
            status: "active",
          },
          nextStep: "barber_login",
        },
      });
    }

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
      [rejectionReason, reviewerId, registrationId]
    );

    await connection.query(
      `
      UPDATE barber_shops
      SET status = 'inactive'
      WHERE id = ?
      `,
      [registration.shop_id]
    );

    await connection.query(
      `
      UPDATE users
      SET status = 'inactive'
      WHERE id = ?
        AND role = 'owner'
      `,
      [registration.user_id]
    );

    await connection.query(
      `
      UPDATE shop_subscriptions
      SET status = 'cancelled'
      WHERE id = ?
        AND status = 'active'
      `,
      [registration.subscription_id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Barber registration rejected successfully",
      data: {
        registration: {
          id: registration.id,
          status: "rejected",
          rejectionReason,
        },
        owner: {
          id: registration.user_id,
          status: "inactive",
        },
        shop: {
          id: registration.shop_id,
          status: "inactive",
        },
        nextStep: "registration_rejected",
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Review barber registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review barber registration",
    });
  } finally {
    connection.release();
  }
};

const getPendingBarberRegistrations = async (req, res) => {
  try {
    const [registrations] = await pool.query(`
      SELECT
        br.id,
        br.user_id,
        br.shop_id,
        br.registration_status,
        br.business_name,
        br.registration_data,
        br.add_ons,
        br.created_at,

        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,

        bs.name AS shop_name,
        bs.phone AS shop_phone,
        bs.email AS shop_email,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.status AS shop_status,

        ss.id AS subscription_id,
        ss.status AS subscription_status,
        ss.start_date,
        ss.next_billing_date,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.monthly_price,
        sp.currency,
        sp.billing_interval

      FROM barber_registrations br

      INNER JOIN users u
        ON u.id = br.user_id

      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id

      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id

      LEFT JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      WHERE br.registration_status = 'pending'

      ORDER BY br.created_at ASC
    `);

    return res.status(200).json({
      success: true,
      data: {
        registrations,
      },
    });
  } catch (error) {
    console.error(
      "Get pending barber registrations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending barber registrations",
    });
  }
};

/*
 * =========================================================
 * GET ALL BARBER REGISTRATIONS
 * =========================================================
 */

const getBarberRegistrations = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    let query = `
      SELECT
        br.id,
        br.user_id,
        br.shop_id,
        br.registration_status AS status,
        br.business_name,

        br.rejection_reason,
        br.created_at,
        br.updated_at,

        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,

        bs.name AS shop_name,
        bs.phone AS shop_phone,
        bs.email AS shop_email,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.status AS shop_status,

        ss.id AS subscription_id,
        ss.status AS subscription_status,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.monthly_price,
        sp.currency,
        sp.billing_interval

      FROM barber_registrations br

      INNER JOIN users u
        ON u.id = br.user_id

      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id

      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id

      LEFT JOIN subscription_plans sp
        ON sp.id = ss.plan_id
    `;

    const params = [];

    if (status) {
      query += `
        WHERE br.registration_status = ?
      `;

      params.push(status);
    }

    query += `
      ORDER BY br.created_at DESC
    `;

    const [registrations] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: {
        registrations,
      },
    });
  } catch (error) {
    console.error("Get barber registrations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber registrations",
    });
  }
};


/*
 * =========================================================
 * GET BARBER REGISTRATION BY ID
 * =========================================================
 */

const getBarberRegistrationById = async (req, res) => {
  try {
    const registrationId = Number(req.params.id);

    if (!registrationId || registrationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    const [registrations] = await pool.query(
      `
      SELECT
        br.id,
        br.user_id,
        br.shop_id,

        br.registration_status AS status,
        br.business_name,
        br.registration_data,
        br.add_ons,
        br.rejection_reason,

        br.reviewed_by,
        br.reviewed_at,

        br.created_at,
        br.updated_at,

        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.status AS owner_status,

        bs.name AS shop_name,
        bs.description AS shop_description,
        bs.phone AS shop_phone,
        bs.email AS shop_email,
        bs.website AS shop_website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.currency,
        bs.timezone,
        bs.tax_rate,
        bs.status AS shop_status,

        ss.id AS subscription_id,
        ss.status AS subscription_status,
        ss.start_date,
        ss.end_date,
        ss.next_billing_date,
        ss.auto_renew,

        sp.id AS plan_id,
        sp.name AS plan_name,
        sp.description AS plan_description,
        sp.monthly_price,
        sp.currency AS plan_currency,
        sp.billing_interval,
        sp.features AS plan_features

      FROM barber_registrations br

      INNER JOIN users u
        ON u.id = br.user_id

      INNER JOIN barber_shops bs
        ON bs.id = br.shop_id

      LEFT JOIN shop_subscriptions ss
        ON ss.shop_id = br.shop_id

      LEFT JOIN subscription_plans sp
        ON sp.id = ss.plan_id

      WHERE br.id = ?

      LIMIT 1
      `,
      [registrationId]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: registrations[0],
    });
  } catch (error) {
    console.error(
      "Get barber registration by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber registration",
    });
  }
};

const updateShopFeaturedStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const shopId = req.params.id;

    const {
      isFeatured,
      featuredUntil,
      featuredPriority,
    } = req.body;

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be true or false",
      });
    }

    const [shops] = await connection.query(
      `
      SELECT
        bs.id,
        bs.name,
        bs.status,
        sp.status AS subscription_status,
        plan.name AS plan_name,
        plan.features
      FROM barber_shops bs

      LEFT JOIN shop_subscriptions sp
        ON sp.shop_id = bs.id
        AND sp.status = 'active'

      LEFT JOIN subscription_plans plan
        ON plan.id = sp.plan_id
        AND plan.status = 'active'

      WHERE bs.id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    const shop = shops[0];

    if (isFeatured) {
      if (shop.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active barber shops can be featured",
        });
      }

      if (shop.subscription_status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Shop must have an active subscription",
        });
      }

      let features = shop.features;

      if (typeof features === "string") {
        try {
          features = JSON.parse(features);
        } catch (error) {
          features = {};
        }
      }

      if (!features || features.homepage_featured !== true) {
        return res.status(400).json({
          success: false,
          message:
            "Selected subscription plan does not include homepage featured listing",
        });
      }
    }

    const priority =
      featuredPriority !== undefined
        ? Number(featuredPriority)
        : 0;

    if (!Number.isInteger(priority) || priority < 0) {
      return res.status(400).json({
        success: false,
        message: "featuredPriority must be a non-negative integer",
      });
    }

    await connection.query(
      `
      UPDATE barber_shops
      SET
        is_featured = ?,
        featured_until = ?,
        featured_priority = ?
      WHERE id = ?
      `,
      [
        isFeatured ? 1 : 0,
        isFeatured ? featuredUntil || null : null,
        isFeatured ? priority : 0,
        shopId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: isFeatured
        ? "Barber shop featured successfully"
        : "Barber shop removed from featured listings",
      data: {
        shopId: Number(shopId),
        isFeatured,
        featuredUntil: isFeatured ? featuredUntil || null : null,
        featuredPriority: isFeatured ? priority : 0,
      },
    });
  } catch (error) {
    console.error("Update shop featured status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update featured status",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  updateOwnerStatus,

  getBarberRegistrations,
  getBarberRegistrationById,
  getPendingBarberRegistrations,

  reviewBarberRegistration,
  updateShopFeaturedStatus,
};