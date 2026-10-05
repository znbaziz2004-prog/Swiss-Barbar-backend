const { pool } = require("../config/db");

/*
 * Safe query helpers (a missing table/column will not crash the dashboard)
 */
const safeRows = async (label, sql, fallback = []) => {
  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    console.error(
      `[dashboard] "${label}" failed:`,
      err.sqlMessage || err.message
    );
    return fallback;
  }
};

const safeCount = async (label, sql) => {
  const rows = await safeRows(label, sql, [{ total: 0 }]);
  return Number(rows[0]?.total || 0);
};

/*
 * Format DATE safely
 */
const formatDateOnly = (dateValue) => {
  if (!dateValue) return null;

  // If MySQL returns a string
  if (typeof dateValue === "string") {
    return dateValue.substring(0, 10);
  }

  // If MySQL returns a Date object
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const role = req.user?.role;

    /* =========================================================
     * SUPER ADMIN
     * ======================================================= */
    if (role === "super_admin") {
      const [
        totalShops,
        activeShops,
        pendingRegistrations,
        activeSubscriptions,
        featuredShops,
        totalOwners,
        todayAppointments,
        todayRevenue,
        recentRegistrations,
        recentAppointments,
      ] = await Promise.all([
        safeCount(
          "total shops",
          `SELECT COUNT(*) AS total FROM barber_shops`
        ),

        safeCount(
          "active shops",
          `SELECT COUNT(*) AS total FROM barber_shops WHERE status = 'active'`
        ),

        safeCount(
          "pending registrations",
          `SELECT COUNT(*) AS total FROM barber_registrations WHERE registration_status = 'pending'`
        ),

        safeCount(
          "active subscriptions",
          `SELECT COUNT(*) AS total FROM shop_subscriptions WHERE status = 'active'`
        ),

        safeCount(
          "featured shops",
          `SELECT COUNT(*) AS total FROM barber_shops WHERE is_featured = 1`
        ),

        safeCount(
          "owners",
          `SELECT COUNT(*) AS total FROM users WHERE role = 'owner'`
        ),

        safeCount(
          "today appointments",
          `SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = CURDATE()`
        ),

        safeCount(
          "today revenue",
          `
          SELECT COALESCE(
            SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END),
            0
          ) AS total
          FROM appointments
          WHERE appointment_date = CURDATE()
          `
        ),

        safeRows(
          "recent registrations",
          `
          SELECT
            br.id,
            br.registration_status AS status,
            br.created_at,
            COALESCE(br.business_name, bs.name) AS shop_name,
            u.email AS owner_email
          FROM barber_registrations br
          LEFT JOIN barber_shops bs ON bs.id = br.shop_id
          LEFT JOIN users u ON u.id = br.user_id
          ORDER BY br.created_at DESC
          LIMIT 5
          `
        ),

        safeRows(
          "recent appointments",
          `
          SELECT
            a.id,
            a.appointment_date,
            a.start_time,
            a.status,
            a.total_amount,
            a.currency,
            c.name AS customer_name,
            bs.name AS shop_name
          FROM appointments a
          LEFT JOIN customers c ON c.id = a.customer_id
          LEFT JOIN barber_shops bs ON bs.id = a.shop_id
          ORDER BY a.appointment_date DESC, a.start_time DESC
          LIMIT 5
          `
        ),
      ]);

      return res.json({
        success: true,
        data: {
          platform: {
            total_shops: totalShops,
            active_shops: activeShops,
            pending_registrations: pendingRegistrations,
            active_subscriptions: activeSubscriptions,
            featured_shops: featuredShops,
            total_owners: totalOwners,
            today_appointments: todayAppointments,
            today_revenue: todayRevenue,
          },

          recent: {
            registrations: recentRegistrations,
            appointments: recentAppointments.map((appointment) => ({
              ...appointment,
              appointment_date: formatDateOnly(appointment.appointment_date),
            })),
          },
        },
      });
    }

    /* =========================================================
     * SHOP (OWNER / STAFF)
     * ======================================================= */
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

        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_appointments,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_appointments,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_appointments,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_show_appointments,

        COALESCE(
          SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END),
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

        AND status IN ('pending', 'confirmed')
      `,
      [shopId]
    );

    /*
     * Total customers
     */
    const [customerStats] = await pool.query(
      `
      SELECT
        COUNT(DISTINCT customer_id) AS total_customers

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
    const [upcomingAppointments] = await pool.query(
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

        AND a.status IN ('pending', 'confirmed')

      ORDER BY
        a.appointment_date ASC,
        a.start_time ASC

      LIMIT 10
      `,
      [shopId]
    );

    const formattedUpcomingAppointments = upcomingAppointments.map(
      (appointment) => ({
        ...appointment,
        appointment_date: formatDateOnly(appointment.appointment_date),
      })
    );

    /*
     * Recent appointment activity
     */
    const [recentAppointments] = await pool.query(
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

    const formattedRecentAppointments = recentAppointments.map(
      (appointment) => ({
        ...appointment,
        appointment_date: formatDateOnly(appointment.appointment_date),
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
        today: {
          total_appointments: Number(today.total_appointments || 0),
          pending_appointments: Number(today.pending_appointments || 0),
          confirmed_appointments: Number(today.confirmed_appointments || 0),
          completed_appointments: Number(today.completed_appointments || 0),
          cancelled_appointments: Number(today.cancelled_appointments || 0),
          no_show_appointments: Number(today.no_show_appointments || 0),
          revenue: Number(today.today_revenue || 0),
        },

        upcoming: {
          appointments: Number(upcoming.upcoming_appointments || 0),
          list: formattedUpcomingAppointments,
        },

        customers: {
          total: Number(customers.total_customers || 0),
        },

        staff: {
          total: Number(staff.total_staff || 0),
        },

        recent: {
          appointments: formattedRecentAppointments,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

/*
 * Export controller
 */
module.exports = {
  getDashboardStats,
};