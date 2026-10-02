const { pool } = require("../config/db");

// GET ALL CONTENT
const getContents = async (req, res) => {
  try {
    const shopId = req.shopId;
    const { status } = req.query;

    let query = `
      SELECT
        cp.id,
        cp.shop_id,
        cp.title,
        cp.slug,
        cp.content,
        cp.status,
        cp.created_at,
        cp.updated_at,
        bs.name AS shop_name
      FROM content_pages cp
      LEFT JOIN barber_shops bs
        ON bs.id = cp.shop_id
      WHERE 1 = 1
    `;

    const params = [];

    // Super admin can optionally request global content
    if (req.user.role === "super_admin") {
      if (shopId) {
        query += " AND cp.shop_id = ?";
        params.push(shopId);
      }
    } else {
      query += " AND cp.shop_id = ?";
      params.push(shopId);
    }

    if (status) {
      query += " AND cp.status = ?";
      params.push(status);
    }

    query += " ORDER BY cp.created_at DESC";

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      data: {
        contents: rows,
      },
    });
  } catch (error) {
    console.error("Get contents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
};


// GET SINGLE CONTENT
const getContentById = async (req, res) => {
  try {
    const contentId = Number(req.params.id);

    if (!Number.isInteger(contentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content ID",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        cp.id,
        cp.shop_id,
        cp.title,
        cp.slug,
        cp.content,
        cp.status,
        cp.created_at,
        cp.updated_at,
        bs.name AS shop_name
      FROM content_pages cp
      LEFT JOIN barber_shops bs
        ON bs.id = cp.shop_id
      WHERE cp.id = ?
      LIMIT 1
      `,
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const content = rows[0];

    // Shop isolation
    if (
      req.user.role !== "super_admin" &&
      content.shop_id !== req.shopId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this content",
      });
    }

    return res.json({
      success: true,
      data: {
        content,
      },
    });
  } catch (error) {
    console.error("Get content by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
};


// CREATE CONTENT
const createContent = async (req, res) => {
  try {
    const {
      shopId,
      title,
      slug,
      content,
      status = "draft",
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and content are required",
      });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content status",
      });
    }

    let finalShopId = null;

    if (req.user.role === "super_admin") {
      if (shopId !== undefined && shopId !== null) {
        finalShopId = Number(shopId);

        if (!Number.isInteger(finalShopId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid shop ID",
          });
        }

        const [shops] = await pool.query(
          `
          SELECT id
          FROM barber_shops
          WHERE id = ?
          LIMIT 1
          `,
          [finalShopId]
        );

        if (shops.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Barber shop not found",
          });
        }
      }
    } else {
      finalShopId = req.shopId;
    }

    const [existing] = await pool.query(
      `
      SELECT id
      FROM content_pages
      WHERE
        shop_id <=> ?
        AND slug = ?
      LIMIT 1
      `,
      [finalShopId, slug.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Content with this slug already exists",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO content_pages
      (
        shop_id,
        title,
        slug,
        content,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        finalShopId,
        title.trim(),
        slug.trim(),
        content.trim(),
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: {
        contentId: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create content",
    });
  }
};


// UPDATE CONTENT
const updateContent = async (req, res) => {
  try {
    const contentId = Number(req.params.id);

    if (!Number.isInteger(contentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content ID",
      });
    }

    const {
      title,
      slug,
      content,
      status,
    } = req.body;

    const [rows] = await pool.query(
      `
      SELECT *
      FROM content_pages
      WHERE id = ?
      LIMIT 1
      `,
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const existingContent = rows[0];

    // Shop isolation
    if (
      req.user.role !== "super_admin" &&
      existingContent.shop_id !== req.shopId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this content",
      });
    }

    const finalTitle =
      title !== undefined
        ? title.trim()
        : existingContent.title;

    const finalSlug =
      slug !== undefined
        ? slug.trim()
        : existingContent.slug;

    const finalContent =
      content !== undefined
        ? content.trim()
        : existingContent.content;

    const finalStatus =
      status !== undefined
        ? status
        : existingContent.status;

    if (!finalTitle || !finalSlug || !finalContent) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and content cannot be empty",
      });
    }

    if (!["draft", "published"].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content status",
      });
    }

    const [duplicate] = await pool.query(
      `
      SELECT id
      FROM content_pages
      WHERE
        shop_id <=> ?
        AND slug = ?
        AND id != ?
      LIMIT 1
      `,
      [
        existingContent.shop_id,
        finalSlug,
        contentId,
      ]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Content with this slug already exists",
      });
    }

    await pool.query(
      `
      UPDATE content_pages
      SET
        title = ?,
        slug = ?,
        content = ?,
        status = ?
      WHERE id = ?
      `,
      [
        finalTitle,
        finalSlug,
        finalContent,
        finalStatus,
        contentId,
      ]
    );

    return res.json({
      success: true,
      message: "Content updated successfully",
    });
  } catch (error) {
    console.error("Update content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update content",
    });
  }
};


// UPDATE CONTENT STATUS
const updateContentStatus = async (req, res) => {
  try {
    const contentId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(contentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content ID",
      });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid content status. Allowed statuses: draft, published",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, shop_id
      FROM content_pages
      WHERE id = ?
      LIMIT 1
      `,
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    if (
      req.user.role !== "super_admin" &&
      rows[0].shop_id !== req.shopId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this content",
      });
    }

    await pool.query(
      `
      UPDATE content_pages
      SET status = ?
      WHERE id = ?
      `,
      [status, contentId]
    );

    return res.json({
      success: true,
      message: `Content ${status} successfully`,
    });
  } catch (error) {
    console.error("Update content status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update content status",
    });
  }
};


// DELETE CONTENT
const deleteContent = async (req, res) => {
  try {
    const contentId = Number(req.params.id);

    if (!Number.isInteger(contentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content ID",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, shop_id
      FROM content_pages
      WHERE id = ?
      LIMIT 1
      `,
      [contentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    if (
      req.user.role !== "super_admin" &&
      rows[0].shop_id !== req.shopId
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this content",
      });
    }

    await pool.query(
      `
      DELETE FROM content_pages
      WHERE id = ?
      `,
      [contentId]
    );

    return res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete content",
    });
  }
};


module.exports = {
  getContents,
  getContentById,
  createContent,
  updateContent,
  updateContentStatus,
  deleteContent,
};