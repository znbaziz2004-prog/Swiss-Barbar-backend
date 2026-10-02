const { pool } = require("../config/db");

/*
 * Get customers
 *
 * Filters:
 * ?search=Ali
 *
 * Shop is taken from req.shopId
 * by shopAccessMiddleware.
 */
const getCustomers = async (req, res) => {
  try {
    const search = req.query.search;
    const shopId = req.shopId;

    let query = `
      SELECT
        c.id,
        c.name,
        c.phone,
        c.email,
        c.created_at,
        c.updated_at,

        COUNT(a.id) AS total_appointments,

        MAX(a.appointment_date) AS last_appointment_date

      FROM customers c

      LEFT JOIN appointments a
        ON a.customer_id = c.id
    `;

    const params = [];
    const conditions = [];

    /*
     * Only appointments belonging to this shop
     */
    if (shopId) {
      query += `
        AND a.shop_id = ?
      `;

      params.push(shopId);

      /*
       * Only customers who actually belong to this shop
       *
       * A customer belongs to the shop if they have
       * at least one appointment with that shop.
       */
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM appointments customer_shop_appointments
          WHERE customer_shop_appointments.customer_id = c.id
            AND customer_shop_appointments.shop_id = ?
        )
      `);

      params.push(shopId);
    }

    /*
     * Search
     */
    if (search) {
      conditions.push(`
        (
          c.name LIKE ?
          OR c.phone LIKE ?
          OR c.email LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    /*
     * WHERE
     */
    if (conditions.length > 0) {
      query += `
        WHERE ${conditions.join(" AND ")}
      `;
    }

    query += `
      GROUP BY
        c.id,
        c.name,
        c.phone,
        c.email,
        c.created_at,
        c.updated_at

      ORDER BY c.created_at DESC
    `;

    const [customers] = await pool.query(
      query,
      params
    );

    /*
     * Format dates
     */
    const formattedCustomers = customers.map(
      (customer) => ({
        ...customer,

        last_appointment_date:
          formatDateOnly(
            customer.last_appointment_date
          ),
      })
    );

    return res.json({
      success: true,
      data: {
        count: formattedCustomers.length,
        customers: formattedCustomers,
      },
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};


/*
 * Get customer by ID
 *
 * Includes appointment history.
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shopId;

    /*
     * Customer must belong to this shop
     */
    let customerQuery = `
      SELECT
        c.id,
        c.name,
        c.phone,
        c.email,
        c.created_at,
        c.updated_at

      FROM customers c

      WHERE c.id = ?
    `;

    const customerParams = [id];

    if (shopId) {
      customerQuery += `
        AND EXISTS (
          SELECT 1
          FROM appointments a
          WHERE a.customer_id = c.id
            AND a.shop_id = ?
        )
      `;

      customerParams.push(shopId);
    }

    customerQuery += `
      LIMIT 1
    `;

    const [customers] = await pool.query(
      customerQuery,
      customerParams
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    /*
     * Appointment history
     */
    let appointmentQuery = `
      SELECT
        a.id,
        a.shop_id,
        a.branch_id,
        a.staff_id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status,
        a.total_amount,
        a.currency,

        b.name AS branch_name,

        st.display_name AS staff_name

      FROM appointments a

      LEFT JOIN branches b
        ON b.id = a.branch_id

      LEFT JOIN staff st
        ON st.id = a.staff_id

      WHERE a.customer_id = ?
    `;

    const appointmentParams = [id];

    if (shopId) {
      appointmentQuery += `
        AND a.shop_id = ?
      `;

      appointmentParams.push(shopId);
    }

    appointmentQuery += `
      ORDER BY
        a.appointment_date DESC,
        a.start_time DESC
    `;

    const [appointments] = await pool.query(
      appointmentQuery,
      appointmentParams
    );

    /*
     * Format appointment dates safely
     */
    const formattedAppointments =
      appointments.map(
        (appointment) => ({
          ...appointment,

          appointment_date:
            formatDateOnly(
              appointment.appointment_date
            ),
        })
      );

    return res.json({
      success: true,
      data: {
        customer,
        appointments: formattedAppointments,
      },
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};


/*
 * Update customer
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shopId;

    const {
      name,
      phone,
      email,
    } = req.body;

    if (
      name === undefined &&
      phone === undefined &&
      email === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required",
      });
    }

    /*
     * Check customer belongs to this shop
     */
    let customerCheckQuery = `
      SELECT c.id
      FROM customers c
      WHERE c.id = ?
    `;

    const customerCheckParams = [id];

    if (shopId) {
      customerCheckQuery += `
        AND EXISTS (
          SELECT 1
          FROM appointments a
          WHERE a.customer_id = c.id
            AND a.shop_id = ?
        )
      `;

      customerCheckParams.push(shopId);
    }

    customerCheckQuery += `
      LIMIT 1
    `;

    const [existingCustomers] =
      await pool.query(
        customerCheckQuery,
        customerCheckParams
      );

    if (existingCustomers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    /*
     * Dynamic update
     */
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }

    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone);
    }

    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }

    values.push(id);

    await pool.query(
      `
      UPDATE customers
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values
    );

    /*
     * Get updated customer
     */
    const [customers] =
      await pool.query(
        `
        SELECT
          id,
          name,
          phone,
          email,
          created_at,
          updated_at
        FROM customers
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return res.json({
      success: true,
      message:
        "Customer updated successfully",

      data: customers[0],
    });
  } catch (error) {
    console.error(
      "Update customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};


/*
 * Helper
 *
 * Prevents DATE/DATETIME values from shifting
 * because of timezone conversion.
 */
const formatDateOnly = (dateValue) => {
  if (!dateValue) return null;

  if (typeof dateValue === "string") {
    return dateValue.substring(0, 10);
  }

  const year = dateValue.getFullYear();

  const month = String(
    dateValue.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    dateValue.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
};