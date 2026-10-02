const { pool } = require("../config/db");

// =====================================================
// CHECK SHOP ACCESS
// =====================================================

const checkShopAccess = async (shopId, user) => {
  const numericShopId = Number(shopId);

  if (!numericShopId || numericShopId <= 0) {
    return {
      allowed: false,
      status: 400,
      message: "Valid shopId is required",
    };
  }

  const [shops] = await pool.query(
    `
    SELECT
      id,
      owner_id,
      status
    FROM barber_shops
    WHERE id = ?
    LIMIT 1
    `,
    [numericShopId]
  );

  if (shops.length === 0) {
    return {
      allowed: false,
      status: 404,
      message: "Shop not found",
    };
  }

  const shop = shops[0];

  // Super Admin
  if (user.role === "super_admin") {
    return {
      allowed: true,
      shop,
    };
  }

  // Owner
  if (
    user.role === "owner" &&
    Number(shop.owner_id) === Number(user.id)
  ) {
    return {
      allowed: true,
      shop,
    };
  }

  return {
    allowed: false,
    status: 403,
    message:
      "You do not have permission to manage this shop",
  };
};


// =====================================================
// VALIDATE BRANCH
// =====================================================

const validateBranch = async (branchId, shopId) => {
  if (branchId === null || branchId === undefined) {
    return true;
  }

  const numericBranchId = Number(branchId);

  if (!numericBranchId || numericBranchId <= 0) {
    return false;
  }

  const [branches] = await pool.query(
    `
    SELECT id
    FROM branches
    WHERE id = ?
      AND shop_id = ?
    LIMIT 1
    `,
    [numericBranchId, shopId]
  );

  return branches.length > 0;
};


// =====================================================
// VALIDATE STAFF
// =====================================================

const validateStaff = async (staffId, shopId) => {
  if (staffId === null || staffId === undefined) {
    return true;
  }

  const numericStaffId = Number(staffId);

  if (!numericStaffId || numericStaffId <= 0) {
    return false;
  }

  const [staff] = await pool.query(
    `
    SELECT id
    FROM staff
    WHERE id = ?
      AND shop_id = ?
    LIMIT 1
    `,
    [numericStaffId, shopId]
  );

  return staff.length > 0;
};


// =====================================================
// CREATE WORKING HOUR
// =====================================================

const createWorkingHour = async (req, res) => {
  try {
    const {
      shopId,
      branchId,
      staffId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable = true,
    } = req.body;

    // Required fields
    if (
      shopId === undefined ||
      shopId === null ||
      dayOfWeek === undefined ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "shopId, dayOfWeek, startTime and endTime are required",
      });
    }

    const numericShopId = Number(shopId);
    const numericDay = Number(dayOfWeek);

    if (!numericShopId || numericShopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid shopId is required",
      });
    }

    if (
      !Number.isInteger(numericDay) ||
      numericDay < 0 ||
      numericDay > 6
    ) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek must be between 0 and 6",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "endTime must be after startTime",
      });
    }

    // Check shop access
    const access = await checkShopAccess(
      numericShopId,
      req.user
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    // Validate branch
    if (
      !(await validateBranch(
        branchId,
        numericShopId
      ))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Branch does not belong to this shop",
      });
    }

    // Validate staff
    if (
      !(await validateStaff(
        staffId,
        numericShopId
      ))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Staff member does not belong to this shop",
      });
    }

    // Prevent duplicate schedule
    const [existing] = await pool.query(
      `
      SELECT id
      FROM working_hours
      WHERE shop_id = ?
        AND (
          branch_id <=> ?
        )
        AND (
          staff_id <=> ?
        )
        AND day_of_week = ?
      LIMIT 1
      `,
      [
        numericShopId,
        branchId ?? null,
        staffId ?? null,
        numericDay,
      ]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Working hours already exist for this day",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO working_hours
      (
        shop_id,
        branch_id,
        staff_id,
        day_of_week,
        start_time,
        end_time,
        is_available
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        numericShopId,
        branchId ?? null,
        staffId ?? null,
        numericDay,
        startTime,
        endTime,
        isAvailable ? 1 : 0,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM working_hours
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message:
        "Working hour created successfully",
      data: {
        workingHour: rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Create working hour error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create working hour",
    });
  }
};


// =====================================================
// GET WORKING HOURS
// =====================================================

const getWorkingHours = async (req, res) => {
  try {
    const {
      shopId,
      branchId,
      staffId,
    } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const numericShopId = Number(shopId);

    // Check access
    const access = await checkShopAccess(
      numericShopId,
      req.user
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    let query = `
      SELECT
        wh.id,
        wh.shop_id,
        wh.branch_id,
        wh.staff_id,
        wh.day_of_week,
        wh.start_time,
        wh.end_time,
        wh.is_available,

        b.name AS branch_name,

        s.display_name AS staff_name

      FROM working_hours wh

      LEFT JOIN branches b
        ON b.id = wh.branch_id

      LEFT JOIN staff s
        ON s.id = wh.staff_id

      WHERE wh.shop_id = ?
    `;

    const params = [numericShopId];

    if (branchId) {
      query += `
        AND wh.branch_id = ?
      `;

      params.push(Number(branchId));
    }

    if (staffId) {
      query += `
        AND wh.staff_id = ?
      `;

      params.push(Number(staffId));
    }

    query += `
      ORDER BY
        wh.day_of_week ASC,
        wh.start_time ASC
    `;

    const [rows] = await pool.query(
      query,
      params
    );

    return res.status(200).json({
      success: true,
      data: {
        workingHours: rows,
      },
    });
  } catch (error) {
    console.error(
      "Get working hours error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get working hours",
    });
  }
};


// =====================================================
// UPDATE WORKING HOUR
// =====================================================

const updateWorkingHour = async (req, res) => {
  try {
    const { id } = req.params;

    const workingHourId = Number(id);

    if (
      !workingHourId ||
      workingHourId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid working hour ID",
      });
    }

    /*
     * Database/API uses snake_case.
     *
     * Example:
     * start_time
     * end_time
     * is_available
     */
    const {
      branch_id,
      staff_id,
      day_of_week,
      start_time,
      end_time,
      is_available,
    } = req.body;

    // -------------------------------------------------
    // Get existing record
    // -------------------------------------------------

    const [existing] = await pool.query(
      `
      SELECT
        wh.*,
        bs.owner_id,
        bs.status AS shop_status
      FROM working_hours wh

      INNER JOIN barber_shops bs
        ON bs.id = wh.shop_id

      WHERE wh.id = ?

      LIMIT 1
      `,
      [workingHourId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Working hour not found",
      });
    }

    const record = existing[0];

    // -------------------------------------------------
    // Check access
    // -------------------------------------------------

    const access = await checkShopAccess(
      record.shop_id,
      req.user
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    // -------------------------------------------------
    // Final values
    // -------------------------------------------------

    const finalBranchId =
      branch_id !== undefined
        ? branch_id
        : record.branch_id;

    const finalStaffId =
      staff_id !== undefined
        ? staff_id
        : record.staff_id;

    const finalDayOfWeek =
      day_of_week !== undefined
        ? Number(day_of_week)
        : record.day_of_week;

    const finalStartTime =
      start_time !== undefined
        ? start_time
        : record.start_time;

    const finalEndTime =
      end_time !== undefined
        ? end_time
        : record.end_time;

    const finalIsAvailable =
      is_available !== undefined
        ? (is_available ? 1 : 0)
        : record.is_available;

    // -------------------------------------------------
    // Validate day
    // -------------------------------------------------

    if (
      !Number.isInteger(finalDayOfWeek) ||
      finalDayOfWeek < 0 ||
      finalDayOfWeek > 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "day_of_week must be between 0 and 6",
      });
    }

    // -------------------------------------------------
    // Validate time
    // -------------------------------------------------

    if (
      !finalStartTime ||
      !finalEndTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "start_time and end_time are required",
      });
    }

    if (
      finalStartTime >= finalEndTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "end_time must be after start_time",
      });
    }

    // -------------------------------------------------
    // Validate branch
    // -------------------------------------------------

    if (
      !(await validateBranch(
        finalBranchId,
        record.shop_id
      ))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Branch does not belong to this shop",
      });
    }

    // -------------------------------------------------
    // Validate staff
    // -------------------------------------------------

    if (
      !(await validateStaff(
        finalStaffId,
        record.shop_id
      ))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Staff member does not belong to this shop",
      });
    }

    // -------------------------------------------------
    // Prevent duplicate schedule
    // -------------------------------------------------

    const [duplicate] = await pool.query(
      `
      SELECT id
      FROM working_hours
      WHERE shop_id = ?

        AND (
          branch_id <=> ?
        )

        AND (
          staff_id <=> ?
        )

        AND day_of_week = ?

        AND id != ?

      LIMIT 1
      `,
      [
        record.shop_id,
        finalBranchId ?? null,
        finalStaffId ?? null,
        finalDayOfWeek,
        workingHourId,
      ]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Working hours already exist for this day",
      });
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE working_hours

      SET
        branch_id = ?,
        staff_id = ?,
        day_of_week = ?,
        start_time = ?,
        end_time = ?,
        is_available = ?

      WHERE id = ?
      `,
      [
        finalBranchId ?? null,
        finalStaffId ?? null,
        finalDayOfWeek,
        finalStartTime,
        finalEndTime,
        finalIsAvailable,
        workingHourId,
      ]
    );

    // -------------------------------------------------
    // Get updated record
    // -------------------------------------------------

    const [rows] = await pool.query(
      `
      SELECT *
      FROM working_hours
      WHERE id = ?
      LIMIT 1
      `,
      [workingHourId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Working hour updated successfully",
      data: {
        workingHour: rows[0],
      },
    });
  } catch (error) {
    console.error(
      "Update working hour error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update working hour",
    });
  }
};


// =====================================================
// DELETE WORKING HOUR
// =====================================================

const deleteWorkingHour = async (req, res) => {
  try {
    const { id } = req.params;

    const workingHourId = Number(id);

    if (
      !workingHourId ||
      workingHourId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid working hour ID",
      });
    }

    // -------------------------------------------------
    // Find record
    // -------------------------------------------------

    const [existing] = await pool.query(
      `
      SELECT
        wh.id,
        wh.shop_id,
        bs.owner_id
      FROM working_hours wh

      INNER JOIN barber_shops bs
        ON bs.id = wh.shop_id

      WHERE wh.id = ?

      LIMIT 1
      `,
      [workingHourId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Working hour not found",
      });
    }

    const record = existing[0];

    // -------------------------------------------------
    // Check access
    // -------------------------------------------------

    const access = await checkShopAccess(
      record.shop_id,
      req.user
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    // -------------------------------------------------
    // Delete
    // -------------------------------------------------

    await pool.query(
      `
      DELETE FROM working_hours
      WHERE id = ?
      `,
      [workingHourId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Working hour deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete working hour error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete working hour",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createWorkingHour,
  getWorkingHours,
  updateWorkingHour,
  deleteWorkingHour,
};