const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const getDateFilter = (from, to, column, params) => {
  let condition = "";

  if (from) {
    condition += ` AND ${column} >= ?`;
    params.push(from);
  }

  if (to) {
    condition += ` AND ${column} <= ?`;
    params.push(to);
  }

  return condition;
};

const validateDateRange = (from, to) => {
  if (from && !isValidDate(from)) {
    return {
      valid: false,
      message:
        "Invalid 'from' date. Use YYYY-MM-DD",
    };
  }

  if (to && !isValidDate(to)) {
    return {
      valid: false,
      message:
        "Invalid 'to' date. Use YYYY-MM-DD",
    };
  }

  if (from && to && from > to) {
    return {
      valid: false,
      message:
        "'from' date cannot be later than 'to' date",
    };
  }

  return {
    valid: true,
  };
};

/*
|--------------------------------------------------------------------------
| GET APPOINTMENT REPORT
|--------------------------------------------------------------------------
*/

const getAppointmentReport = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    const { from, to } = req.query;

    const dateValidation =
      validateDateRange(from, to);

    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }

    const params = [shopId];

    const dateCondition = getDateFilter(
      from,
      to,
      "a.appointment_date",
      params
    );

    const [rows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN a.status = 'pending'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS pending_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN a.status = 'confirmed'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS confirmed_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN a.status = 'completed'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS completed_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN a.status = 'cancelled'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS cancelled_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN a.status = 'no_show'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS no_show_appointments

      FROM appointments a

      WHERE a.shop_id = ?

      ${dateCondition}
      `,
      params
    );

    const report = rows[0] || {};

    return res.json({
      success: true,

      data: {
        filters: {
          from: from || null,
          to: to || null,
        },

        report: {
          total_appointments:
            Number(
              report.total_appointments || 0
            ),

          pending_appointments:
            Number(
              report.pending_appointments || 0
            ),

          confirmed_appointments:
            Number(
              report.confirmed_appointments || 0
            ),

          completed_appointments:
            Number(
              report.completed_appointments || 0
            ),

          cancelled_appointments:
            Number(
              report.cancelled_appointments || 0
            ),

          no_show_appointments:
            Number(
              report.no_show_appointments || 0
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get appointment report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate appointment report",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET REVENUE REPORT
|--------------------------------------------------------------------------
*/

const getRevenueReport = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    const { from, to } = req.query;

    const dateValidation =
      validateDateRange(from, to);

    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }

    const params = [shopId];

    const dateCondition = getDateFilter(
      from,
      to,
      "DATE(p.created_at)",
      params
    );

    const [rows] = await pool.query(
      `
      SELECT

        COALESCE(
          SUM(
            CASE
              WHEN p.status = 'paid'
              THEN p.amount
              ELSE 0
            END
          ),
          0
        ) AS total_revenue,

        COALESCE(
          SUM(
            CASE
              WHEN p.status = 'pending'
              THEN p.amount
              ELSE 0
            END
          ),
          0
        ) AS pending_amount,

        COALESCE(
          SUM(
            CASE
              WHEN p.status = 'refunded'
              THEN p.amount
              ELSE 0
            END
          ),
          0
        ) AS refunded_amount,

        COUNT(
          CASE
            WHEN p.status = 'paid'
            THEN 1
          END
        ) AS paid_payments,

        COUNT(
          CASE
            WHEN p.status = 'pending'
            THEN 1
          END
        ) AS pending_payments,

        COUNT(
          CASE
            WHEN p.status = 'refunded'
            THEN 1
          END
        ) AS refunded_payments

      FROM payments p

      INNER JOIN appointments a
        ON a.id = p.appointment_id

      WHERE a.shop_id = ?

      ${dateCondition}
      `,
      params
    );

    const report = rows[0] || {};

    return res.json({
      success: true,

      data: {
        filters: {
          from: from || null,
          to: to || null,
        },

        report: {
          total_revenue:
            Number(
              report.total_revenue || 0
            ).toFixed(2),

          pending_amount:
            Number(
              report.pending_amount || 0
            ).toFixed(2),

          refunded_amount:
            Number(
              report.refunded_amount || 0
            ).toFixed(2),

          paid_payments:
            Number(
              report.paid_payments || 0
            ),

          pending_payments:
            Number(
              report.pending_payments || 0
            ),

          refunded_payments:
            Number(
              report.refunded_payments || 0
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get revenue report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate revenue report",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SERVICE PERFORMANCE REPORT
|--------------------------------------------------------------------------
*/

const getServicePerformanceReport =
  async (req, res) => {
    try {
      const shopId = req.shopId;

      if (!shopId) {
        return res.status(400).json({
          success: false,
          message:
            "Shop context is required",
        });
      }

      const { from, to } = req.query;

      const dateValidation =
        validateDateRange(from, to);

      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            dateValidation.message,
        });
      }

      const params = [shopId];

      const dateCondition =
        getDateFilter(
          from,
          to,
          "a.appointment_date",
          params
        );

      const [rows] =
        await pool.query(
          `
          SELECT

            s.id AS service_id,

            s.name AS service_name,

            s.duration_minutes,

            s.price,

            COUNT(
              CASE
                WHEN a.status != 'cancelled'
                THEN aps.id
              END
            ) AS booking_count,

            COUNT(
              CASE
                WHEN a.status = 'completed'
                THEN aps.id
              END
            ) AS completed_count

          FROM appointment_services aps

          INNER JOIN appointments a
            ON a.id = aps.appointment_id

          INNER JOIN services s
            ON s.id = aps.service_id

          WHERE a.shop_id = ?

          ${dateCondition}

          GROUP BY
            s.id,
            s.name,
            s.duration_minutes,
            s.price

          ORDER BY
            booking_count DESC,
            s.name ASC
          `,
          params
        );

      const services =
        rows.map((service) => ({
          service_id:
            Number(service.service_id),

          service_name:
            service.service_name,

          duration_minutes:
            Number(
              service.duration_minutes || 0
            ),

          price:
            Number(
              service.price || 0
            ).toFixed(2),

          booking_count:
            Number(
              service.booking_count || 0
            ),

          completed_count:
            Number(
              service.completed_count || 0
            ),
        }));

      return res.json({
        success: true,

        data: {
          filters: {
            from: from || null,
            to: to || null,
          },

          count: services.length,

          services,
        },
      });
    } catch (error) {
      console.error(
        "Get service performance report error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate service performance report",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| GET STAFF PERFORMANCE REPORT
|--------------------------------------------------------------------------
*/

const getStaffPerformanceReport =
  async (req, res) => {
    try {
      const shopId = req.shopId;

      if (!shopId) {
        return res.status(400).json({
          success: false,
          message:
            "Shop context is required",
        });
      }

      const { from, to } = req.query;

      const dateValidation =
        validateDateRange(from, to);

      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            dateValidation.message,
        });
      }

      const params = [shopId];

      const dateCondition =
        getDateFilter(
          from,
          to,
          "a.appointment_date",
          params
        );

      const [rows] =
        await pool.query(
          `
          SELECT

            s.id AS staff_id,

            s.display_name AS staff_name,

            COUNT(a.id) AS total_appointments,

            COALESCE(
              SUM(
                CASE
                  WHEN a.status = 'completed'
                  THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS completed_appointments,

            COALESCE(
              SUM(
                CASE
                  WHEN a.status = 'cancelled'
                  THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS cancelled_appointments,

            COALESCE(
              SUM(
                CASE
                  WHEN a.status = 'no_show'
                  THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS no_show_appointments

          FROM appointments a

          INNER JOIN staff s
            ON s.id = a.staff_id

          WHERE a.shop_id = ?

          ${dateCondition}

          GROUP BY
            s.id,
            s.display_name

          ORDER BY
            total_appointments DESC,
            s.display_name ASC
          `,
          params
        );

      const staff =
        rows.map((member) => ({
          staff_id:
            Number(member.staff_id),

          staff_name:
            member.staff_name,

          total_appointments:
            Number(
              member.total_appointments || 0
            ),

          completed_appointments:
            Number(
              member.completed_appointments || 0
            ),

          cancelled_appointments:
            Number(
              member.cancelled_appointments || 0
            ),

          no_show_appointments:
            Number(
              member.no_show_appointments || 0
            ),
        }));

      return res.json({
        success: true,

        data: {
          filters: {
            from: from || null,
            to: to || null,
          },

          count: staff.length,

          staff,
        },
      });
    } catch (error) {
      console.error(
        "Get staff performance report error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate staff performance report",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  getAppointmentReport,
  getRevenueReport,
  getServicePerformanceReport,
  getStaffPerformanceReport,
};