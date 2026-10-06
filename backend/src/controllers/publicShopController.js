const { pool } = require("../config/db");

const getFeaturedShops = async (req, res) => {
  try {
    const [shops] = await pool.query(
      `
      SELECT
        bs.id,
        bs.name,
        bs.description,
        bs.phone,
        bs.email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.currency,
        bs.timezone,
        bs.is_featured,
        bs.featured_until,
        bs.featured_priority,

        sp.id AS subscription_id,
        sp.status AS subscription_status,

        plan.id AS plan_id,
        plan.name AS plan_name,
        plan.monthly_price,
        plan.currency AS plan_currency,
        plan.billing_interval,
        plan.features

      FROM barber_shops bs

      INNER JOIN shop_subscriptions sp
        ON sp.shop_id = bs.id
        AND sp.status = 'active'

      INNER JOIN subscription_plans plan
        ON plan.id = sp.plan_id
        AND plan.status = 'active'

      WHERE bs.status = 'active'
        AND bs.is_featured = TRUE
        AND (
          bs.featured_until IS NULL
          OR bs.featured_until >= CURDATE()
        )
        AND JSON_EXTRACT(plan.features, '$.homepage_featured') = true

      ORDER BY
        bs.featured_priority DESC,
        bs.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    });
  } catch (error) {
    console.error("Get featured shops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured shops",
    });
  }
};

const getPublicShops = async (req, res) => {
  try {
    const {
      city,
      canton,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const conditions = [
      "bs.status = 'active'",
      "sp.status = 'active'",
      "plan.status = 'active'",
    ];

    const params = [];

    if (city) {
      conditions.push("bs.city = ?");
      params.push(city);
    }

    if (canton) {
      conditions.push("bs.canton = ?");
      params.push(canton);
    }

    if (search) {
      conditions.push(`
        (
          bs.name LIKE ?
          OR bs.description LIKE ?
          OR bs.city LIKE ?
          OR bs.canton LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    const whereClause = conditions.join(" AND ");

    const [shops] = await pool.query(
      `
      SELECT
        bs.id,
        bs.name,
        bs.description,
        bs.phone,
        bs.email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.latitude,
        bs.longitude,
        bs.currency,
        bs.timezone,

        CASE
          WHEN JSON_EXTRACT(
            plan.features,
            '$.featured_badge'
          ) = true
          AND bs.is_featured = TRUE
          AND (
            bs.featured_until IS NULL
            OR bs.featured_until >= CURDATE()
          )
          THEN TRUE
          ELSE FALSE
        END AS featured_badge,

        CASE
          WHEN JSON_EXTRACT(
            plan.features,
            '$.priority_listing'
          ) = true
          THEN TRUE
          ELSE FALSE
        END AS priority_listing,

        CASE
          WHEN JSON_EXTRACT(
            plan.features,
            '$.higher_search_visibility'
          ) = true
          THEN TRUE
          ELSE FALSE
        END AS higher_search_visibility,

        plan.id AS plan_id,
        plan.name AS plan_name

      FROM barber_shops bs

      INNER JOIN shop_subscriptions sp
        ON sp.shop_id = bs.id
        AND sp.status = 'active'

      INNER JOIN subscription_plans plan
        ON plan.id = sp.plan_id
        AND plan.status = 'active'

      WHERE ${whereClause}

      ORDER BY
        CASE
          WHEN JSON_EXTRACT(
            plan.features,
            '$.higher_search_visibility'
          ) = true
          THEN 1
          ELSE 0
        END DESC,

        CASE
          WHEN JSON_EXTRACT(
            plan.features,
            '$.priority_listing'
          ) = true
          THEN 1
          ELSE 0
        END DESC,

        CASE
          WHEN bs.is_featured = TRUE
          AND (
            bs.featured_until IS NULL
            OR bs.featured_until >= CURDATE()
          )
          THEN 1
          ELSE 0
        END DESC,

        bs.featured_priority DESC,
        bs.name ASC

      LIMIT ? OFFSET ?
      `,
      [...params, safeLimit, safeOffset]
    );

    return res.status(200).json({
      success: true,
      count: shops.length,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
      },
      data: shops,
    });
  } catch (error) {
    console.error("Get public shops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber shops",
    });
  }
};

const getPublicShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const [shops] = await pool.query(
      `
      SELECT
        bs.id,
        bs.name,
        bs.description,
        bs.phone,
        bs.email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.latitude,
        bs.longitude,
        bs.currency,
        bs.timezone,

        CASE
          WHEN bs.is_featured = TRUE
          AND (
            bs.featured_until IS NULL
            OR bs.featured_until >= CURDATE()
          )
          THEN TRUE
          ELSE FALSE
        END AS is_featured,

        plan.id AS plan_id,
        plan.name AS plan_name

      FROM barber_shops bs

      INNER JOIN shop_subscriptions sp
        ON sp.shop_id = bs.id
        AND sp.status = 'active'

      INNER JOIN subscription_plans plan
        ON plan.id = sp.plan_id
        AND plan.status = 'active'

      WHERE bs.id = ?
        AND bs.status = 'active'

      LIMIT 1
      `,
      [id]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: shops[0],
    });
  } catch (error) {
    console.error("Get public shop by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber shop",
    });
  }
};
const getPublicShopServices = async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.description,
        s.price,
        s.duration_minutes
      FROM services s
      WHERE s.shop_id = ?
        AND s.status = 'active'
      ORDER BY s.name ASC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: services,
    });

  } catch (error) {
    console.error("Get public shop services error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop services",
    });
  }
};

const getPublicShopBookingData = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // 1. Verify shop
    // --------------------------------------------------

    const [shops] = await pool.query(
      `
      SELECT
        bs.id,
        bs.name,
        bs.currency,
        bs.timezone
      FROM barber_shops bs

      INNER JOIN shop_subscriptions sp
        ON sp.shop_id = bs.id
        AND sp.status = 'active'

      INNER JOIN subscription_plans plan
        ON plan.id = sp.plan_id
        AND plan.status = 'active'

      WHERE bs.id = ?
        AND bs.status = 'active'

      LIMIT 1
      `,
      [id]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    const shop = shops[0];

    // --------------------------------------------------
    // 2. Get active branches
    // --------------------------------------------------

    const [branches] = await pool.query(
      `
      SELECT
        id,
        name,
        address,
        city,
        postal_code,
        canton
      FROM branches
      WHERE shop_id = ?
        AND status = 'active'
      ORDER BY name ASC
      `,
      [id]
    );

    // --------------------------------------------------
    // 3. Get active staff
    // --------------------------------------------------

    const [staff] = await pool.query(
      `
      SELECT
        id,
        branch_id,
        display_name,
        bio,
        profile_image
      FROM staff
      WHERE shop_id = ?
        AND status = 'active'
      ORDER BY display_name ASC
      `,
      [id]
    );

    // --------------------------------------------------
    // 4. Get active services
    // --------------------------------------------------

    const [services] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        duration_minutes,
        currency
      FROM services
      WHERE shop_id = ?
        AND status = 'active'
      ORDER BY name ASC
      `,
      [id]
    );

    // --------------------------------------------------
    // 5. Get staff-service assignments
    // --------------------------------------------------

    const [staffServices] = await pool.query(
      `
      SELECT
        staff_id,
        service_id
      FROM staff_services
      WHERE staff_id IN (
        SELECT id
        FROM staff
        WHERE shop_id = ?
          AND status = 'active'
      )
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        shop,
        branches,
        staff,
        services,
        staffServices,
      },
    });

  } catch (error) {
    console.error(
      "Get public shop booking data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking data",
    });
  }
};
module.exports = {
  getFeaturedShops,
  getPublicShops,
  getPublicShopById,
  getPublicShopServices,
  getPublicShopBookingData,
};