const { pool } = require("../config/db");

const checkShopAccess = async (shopId, user) => {
  const [shops] = await pool.query(
    `
    SELECT id, owner_id
    FROM barber_shops
    WHERE id = ?
    LIMIT 1
    `,
    [shopId]
  );

  if (shops.length === 0) {
    return {
      allowed: false,
      status: 404,
      message: "Shop not found",
    };
  }

  const shop = shops[0];

  if (user.role === "super_admin") {
    return {
      allowed: true,
      shop,
    };
  }

  if (user.role === "owner" && shop.owner_id === user.id) {
    return {
      allowed: true,
      shop,
    };
  }

  return {
    allowed: false,
    status: 403,
    message: "You do not have permission to manage this shop",
  };
};


// Create blocked time
const createBlockedTime = async (req, res) => {
  try {
    const {
      shopId,
      branchId,
      staffId,
      title,
      startDatetime,
      endDatetime,
      reason,
    } = req.body;

    if (!shopId || !startDatetime || !endDatetime) {
      return res.status(400).json({
        success: false,
        message:
          "shopId, startDatetime and endDatetime are required",
      });
    }

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "endDatetime must be after startDatetime",
      });
    }

    const access = await checkShopAccess(shopId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    if (branchId) {
      const [branches] = await pool.query(
        `
        SELECT id
        FROM branches
        WHERE id = ?
        AND shop_id = ?
        LIMIT 1
        `,
        [branchId, shopId]
      );

      if (branches.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Branch does not belong to this shop",
        });
      }
    }

    if (staffId) {
      const [staff] = await pool.query(
        `
        SELECT id
        FROM staff
        WHERE id = ?
        AND shop_id = ?
        LIMIT 1
        `,
        [staffId, shopId]
      );

      if (staff.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Staff member does not belong to this shop",
        });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO blocked_times
      (
        shop_id,
        branch_id,
        staff_id,
        title,
        start_datetime,
        end_datetime,
        reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        shopId,
        branchId || null,
        staffId || null,
        title || null,
        startDatetime,
        endDatetime,
        reason || null,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM blocked_times
      WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Blocked time created successfully",
      data: {
        blockedTime: rows[0],
      },
    });
  } catch (error) {
    console.error("Create blocked time error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create blocked time",
    });
  }
};


// Get blocked times
const getBlockedTimes = async (req, res) => {
  try {
    const { shopId, branchId, staffId, startDate, endDate } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const access = await checkShopAccess(shopId, req.user);

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    let query = `
      SELECT
        bt.*,
        b.name AS branch_name,
        s.display_name AS staff_name
      FROM blocked_times bt
      LEFT JOIN branches b
        ON b.id = bt.branch_id
      LEFT JOIN staff s
        ON s.id = bt.staff_id
      WHERE bt.shop_id = ?
    `;

    const params = [shopId];

    if (branchId) {
      query += " AND bt.branch_id = ?";
      params.push(branchId);
    }

    if (staffId) {
      query += " AND bt.staff_id = ?";
      params.push(staffId);
    }

    if (startDate) {
      query += " AND bt.end_datetime >= ?";
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      query += " AND bt.start_datetime <= ?";
      params.push(`${endDate} 23:59:59`);
    }

    query += `
      ORDER BY bt.start_datetime ASC
    `;

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      data: {
        blockedTimes: rows,
      },
    });
  } catch (error) {
    console.error("Get blocked times error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get blocked times",
    });
  }
};


// Update blocked time
const updateBlockedTime = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      `
      SELECT
        bt.*,
        bs.owner_id
      FROM blocked_times bt
      INNER JOIN barber_shops bs
        ON bs.id = bt.shop_id
      WHERE bt.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blocked time not found",
      });
    }

    const record = existing[0];

    if (
      req.user.role !== "super_admin" &&
      (req.user.role !== "owner" ||
        record.owner_id !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to update this blocked time",
      });
    }

    const {
      branchId,
      staffId,
      title,
      startDatetime,
      endDatetime,
      reason,
    } = req.body;

    const finalStart = startDatetime || record.start_datetime;
    const finalEnd = endDatetime || record.end_datetime;

    const start = new Date(finalStart);
    const end = new Date(finalEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "endDatetime must be after startDatetime",
      });
    }

    await pool.query(
      `
      UPDATE blocked_times
      SET
        branch_id = ?,
        staff_id = ?,
        title = ?,
        start_datetime = ?,
        end_datetime = ?,
        reason = ?
      WHERE id = ?
      `,
      [
        branchId !== undefined ? branchId : record.branch_id,
        staffId !== undefined ? staffId : record.staff_id,
        title !== undefined ? title : record.title,
        finalStart,
        finalEnd,
        reason !== undefined ? reason : record.reason,
        id,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM blocked_times
      WHERE id = ?
      `,
      [id]
    );

    return res.json({
      success: true,
      message: "Blocked time updated successfully",
      data: {
        blockedTime: rows[0],
      },
    });
  } catch (error) {
    console.error("Update blocked time error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update blocked time",
    });
  }
};


// Delete blocked time
const deleteBlockedTime = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      `
      SELECT
        bt.id,
        bs.owner_id
      FROM blocked_times bt
      INNER JOIN barber_shops bs
        ON bs.id = bt.shop_id
      WHERE bt.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blocked time not found",
      });
    }

    if (
      req.user.role !== "super_admin" &&
      (req.user.role !== "owner" ||
        existing[0].owner_id !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this blocked time",
      });
    }

    await pool.query(
      `
      DELETE FROM blocked_times
      WHERE id = ?
      `,
      [id]
    );

    return res.json({
      success: true,
      message: "Blocked time deleted successfully",
    });
  } catch (error) {
    console.error("Delete blocked time error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete blocked time",
    });
  }
};


module.exports = {
  createBlockedTime,
  getBlockedTimes,
  updateBlockedTime,
  deleteBlockedTime,
};