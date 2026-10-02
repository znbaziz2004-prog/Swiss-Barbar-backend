const { pool } = require("../config/db");

/*
 * Get barber dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID could not be determined",
      });
    }

    /*
     * Today's statistics
     */
    const [todayStats] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_appointments,

        SUM(
          CASE
            WHEN status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending_appointments,

        SUM(
          CASE
            WHEN status = 'confirmed'
            THEN 1
            ELSE 0
          END
        ) AS confirmed_appointments,

        SUM(
          CASE
            WHEN status = 'completed'
            THEN 1
            ELSE 0
          END
        ) AS completed_appointments,

        SUM(
          CASE
            WHEN status = 'cancelled'
            THEN 1
            ELSE 0
          END
        ) AS cancelled_appointments,

        SUM(
          CASE
            WHEN status = 'no_show'
            THEN 1
            ELSE 0
          END
        ) AS no_show_appointments,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'completed'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS today_revenue

      FROM appointments

      WHERE shop_id = ?
        AND appointment_date = CURDATE()
      `,
      [shopId]
    );

    /*
     * Upcoming appointment count
     */
    const [upcomingStats] = await pool.query(
      `
      SELECT
        COUNT(*) AS upcoming_appointments

      FROM appointments

      WHERE shop_id = ?

        AND (
          appointment_date > CURDATE()

          OR (
            appointment_date = CURDATE()
            AND start_time >= CURTIME()
          )
        )

        AND status IN (
          'pending',
          'confirmed'
        )
      `,
      [shopId]
    );

    /*
     * Total customers
     */
    const [customerStats] = await pool.query(
      `
      SELECT
        COUNT(DISTINCT customer_id)
        AS total_customers

      FROM appointments

      WHERE shop_id = ?
      `,
      [shopId]
    );

    /*
     * Total active staff
     */
    const [staffStats] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_staff

      FROM staff

      WHERE shop_id = ?
        AND status = 'active'
      `,
      [shopId]
    );

    /*
     * Upcoming appointments list
     */
    const [upcomingAppointments] =
      await pool.query(
        `
        SELECT
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.total_amount,
          a.currency,

          c.id AS customer_id,
          c.name AS customer_name,
          c.phone AS customer_phone,
          c.email AS customer_email,

          st.id AS staff_id,
          st.display_name AS staff_name,

          b.id AS branch_id,
          b.name AS branch_name

        FROM appointments a

        LEFT JOIN customers c
          ON c.id = a.customer_id

        LEFT JOIN staff st
          ON st.id = a.staff_id

        LEFT JOIN branches b
          ON b.id = a.branch_id

        WHERE a.shop_id = ?

          AND (
            a.appointment_date > CURDATE()

            OR (
              a.appointment_date = CURDATE()
              AND a.start_time >= CURTIME()
            )
          )

          AND a.status IN (
            'pending',
            'confirmed'
          )

        ORDER BY
          a.appointment_date ASC,
          a.start_time ASC

        LIMIT 10
        `,
        [shopId]
      );

    /*
     * Format upcoming appointment dates
     */
    const formattedUpcomingAppointments =
      upcomingAppointments.map(
        (appointment) => ({
          ...appointment,

          appointment_date:
            formatDateOnly(
              appointment.appointment_date
            ),
        })
      );

    /*
     * Recent appointment activity
     */
    const [recentAppointments] =
      await pool.query(
        `
        SELECT
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.total_amount,
          a.currency,

          c.id AS customer_id,
          c.name AS customer_name,

          st.id AS staff_id,
          st.display_name AS staff_name,

          b.id AS branch_id,
          b.name AS branch_name

        FROM appointments a

        LEFT JOIN customers c
          ON c.id = a.customer_id

        LEFT JOIN staff st
          ON st.id = a.staff_id

        LEFT JOIN branches b
          ON b.id = a.branch_id

        WHERE a.shop_id = ?

        ORDER BY
          a.appointment_date DESC,
          a.start_time DESC

        LIMIT 10
        `,
        [shopId]
      );

    /*
     * Format recent appointment dates
     */
    const formattedRecentAppointments =
      recentAppointments.map(
        (appointment) => ({
          ...appointment,

          appointment_date:
            formatDateOnly(
              appointment.appointment_date
            ),
        })
      );

    /*
     * Extract statistics
     */
    const today = todayStats[0];
    const upcoming = upcomingStats[0];
    const customers = customerStats[0];
    const staff = staffStats[0];

    /*
     * Send dashboard response
     */
    return res.json({
      success: true,

      data: {
        /*
         * Today's statistics
         */
        today: {
          total_appointments:
            Number(
              today.total_appointments || 0
            ),

          pending_appointments:
            Number(
              today.pending_appointments || 0
            ),

          confirmed_appointments:
            Number(
              today.confirmed_appointments || 0
            ),

          completed_appointments:
            Number(
              today.completed_appointments || 0
            ),

          cancelled_appointments:
            Number(
              today.cancelled_appointments || 0
            ),

          no_show_appointments:
            Number(
              today.no_show_appointments || 0
            ),

          revenue:
            Number(
              today.today_revenue || 0
            ),
        },

        /*
         * Upcoming appointments
         */
        upcoming: {
          appointments:
            Number(
              upcoming.upcoming_appointments || 0
            ),

          list:
            formattedUpcomingAppointments,
        },

        /*
         * Customers
         */
        customers: {
          total:
            Number(
              customers.total_customers || 0
            ),
        },

        /*
         * Active staff
         */
        staff: {
          total:
            Number(
              staff.total_staff || 0
            ),
        },

        /*
         * Recent appointment activity
         */
        recent: {
          appointments:
            formattedRecentAppointments,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard statistics",
    });
  }
};


/*
 * Format DATE safely
 */
const formatDateOnly = (dateValue) => {
  if (!dateValue) return null;

  /*
   * If MySQL returns a string
   */
  if (typeof dateValue === "string") {
    return dateValue.substring(0, 10);
  }

  /*
   * If MySQL returns a Date object
   */
  const year = dateValue.getFullYear();

  const month = String(
    dateValue.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    dateValue.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


/*
 * Export controller
 */
module.exports = {
  getDashboardStats,
};