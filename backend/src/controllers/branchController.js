const { pool } = require("../config/db");


// =====================================================
// CREATE BRANCH
// =====================================================

const createBranch = async (req, res) => {
  try {
    const {
      shopId,
      name,
      phone,
      email,
      address,
      city,
      postalCode,
      canton,
      latitude,
      longitude,
    } = req.body;

    if (!shopId || !name) {
      return res.status(400).json({
        success: false,
        message: "Shop ID and branch name are required",
      });
    }

    // -------------------------------------------------
    // Check shop exists
    // -------------------------------------------------

    const [shops] = await pool.query(
      `
      SELECT id, owner_id, status
      FROM barber_shops
      WHERE id = ?
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

    // -------------------------------------------------
    // Owner / Manager can only access own shop
    // -------------------------------------------------

    if (
      req.user.role !== "super_admin" &&
      shop.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this shop",
      });
    }

    // -------------------------------------------------
    // Create branch
    // -------------------------------------------------

    const [result] = await pool.query(
      `
      INSERT INTO branches
      (
        shop_id,
        name,
        phone,
        email,
        address,
        city,
        postal_code,
        canton,
        latitude,
        longitude,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        shopId,
        name,
        phone || null,
        email || null,
        address || null,
        city || null,
        postalCode || null,
        canton || null,
        latitude || null,
        longitude || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: {
        branch: {
          id: result.insertId,
          shopId,
          name,
          phone: phone || null,
          email: email || null,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
          canton: canton || null,
          latitude: latitude || null,
          longitude: longitude || null,
          status: "active",
        },
      },
    });

  } catch (error) {
    console.error("Create branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create branch",
    });
  }
};


// =====================================================
// GET BRANCHES
// =====================================================

const getBranches = async (req, res) => {
  try {
    const { shopId } = req.query;

    let query = `
      SELECT
        b.id,
        b.shop_id,
        b.name,
        b.phone,
        b.email,
        b.address,
        b.city,
        b.postal_code,
        b.canton,
        b.latitude,
        b.longitude,
        b.status,
        b.created_at,
        b.updated_at
      FROM branches b
    `;

    const params = [];

    // -------------------------------------------------
    // Super Admin
    // -------------------------------------------------

    if (req.user.role === "super_admin") {
      if (shopId) {
        query += ` WHERE b.shop_id = ? `;
        params.push(shopId);
      }
    }

    // -------------------------------------------------
    // Owner / Manager
    // -------------------------------------------------

    else {
      query += `
        INNER JOIN barber_shops s
          ON b.shop_id = s.id
        WHERE s.owner_id = ?
      `;

      params.push(req.user.id);

      if (shopId) {
        query += ` AND b.shop_id = ? `;
        params.push(shopId);
      }
    }

    query += ` ORDER BY b.created_at DESC `;

    const [branches] = await pool.query(query, params);

    return res.json({
      success: true,
      count: branches.length,
      data: {
        branches,
      },
    });

  } catch (error) {
    console.error("Get branches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get branches",
    });
  }
};


// =====================================================
// GET SINGLE BRANCH
// =====================================================

const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const [branches] = await pool.query(
      `
      SELECT
        b.*,
        s.name AS shop_name,
        s.owner_id
      FROM branches b
      INNER JOIN barber_shops s
        ON b.shop_id = s.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const branch = branches[0];

    // -------------------------------------------------
    // Ownership check
    // -------------------------------------------------

    if (
      req.user.role !== "super_admin" &&
      branch.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this branch",
      });
    }

    return res.json({
      success: true,
      data: {
        branch,
      },
    });

  } catch (error) {
    console.error("Get branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get branch",
    });
  }
};


// =====================================================
// UPDATE BRANCH
// =====================================================

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      email,
      address,
      city,
      postalCode,
      canton,
      latitude,
      longitude,
    } = req.body;

    // -------------------------------------------------
    // Find branch + owner
    // -------------------------------------------------

    const [branches] = await pool.query(
      `
      SELECT
        b.id,
        b.shop_id,
        s.owner_id
      FROM branches b
      INNER JOIN barber_shops s
        ON b.shop_id = s.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const branch = branches[0];

    // -------------------------------------------------
    // Ownership check
    // -------------------------------------------------

    if (
      req.user.role !== "super_admin" &&
      branch.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this branch",
      });
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE branches
      SET
        name = ?,
        phone = ?,
        email = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        canton = ?,
        latitude = ?,
        longitude = ?
      WHERE id = ?
      `,
      [
        name,
        phone || null,
        email || null,
        address || null,
        city || null,
        postalCode || null,
        canton || null,
        latitude || null,
        longitude || null,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Branch updated successfully",
    });

  } catch (error) {
    console.error("Update branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update branch",
    });
  }
};


// =====================================================
// UPDATE BRANCH STATUS
// =====================================================

const updateBranchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const [branches] = await pool.query(
      `
      SELECT
        b.id,
        s.owner_id
      FROM branches b
      INNER JOIN barber_shops s
        ON b.shop_id = s.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const branch = branches[0];

    if (
      req.user.role !== "super_admin" &&
      branch.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this branch",
      });
    }

    await pool.query(
      `
      UPDATE branches
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return res.json({
      success: true,
      message: `Branch ${status} successfully`,
    });

  } catch (error) {
    console.error("Update branch status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update branch status",
    });
  }
};


// =====================================================
// DELETE BRANCH
// =====================================================

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const [branches] = await pool.query(
      `
      SELECT
        b.id,
        s.owner_id
      FROM branches b
      INNER JOIN barber_shops s
        ON b.shop_id = s.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const branch = branches[0];

    if (
      req.user.role !== "super_admin" &&
      branch.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this branch",
      });
    }

    await pool.query(
      `
      DELETE FROM branches
      WHERE id = ?
      `,
      [id]
    );

    return res.json({
      success: true,
      message: "Branch deleted successfully",
    });

  } catch (error) {
    console.error("Delete branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete branch",
    });
  }
};


module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
};