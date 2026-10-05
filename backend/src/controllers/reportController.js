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
 | GET SUPER ADMIN SUMMARY REPORT
 |--------------------------------------------------------------------------
 */

const getSummaryReport = async (req, res) => {
  try {
    const { range = "30d" } = req.query;

    const allowedRanges = ["7d", "30d", "90d"];

    if (!allowedRanges.includes(range)) {
      return res.status(400).json({
        success: false,
        message: "Invalid range. Use 7d, 30d or 90d",
      });
    }

    const days = Number(range.replace("d", ""));

    // -------------------------------------------------
    // Date range
    // -------------------------------------------------

    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    fromDate.setDate(fromDate.getDate() - (days - 1));

    const from =
      fromDate.toISOString().slice(0, 10);

    // -------------------------------------------------
    // TOTAL APPOINTMENTS
    // -------------------------------------------------

    const [appointmentTotals] =
      await pool.query(
        `
        SELECT
          COUNT(*) AS appointments
        FROM appointments a
        WHERE a.appointment_date >= ?
          AND a.appointment_date <= CURDATE()
        `,
        [from]
      );

    // -------------------------------------------------
    // SHOP REVENUE
    // Completed bookings only
    // -------------------------------------------------

    const [revenueTotals] =
      await pool.query(
        `
        SELECT
          COALESCE(SUM(p.amount), 0) AS revenue
        FROM payments p
        INNER JOIN appointments a
          ON a.id = p.appointment_id
        WHERE a.status = 'completed'
          AND p.status = 'paid'
          AND DATE(p.created_at) >= ?
          AND DATE(p.created_at) <= CURDATE()
        `,
        [from]
      );

    // -------------------------------------------------
    // SUBSCRIPTION REVENUE
    // -------------------------------------------------

    const [subscriptionTotals] =
      await pool.query(
        `
        SELECT
          COALESCE(SUM(sp.amount), 0) AS subscription_revenue
        FROM subscription_payments sp
        WHERE sp.status = 'paid'
          AND DATE(
            COALESCE(sp.paid_at, sp.created_at)
          ) >= ?
          AND DATE(
            COALESCE(sp.paid_at, sp.created_at)
          ) <= CURDATE()
        `,
        [from]
      );

    // -------------------------------------------------
    // NEW SHOPS
    // -------------------------------------------------

    const [shopTotals] =
      await pool.query(
        `
        SELECT
          COUNT(*) AS new_shops
        FROM barber_shops
        WHERE DATE(created_at) >= ?
          AND DATE(created_at) <= CURDATE()
        `,
        [from]
      );

    // -------------------------------------------------
    // DAILY SERIES
    // -------------------------------------------------

    const [seriesRows] =
      await pool.query(
        `
        SELECT
          dates.report_date AS date,

          COALESCE(
            COUNT(
              CASE
                WHEN a.status = 'completed'
                THEN a.id
              END
            ),
            0
          ) AS appointments,

          COALESCE(
            SUM(
              CASE
                WHEN a.status = 'completed'
                 AND p.status = 'paid'
                THEN p.amount
                ELSE 0
              END
            ),
            0
          ) AS revenue

        FROM (
          SELECT
            DATE_SUB(
              CURDATE(),
              INTERVAL seq.day DAY
            ) AS report_date
          FROM (
            SELECT 0 AS day
            UNION ALL SELECT 1
            UNION ALL SELECT 2
            UNION ALL SELECT 3
            UNION ALL SELECT 4
            UNION ALL SELECT 5
            UNION ALL SELECT 6
            UNION ALL SELECT 7
            UNION ALL SELECT 8
            UNION ALL SELECT 9
            UNION ALL SELECT 10
            UNION ALL SELECT 11
            UNION ALL SELECT 12
            UNION ALL SELECT 13
            UNION ALL SELECT 14
            UNION ALL SELECT 15
            UNION ALL SELECT 16
            UNION ALL SELECT 17
            UNION ALL SELECT 18
            UNION ALL SELECT 19
            UNION ALL SELECT 20
            UNION ALL SELECT 21
            UNION ALL SELECT 22
            UNION ALL SELECT 23
            UNION ALL SELECT 24
            UNION ALL SELECT 25
            UNION ALL SELECT 26
            UNION ALL SELECT 27
            UNION ALL SELECT 28
            UNION ALL SELECT 29
            UNION ALL SELECT 30
            UNION ALL SELECT 31
            UNION ALL SELECT 32
            UNION ALL SELECT 33
            UNION ALL SELECT 34
            UNION ALL SELECT 35
            UNION ALL SELECT 36
            UNION ALL SELECT 37
            UNION ALL SELECT 38
            UNION ALL SELECT 39
            UNION ALL SELECT 40
            UNION ALL SELECT 41
            UNION ALL SELECT 42
            UNION ALL SELECT 43
            UNION ALL SELECT 44
            UNION ALL SELECT 45
            UNION ALL SELECT 46
            UNION ALL SELECT 47
            UNION ALL SELECT 48
            UNION ALL SELECT 49
            UNION ALL SELECT 50
            UNION ALL SELECT 51
            UNION ALL SELECT 52
            UNION ALL SELECT 53
            UNION ALL SELECT 54
            UNION ALL SELECT 55
            UNION ALL SELECT 56
            UNION ALL SELECT 57
            UNION ALL SELECT 58
            UNION ALL SELECT 59
            UNION ALL SELECT 60
            UNION ALL SELECT 61
            UNION ALL SELECT 62
            UNION ALL SELECT 63
            UNION ALL SELECT 64
            UNION ALL SELECT 65
            UNION ALL SELECT 66
            UNION ALL SELECT 67
            UNION ALL SELECT 68
            UNION ALL SELECT 69
            UNION ALL SELECT 70
            UNION ALL SELECT 71
            UNION ALL SELECT 72
            UNION ALL SELECT 73
            UNION ALL SELECT 74
            UNION ALL SELECT 75
            UNION ALL SELECT 76
            UNION ALL SELECT 77
            UNION ALL SELECT 78
            UNION ALL SELECT 79
            UNION ALL SELECT 80
            UNION ALL SELECT 81
            UNION ALL SELECT 82
            UNION ALL SELECT 83
            UNION ALL SELECT 84
            UNION ALL SELECT 85
            UNION ALL SELECT 86
            UNION ALL SELECT 87
            UNION ALL SELECT 88
            UNION ALL SELECT 89
          ) seq
          WHERE seq.day < ?
        ) dates

        LEFT JOIN appointments a
          ON a.appointment_date = dates.report_date

        LEFT JOIN payments p
          ON p.appointment_id = a.id

        GROUP BY dates.report_date
        ORDER BY dates.report_date ASC
        `,
        [days]
      );

    // -------------------------------------------------
    // TOP SHOPS
    // -------------------------------------------------

    const [topShopRows] =
      await pool.query(
        `
        SELECT
          bs.id,
          bs.name,

          COUNT(
            CASE
              WHEN a.status = 'completed'
              THEN a.id
            END
          ) AS appointments,

          COALESCE(
            SUM(
              CASE
                WHEN a.status = 'completed'
                 AND p.status = 'paid'
                THEN p.amount
                ELSE 0
              END
            ),
            0
          ) AS revenue

        FROM barber_shops bs

        LEFT JOIN appointments a
          ON a.shop_id = bs.id
          AND a.appointment_date >= ?
          AND a.appointment_date <= CURDATE()

        LEFT JOIN payments p
          ON p.appointment_id = a.id

        GROUP BY
          bs.id,
          bs.name

        HAVING
          appointments > 0
          OR revenue > 0

        ORDER BY
          revenue DESC,
          appointments DESC,
          bs.name ASC

        LIMIT 10
        `,
        [from]
      );

    // -------------------------------------------------
    // FORMAT RESPONSE
    // -------------------------------------------------

    const totals = {
      appointments: Number(
        appointmentTotals[0]?.appointments || 0
      ),

      revenue: Number(
        revenueTotals[0]?.revenue || 0
      ),

      subscription_revenue: Number(
        subscriptionTotals[0]?.subscription_revenue || 0
      ),

      new_shops: Number(
        shopTotals[0]?.new_shops || 0
      ),
    };

    const series = seriesRows.map((row) => ({
      date: row.date,
      appointments: Number(row.appointments || 0),
      revenue: Number(row.revenue || 0),
    }));

    const top_shops = topShopRows.map((shop) => ({
      id: Number(shop.id),
      name: shop.name,
      appointments: Number(shop.appointments || 0),
      revenue: Number(shop.revenue || 0),
    }));

    return res.json({
      success: true,

      data: {
        range,

        from,

        to: new Date()
          .toISOString()
          .slice(0, 10),

        totals,

        series,

        top_shops,
      },
    });
  } catch (error) {
    console.error(
      "Get summary report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate summary report",
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
  getSummaryReport,
};