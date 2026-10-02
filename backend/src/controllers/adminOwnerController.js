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

        COUNT(bs.id) AS shop_count,

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
        owner: owners[0],
        shops,
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
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: active, inactive",
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

module.exports = {
  getAllOwners,
  getOwnerById,
  updateOwnerStatus,
};