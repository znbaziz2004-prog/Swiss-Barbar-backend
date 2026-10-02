const { pool } = require("../config/db");


// =====================================================
// CREATE SERVICE
// =====================================================

const createService = async (req, res) => {
  try {
    const {
      shopId,
      name,
      description,
      durationMinutes,
      price,
      currency,
    } = req.body;

    if (
      !shopId ||
      !name ||
      !durationMinutes ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Shop ID, service name, duration and price are required",
      });
    }

    if (Number(durationMinutes) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // -------------------------------------------------
    // Check shop
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
    // Owner can only create service for own shop
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
    // Check duplicate service name
    // -------------------------------------------------

    const [existingServices] = await pool.query(
      `
      SELECT id
      FROM services
      WHERE shop_id = ?
      AND name = ?
      LIMIT 1
      `,
      [shopId, name]
    );

    if (existingServices.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A service with this name already exists",
      });
    }

    // -------------------------------------------------
    // Create service
    // -------------------------------------------------

    const [result] = await pool.query(
      `
      INSERT INTO services
      (
        shop_id,
        name,
        description,
        duration_minutes,
        price,
        currency,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        shopId,
        name,
        description || null,
        Number(durationMinutes),
        Number(price),
        currency || "CHF",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: {
        service: {
          id: result.insertId,
          shopId,
          name,
          description: description || null,
          durationMinutes: Number(durationMinutes),
          price: Number(price),
          currency: currency || "CHF",
          status: "active",
        },
      },
    });

  } catch (error) {
    console.error("Create service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};


// =====================================================
// GET SERVICES
// =====================================================

const getServices = async (req, res) => {
  try {
    const { shopId, status } = req.query;

    let query = `
      SELECT
        s.id,
        s.shop_id,
        s.name,
        s.description,
        s.duration_minutes,
        s.price,
        s.currency,
        s.status,
        s.created_at,
        s.updated_at
      FROM services s
    `;

    const params = [];

    // -------------------------------------------------
    // Super Admin
    // -------------------------------------------------

    if (req.user.role === "super_admin") {
      const conditions = [];

      if (shopId) {
        conditions.push("s.shop_id = ?");
        params.push(shopId);
      }

      if (status) {
        conditions.push("s.status = ?");
        params.push(status);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")} `;
      }
    }

    // -------------------------------------------------
    // Owner
    // -------------------------------------------------

    else {
      query += `
        INNER JOIN barber_shops shop
          ON s.shop_id = shop.id
        WHERE shop.owner_id = ?
      `;

      params.push(req.user.id);

      if (shopId) {
        query += ` AND s.shop_id = ? `;
        params.push(shopId);
      }

      if (status) {
        query += ` AND s.status = ? `;
        params.push(status);
      }
    }

    query += ` ORDER BY s.created_at DESC `;

    const [services] = await pool.query(query, params);

    return res.json({
      success: true,
      count: services.length,
      data: {
        services,
      },
    });

  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get services",
    });
  }
};


// =====================================================
// GET SINGLE SERVICE
// =====================================================

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query(
      `
      SELECT
        s.*,
        shop.name AS shop_name,
        shop.owner_id
      FROM services s
      INNER JOIN barber_shops shop
        ON s.shop_id = shop.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    if (
      req.user.role !== "super_admin" &&
      service.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this service",
      });
    }

    return res.json({
      success: true,
      data: {
        service,
      },
    });

  } catch (error) {
    console.error("Get service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get service",
    });
  }
};


// =====================================================
// UPDATE SERVICE
// =====================================================

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      durationMinutes,
      price,
      currency,
    } = req.body;

    // -------------------------------------------------
    // Find service + shop owner
    // -------------------------------------------------

    const [services] = await pool.query(
      `
      SELECT
        s.id,
        s.shop_id,
        shop.owner_id
      FROM services s
      INNER JOIN barber_shops shop
        ON s.shop_id = shop.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    // -------------------------------------------------
    // Ownership
    // -------------------------------------------------

    if (
      req.user.role !== "super_admin" &&
      service.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this service",
      });
    }

    if (!name || !durationMinutes || price === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Service name, duration and price are required",
      });
    }

    if (Number(durationMinutes) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE services
      SET
        name = ?,
        description = ?,
        duration_minutes = ?,
        price = ?,
        currency = ?
      WHERE id = ?
      `,
      [
        name,
        description || null,
        Number(durationMinutes),
        Number(price),
        currency || "CHF",
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Service updated successfully",
    });

  } catch (error) {
    console.error("Update service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};


// =====================================================
// UPDATE SERVICE STATUS
// =====================================================

const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const [services] = await pool.query(
      `
      SELECT
        s.id,
        shop.owner_id
      FROM services s
      INNER JOIN barber_shops shop
        ON s.shop_id = shop.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    if (
      req.user.role !== "super_admin" &&
      service.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this service",
      });
    }

    await pool.query(
      `
      UPDATE services
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return res.json({
      success: true,
      message: `Service ${status} successfully`,
    });

  } catch (error) {
    console.error("Update service status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update service status",
    });
  }
};


// =====================================================
// DELETE SERVICE
// =====================================================

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query(
      `
      SELECT
        s.id,
        shop.owner_id
      FROM services s
      INNER JOIN barber_shops shop
        ON s.shop_id = shop.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    if (
      req.user.role !== "super_admin" &&
      service.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this service",
      });
    }

    // -------------------------------------------------
    // Check if service has been used in appointments
    // -------------------------------------------------

    const [usedServices] = await pool.query(
      `
      SELECT id
      FROM appointment_services
      WHERE service_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (usedServices.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This service is already used in appointments. Deactivate it instead of deleting it.",
      });
    }

    await pool.query(
      `
      DELETE FROM services
      WHERE id = ?
      `,
      [id]
    );

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });

  } catch (error) {
    console.error("Delete service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};


module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
};