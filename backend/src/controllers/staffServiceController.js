const { pool } = require("../config/db");

// =====================================================
// GET STAFF SERVICES
// =====================================================

const getStaffServices = async (req, res) => {
  try {
    const staffId = Number(req.params.staffId);

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    // Verify staff belongs to accessible shop
    let staffQuery = `
      SELECT id, shop_id
      FROM staff
      WHERE id = ?
    `;

    const staffParams = [staffId];

    if (req.user.role !== "super_admin") {
      staffQuery += ` AND shop_id = ? `;
      staffParams.push(req.shopId);
    }

    staffQuery += ` LIMIT 1 `;

    const [staffMembers] = await pool.query(
      staffQuery,
      staffParams
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

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
        staff_id: staffId,
        services,
      },
    });
  } catch (error) {
    console.error(
      "Get staff services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff services",
    });
  }
};


// =====================================================
// ASSIGN SERVICE TO STAFF
// =====================================================

const assignService = async (req, res) => {
  try {
    const staffId = Number(req.params.staffId);
    const serviceId = Number(req.body.service_id);

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    if (!serviceId || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid service_id is required",
      });
    }

    // Verify staff belongs to accessible shop
    let staffQuery = `
      SELECT id, shop_id
      FROM staff
      WHERE id = ?
    `;

    const staffParams = [staffId];

    if (req.user.role !== "super_admin") {
      staffQuery += ` AND shop_id = ? `;
      staffParams.push(req.shopId);
    }

    staffQuery += ` LIMIT 1 `;

    const [staffMembers] = await pool.query(
      staffQuery,
      staffParams
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const shopId = staffMembers[0].shop_id;

    // Verify service belongs to same shop
    const [services] = await pool.query(
      `
      SELECT
        id,
        name,
        status
      FROM services
      WHERE id = ?
        AND shop_id = ?
      LIMIT 1
      `,
      [serviceId, shopId]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found or does not belong to this shop",
      });
    }

    if (services[0].status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive service",
      });
    }

    // Check duplicate assignment
    const [existingAssignment] = await pool.query(
      `
      SELECT staff_id, service_id
      FROM staff_services
      WHERE staff_id = ?
        AND service_id = ?
      LIMIT 1
      `,
      [staffId, serviceId]
    );

    if (existingAssignment.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Service is already assigned to this staff member",
      });
    }

    await pool.query(
      `
      INSERT INTO staff_services
      (staff_id, service_id)
      VALUES (?, ?)
      `,
      [staffId, serviceId]
    );

    return res.status(201).json({
      success: true,
      message: "Service assigned to staff successfully",
      data: {
        staff_id: staffId,
        service_id: serviceId,
      },
    });
  } catch (error) {
    console.error(
      "Assign staff service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to assign service",
    });
  }
};


// =====================================================
// REMOVE SERVICE FROM STAFF
// =====================================================

const removeService = async (req, res) => {
  try {
    const staffId = Number(req.params.staffId);
    const serviceId = Number(req.params.serviceId);

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    if (!serviceId || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // Verify staff belongs to accessible shop
    let staffQuery = `
      SELECT id
      FROM staff
      WHERE id = ?
    `;

    const staffParams = [staffId];

    if (req.user.role !== "super_admin") {
      staffQuery += ` AND shop_id = ? `;
      staffParams.push(req.shopId);
    }

    staffQuery += ` LIMIT 1 `;

    const [staffMembers] = await pool.query(
      staffQuery,
      staffParams
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const [result] = await pool.query(
      `
      DELETE FROM staff_services
      WHERE staff_id = ?
        AND service_id = ?
      `,
      [staffId, serviceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Service assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Service removed from staff successfully",
    });
  } catch (error) {
    console.error(
      "Remove staff service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove service",
    });
  }
};


// =====================================================
// REPLACE ALL STAFF SERVICES
// =====================================================

const replaceStaffServices = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const staffId = Number(req.params.staffId);
    const { service_ids } = req.body;

    if (!staffId || staffId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    if (!Array.isArray(service_ids)) {
      return res.status(400).json({
        success: false,
        message: "service_ids must be an array",
      });
    }

    const serviceIds = [
      ...new Set(
        service_ids
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];

    // Verify staff belongs to accessible shop
    let staffQuery = `
      SELECT id, shop_id
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

    const shopId = staffMembers[0].shop_id;

    // Verify all services belong to same shop
    if (serviceIds.length > 0) {
      const placeholders = serviceIds
        .map(() => "?")
        .join(", ");

      const [services] = await connection.query(
        `
        SELECT id
        FROM services
        WHERE shop_id = ?
          AND status = 'active'
          AND id IN (${placeholders})
        `,
        [shopId, ...serviceIds]
      );

      if (services.length !== serviceIds.length) {
        return res.status(400).json({
          success: false,
          message:
            "One or more services are invalid, inactive, or belong to another shop",
        });
      }
    }

    await connection.beginTransaction();

    // Remove existing assignments
    await connection.query(
      `
      DELETE FROM staff_services
      WHERE staff_id = ?
      `,
      [staffId]
    );

    // Add new assignments
    if (serviceIds.length > 0) {
      const values = serviceIds
        .map(() => "(?, ?)")
        .join(", ");

      const params = [];

      serviceIds.forEach((serviceId) => {
        params.push(staffId, serviceId);
      });

      await connection.query(
        `
        INSERT INTO staff_services
        (staff_id, service_id)
        VALUES ${values}
        `,
        params
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Staff services updated successfully",
      data: {
        staff_id: staffId,
        service_ids: serviceIds,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Replace staff services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update staff services",
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getStaffServices,
  assignService,
  removeService,
  replaceStaffServices,
};