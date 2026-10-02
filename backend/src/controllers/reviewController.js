const { pool } = require("../config/db");

/*
 * Create Review
 * Customer can review only a completed appointment
 */
const createReview = async (req, res) => {
  try {
    const {
      shopId,
      branchId,
      customerId,
      appointmentId,
      rating,
      comment,
    } = req.body;

    // Basic validation
    if (!shopId || !customerId || !appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "shopId, customerId, appointmentId and rating are required",
      });
    }

    // Rating must be between 1 and 5
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    /*
     * Verify appointment
     */
    const [appointments] = await pool.query(
      `
      SELECT
        id,
        shop_id,
        branch_id,
        customer_id,
        status
      FROM appointments
      WHERE id = ?
        AND shop_id = ?
        AND customer_id = ?
      LIMIT 1
      `,
      [appointmentId, shopId, customerId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = appointments[0];

    /*
     * Review allowed only after completed appointment
     */
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Review can only be submitted for a completed appointment",
      });
    }

    /*
     * Prevent duplicate review for same appointment
     */
    const [existingReviews] = await pool.query(
      `
      SELECT id
      FROM reviews
      WHERE appointment_id = ?
      LIMIT 1
      `,
      [appointmentId]
    );

    if (existingReviews.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A review already exists for this appointment",
      });
    }

    /*
     * Create review
     */
    const [result] = await pool.query(
      `
      INSERT INTO reviews
      (
        shop_id,
        branch_id,
        customer_id,
        appointment_id,
        rating,
        comment,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        appointment.shop_id,
        branchId || appointment.branch_id,
        customerId,
        appointmentId,
        rating,
        comment || null,
      ]
    );

    /*
     * Fetch created review
     */
    const [reviews] = await pool.query(
      `
      SELECT
        r.id,
        r.shop_id,
        r.branch_id,
        r.customer_id,
        r.appointment_id,
        r.rating,
        r.comment,
        r.status,
        r.created_at
      FROM reviews r
      WHERE r.id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: {
        review: reviews[0],
      },
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};


/*
 * Get Reviews
 */
const getReviews = async (req, res) => {
  try {
    const shopId = req.shopId || req.query.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const { status, rating } = req.query;

    let query = `
      SELECT
        r.id,
        r.shop_id,
        r.branch_id,
        r.customer_id,
        r.appointment_id,
        r.rating,
        r.comment,
        r.status,
        r.created_at,

        c.name AS customer_name,
        c.email AS customer_email,

        bs.name AS shop_name,

        b.name AS branch_name

      FROM reviews r

      LEFT JOIN customers c
        ON c.id = r.customer_id

      LEFT JOIN barber_shops bs
        ON bs.id = r.shop_id

      LEFT JOIN branches b
        ON b.id = r.branch_id

      WHERE r.shop_id = ?
    `;

    const params = [shopId];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (rating) {
      query += ` AND r.rating = ?`;
      params.push(Number(rating));
    }

    query += ` ORDER BY r.created_at DESC`;

    const [reviews] = await pool.query(query, params);

    return res.json({
      success: true,
      data: {
        count: reviews.length,
        reviews,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};


/*
 * Get Single Review
 */
const getReviewById = async (req, res) => {
  try {
    const shopId = req.shopId || req.query.shopId;
    const reviewId = Number(req.params.id);

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const [reviews] = await pool.query(
      `
      SELECT
        r.id,
        r.shop_id,
        r.branch_id,
        r.customer_id,
        r.appointment_id,
        r.rating,
        r.comment,
        r.status,
        r.created_at,

        c.name AS customer_name,
        c.email AS customer_email,

        bs.name AS shop_name,

        b.name AS branch_name

      FROM reviews r

      LEFT JOIN customers c
        ON c.id = r.customer_id

      LEFT JOIN barber_shops bs
        ON bs.id = r.shop_id

      LEFT JOIN branches b
        ON b.id = r.branch_id

      WHERE r.id = ?
        AND r.shop_id = ?
      LIMIT 1
      `,
      [reviewId, shopId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.json({
      success: true,
      data: {
        review: reviews[0],
      },
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
    });
  }
};


/*
 * Update Review Status
 * pending → approved / rejected
 */
const updateReviewStatus = async (req, res) => {
  try {
    const shopId = req.shopId || req.body.shopId;
    const reviewId = Number(req.params.id);
    const { status } = req.body;

    if (!shopId || !status) {
      return res.status(400).json({
        success: false,
        message: "shopId and status are required",
      });
    }

    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    const [reviews] = await pool.query(
      `
      SELECT id, status
      FROM reviews
      WHERE id = ?
        AND shop_id = ?
      LIMIT 1
      `,
      [reviewId, shopId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await pool.query(
      `
      UPDATE reviews
      SET status = ?
      WHERE id = ?
        AND shop_id = ?
      `,
      [status, reviewId, shopId]
    );

    return res.json({
      success: true,
      message: `Review status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
};


/*
 * Get Shop Rating Summary
 */
const getReviewSummary = async (req, res) => {
  try {
    const shopId = req.shopId || req.query.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const [summary] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 2) AS average_rating,

        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star

      FROM reviews
      WHERE shop_id = ?
        AND status = 'approved'
      `,
      [shopId]
    );

    return res.json({
      success: true,
      data: {
        summary: summary[0],
      },
    });
  } catch (error) {
    console.error("Get review summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review summary",
    });
  }
};


module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReviewStatus,
  getReviewSummary,
};