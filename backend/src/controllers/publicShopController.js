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

module.exports = {
  getFeaturedShops,
  getPublicShops,
};