const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

// =====================================================
// GET ALL STAFF
// =====================================================

const getAllStaff = async (req, res) => {
  try {
    let query = `
      SELECT
        s.id,
        s.user_id,
        s.shop_id,
        s.branch_id,
        s.display_name,
        s.bio,
        s.profile_image,
        s.status,
        s.created_at,
        s.updated_at,

        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.role AS user_role,
        u.status AS user_status,

        b.name AS branch_name

      FROM staff s

      INNER JOIN users u
        ON u.id = s.user_id

      LEFT JOIN branches b
        ON b.id = s.branch_id
    `;

    const params = [];

    // Super Admin can see all staff
    if (req.user.role === "super_admin") {
      if (req.query.shopId) {
        query += ` WHERE s.shop_id = ? `;
        params.push(Number(req.query.shopId));
      }
    } else {
      // Other staff-management users can only see their own shop
      query += ` WHERE s.shop_id = ? `;
      params.push(req.shopId);
    }

    query += ` ORDER BY s.created_at DESC `;

    const [staff] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: {
        staff,
      },
    });
  } catch (error) {
    console.error("Get all staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
    });
  }
};


// =====================================================
// GET STAFF BY ID
// =====================================================

const getStaffById = async (req, res) => {
  try {
    const staffId = Number(req.params.id);

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    let query = `
      SELECT
        s.id,
        s.user_id,
        s.shop_id,
        s.branch_id,
        s.display_name,
        s.bio,
        s.profile_image,
        s.status,
        s.created_at,
        s.updated_at,

        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.role AS user_role,
        u.status AS user_status,

        b.name AS branch_name

      FROM staff s

      INNER JOIN users u
        ON u.id = s.user_id

      LEFT JOIN branches b
        ON b.id = s.branch_id

      WHERE s.id = ?
    `;

    const params = [staffId];

    if (req.user.role !== "super_admin") {
      query += ` AND s.shop_id = ? `;
      params.push(req.shopId);
    }

    query += ` LIMIT 1 `;

    const [staffMembers] = await pool.query(query, params);

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const staff = staffMembers[0];

    // Get assigned services
    const [services] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.description,
        s.duration_minutes,
        s.price,
        s.status

      FROM staff_services ss

      INNER JOIN services s
        ON s.id = ss.service_id

      WHERE ss.staff_id = ?
      ORDER BY s.name ASC
      `,
      [staffId]
    );

    return res.status(200).json({
      success: true,
      data: {
        staff,
        services,
      },
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff member",
    });
  }
};


// =====================================================
// CREATE STAFF
// =====================================================

const createStaff = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      branch_id,
      display_name,
      bio,
      profile_image,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !role ||
      !display_name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, password, role and display name are required",
      });
    }

    // Allowed staff roles
    const allowedRoles = [
      "manager",
      "receptionist",
      "barber",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Allowed roles: manager, receptionist, barber",
      });
    }

    // Branch validation
    let branchId = branch_id ? Number(branch_id) : null;

    if (branchId) {
      const [branches] = await connection.query(
        `
        SELECT id
        FROM branches
        WHERE id = ?
          AND shop_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [
          branchId,
          req.user.role === "super_admin"
            ? Number(req.body.shop_id)
            : req.shopId,
        ]
      );

      if (branches.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid branch or branch does not belong to this shop",
        });
      }
    }

    // Determine shop
    const shopId =
      req.user.role === "super_admin"
        ? Number(req.body.shop_id)
        : req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required",
      });
    }

    // Verify shop exists and is active
    const [shops] = await connection.query(
      `
      SELECT id
      FROM barber_shops
      WHERE id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive barber shop",
      });
    }

    // Check existing email
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

    await connection.beginTransaction();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
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
      VALUES (?, ?, ?, ?, ?, 'active')
      `,
      [
        name,
        email,
        phone,
        passwordHash,
        role,
      ]
    );

    const userId = userResult.insertId;

    // Create staff profile
    const [staffResult] = await connection.query(
      `
      INSERT INTO staff
      (
        user_id,
        shop_id,
        branch_id,
        display_name,
        bio,
        profile_image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        userId,
        shopId,
        branchId,
        display_name,
        bio || null,
        profile_image || null,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: {
        staff: {
          id: staffResult.insertId,
          user_id: userId,
          shop_id: shopId,
          branch_id: branchId,
          display_name,
          bio: bio || null,
          profile_image: profile_image || null,
          status: "active",
        },
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create staff member",
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// UPDATE STAFF
// =====================================================

const updateStaff = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const staffId = Number(req.params.id);

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    // Find staff and enforce shop isolation
    let staffQuery = `
      SELECT
        id,
        user_id,
        shop_id,
        branch_id
      FROM staff
      WHERE id = ?
    `;

    const staffParams = [staffId];

    if (req.user.role !== "super_admin") {
      staffQuery += ` AND shop_id = ? `;
      staffParams.push(req.shopId);
    }

    staffQuery += ` LIMIT 1 `;

    const [staffMembers] = await connection.query(
      staffQuery,
      staffParams
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const staff = staffMembers[0];

    const {
      name,
      email,
      phone,
      role,
      branch_id,
      display_name,
      bio,
      profile_image,
    } = req.body;

    const allowedRoles = [
      "manager",
      "receptionist",
      "barber",
    ];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Allowed roles: manager, receptionist, barber",
      });
    }

    // Validate branch if supplied
    if (branch_id !== undefined && branch_id !== null) {
      const branchId = Number(branch_id);

      const [branches] = await connection.query(
        `
        SELECT id
        FROM branches
        WHERE id = ?
          AND shop_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [branchId, staff.shop_id]
      );

      if (branches.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid branch or branch does not belong to this shop",
        });
      }
    }

    // Check email conflict
    if (email) {
      const [existingUsers] = await connection.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
          AND id != ?
        LIMIT 1
        `,
        [email, staff.user_id]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    await connection.beginTransaction();

    // Update user fields
    if (
      name !== undefined ||
      email !== undefined ||
      phone !== undefined ||
      role !== undefined
    ) {
      await connection.query(
        `
        UPDATE users
        SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          role = COALESCE(?, role)
        WHERE id = ?
        `,
        [
          name ?? null,
          email ?? null,
          phone ?? null,
          role ?? null,
          staff.user_id,
        ]
      );
    }

    // Update staff fields
    await connection.query(
      `
      UPDATE staff
      SET
        branch_id = COALESCE(?, branch_id),
        display_name = COALESCE(?, display_name),
        bio = COALESCE(?, bio),
        profile_image = COALESCE(?, profile_image)
      WHERE id = ?
      `,
      [
        branch_id ?? null,
        display_name ?? null,
        bio ?? null,
        profile_image ?? null,
        staffId,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff member",
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// UPDATE STAFF STATUS
// =====================================================

const updateStaffStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const staffId = Number(req.params.id);
    const { status } = req.body;

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: active, inactive",
      });
    }

    let staffQuery = `
      SELECT
        id,
        user_id,
        shop_id,
        status
      FROM staff
      WHERE id = ?
    `;

    const staffParams = [staffId];

    if (req.user.role !== "super_admin") {
      staffQuery += ` AND shop_id = ? `;
      staffParams.push(req.shopId);
    }

    staffQuery += ` LIMIT 1 `;

    const [staffMembers] = await connection.query(
      staffQuery,
      staffParams
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const staff = staffMembers[0];

    await connection.beginTransaction();

    // Update staff profile status
    await connection.query(
      `
      UPDATE staff
      SET status = ?
      WHERE id = ?
      `,
      [status, staffId]
    );

    // Keep login account status synchronized
    await connection.query(
      `
      UPDATE users
      SET status = ?
      WHERE id = ?
      `,
      [status, staff.user_id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Staff status updated successfully",
      data: {
        previous_status: staff.status,
        status,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Update staff status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update staff status",
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  updateStaffStatus,
};