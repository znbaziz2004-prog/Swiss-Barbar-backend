const { pool } = require("../config/db");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const timeToMinutes = (timeValue) => {
  const timeString = String(timeValue).substring(0, 8);

  const [hours, minutes] = timeString.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:00`;
};

const formatDateOnly = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === "string") {
    return dateValue.substring(0, 10);
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const overlaps = (
  startMinute,
  endMinute,
  existingStart,
  existingEnd
) => {
  return (
    startMinute < existingEnd &&
    endMinute > existingStart
  );
};

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
|--------------------------------------------------------------------------
| CREATE APPOINTMENT
|--------------------------------------------------------------------------
*/

const createAppointment = async (req, res) => {
  let connection;

  try {
    const {
      branchId,
      staffId,
      serviceId,
      appointmentDate,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      customerNote,
    } = req.body;

    // IMPORTANT:
    // Shop ID comes from authenticated shop access middleware.
    // It must NOT come from the client request body.
    const shopId = req.shopId;

    if (
      !shopId ||
      !branchId ||
      !staffId ||
      !serviceId ||
      !appointmentDate ||
      !startTime ||
      !customerName ||
      !customerPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "shopId, branchId, staffId, serviceId, appointmentDate, startTime, customerName and customerPhone are required",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    /*
     * 1. Validate shop
     */

    const [shops] = await connection.query(
      `
      SELECT
        id,
        name,
        status,
        currency
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const shop = shops[0];

    if (shop.status !== "active") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Shop is not active",
      });
    }

    /*
     * 2. Validate branch
     */

    const [branches] = await connection.query(
      `
      SELECT
        id,
        name,
        status
      FROM branches
      WHERE id = ?
      AND shop_id = ?
      LIMIT 1
      `,
      [branchId, shopId]
    );

    if (branches.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (branches[0].status !== "active") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Branch is not active",
      });
    }

    /*
     * 3. Validate staff
     */

    const [staffRows] = await connection.query(
      `
      SELECT
        id,
        display_name,
        status
      FROM staff
      WHERE id = ?
      AND shop_id = ?
      AND branch_id = ?
      LIMIT 1
      `,
      [staffId, shopId, branchId]
    );

    if (staffRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Staff member not found for this branch",
      });
    }

    const staff = staffRows[0];

    if (staff.status !== "active") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Staff member is not active",
      });
    }

    /*
     * 4. Validate service
     */

    const [services] = await connection.query(
      `
      SELECT
        id,
        name,
        duration_minutes,
        price,
        currency,
        status
      FROM services
      WHERE id = ?
      AND shop_id = ?
      LIMIT 1
      `,
      [serviceId, shopId]
    );

    if (services.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    if (service.status !== "active") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Service is inactive",
      });
    }

    /*
     * 5. Check staff-service assignment
     */

    const [staffServices] = await connection.query(
      `
      SELECT 1
      FROM staff_services
      WHERE staff_id = ?
      AND service_id = ?
      LIMIT 1
      `,
      [staffId, serviceId]
    );

    if (staffServices.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This service is not assigned to this staff member",
      });
    }

    /*
     * 6. Validate appointment date
     */

    const dateMatch =
      /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate);

    if (!dateMatch) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "appointmentDate must be YYYY-MM-DD",
      });
    }

    /*
     * Prevent booking in the past
     */

    const todayDate = getTodayDate();

    if (appointmentDate < todayDate) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    /*
     * 7. Validate start time
     */

    const timeMatch =
      /^\d{2}:\d{2}(:\d{2})?$/.test(startTime);

    if (!timeMatch) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "startTime must be HH:mm or HH:mm:ss",
      });
    }

    const normalizedStartTime =
      startTime.length === 5
        ? `${startTime}:00`
        : startTime;

    const startMinute =
      timeToMinutes(normalizedStartTime);

    const duration =
      Number(service.duration_minutes);

    const endMinute =
      startMinute + duration;

    if (
      startMinute < 0 ||
      startMinute >= 24 * 60 ||
      endMinute > 24 * 60
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid appointment time",
      });
    }

    const endTime =
      minutesToTime(endMinute);

    /*
     * 8. Check working hours
     */

    const [dayRows] = await connection.query(
      `
      SELECT DAYOFWEEK(?) - 1 AS day_of_week
      `,
      [appointmentDate]
    );

    const dayOfWeek =
      Number(dayRows[0].day_of_week);

    const [workingHours] =
      await connection.query(
        `
        SELECT
          start_time,
          end_time
        FROM working_hours
        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?
        AND day_of_week = ?
        AND is_available = 1
        ORDER BY start_time ASC
        `,
        [
          shopId,
          branchId,
          staffId,
          dayOfWeek,
        ]
      );

    const fitsWorkingHours =
      workingHours.some((workingHour) => {
        const workStart =
          timeToMinutes(
            workingHour.start_time
          );

        const workEnd =
          timeToMinutes(
            workingHour.end_time
          );

        return (
          startMinute >= workStart &&
          endMinute <= workEnd
        );
      });

    if (!fitsWorkingHours) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Selected time is outside staff working hours",
      });
    }

    /*
     * 9. Check blocked times
     */

    const [blockedTimes] =
      await connection.query(
        `
        SELECT
          DATE_FORMAT(
            start_datetime,
            '%Y-%m-%d %H:%i:%s'
          ) AS start_datetime_local,

          DATE_FORMAT(
            end_datetime,
            '%Y-%m-%d %H:%i:%s'
          ) AS end_datetime_local

        FROM blocked_times

        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?

        AND DATE(start_datetime) <= ?
        AND DATE(end_datetime) >= ?

        ORDER BY start_datetime ASC
        `,
        [
          shopId,
          branchId,
          staffId,
          appointmentDate,
          appointmentDate,
        ]
      );

    const blockedConflict =
      blockedTimes.some((blocked) => {
        const startDate =
          String(
            blocked.start_datetime_local
          ).substring(0, 10);

        const endDate =
          String(
            blocked.end_datetime_local
          ).substring(0, 10);

        let blockedStart =
          timeToMinutes(
            String(
              blocked.start_datetime_local
            ).substring(11, 19)
          );

        let blockedEnd =
          timeToMinutes(
            String(
              blocked.end_datetime_local
            ).substring(11, 19)
          );

        if (startDate < appointmentDate) {
          blockedStart = 0;
        }

        if (endDate > appointmentDate) {
          blockedEnd = 24 * 60;
        }

        return overlaps(
          startMinute,
          endMinute,
          blockedStart,
          blockedEnd
        );
      });

    if (blockedConflict) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Selected time is blocked or unavailable",
      });
    }

    /*
     * 10. Re-check existing appointments
     *
     * Only pending and confirmed appointments
     * block a time slot.
     */

    const [existingAppointments] =
      await connection.query(
        `
        SELECT
          id,
          start_time,
          end_time,
          status
        FROM appointments

        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?
        AND appointment_date = ?

        AND status IN (
          'pending',
          'confirmed'
        )

        ORDER BY start_time ASC

        FOR UPDATE
        `,
        [
          shopId,
          branchId,
          staffId,
          appointmentDate,
        ]
      );

    const appointmentConflict =
      existingAppointments.some(
        (appointment) => {
          const existingStart =
            timeToMinutes(
              appointment.start_time
            );

          const existingEnd =
            timeToMinutes(
              appointment.end_time
            );

          return overlaps(
            startMinute,
            endMinute,
            existingStart,
            existingEnd
          );
        }
      );

    if (appointmentConflict) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This time slot has already been booked",
      });
    }

    /*
     * 11. Find or create customer
     */

    let customerId;

    const [existingCustomers] =
      await connection.query(
        `
        SELECT id
        FROM customers
        WHERE shop_id = ?
        AND phone = ?
        LIMIT 1
        `,
        [shopId, customerPhone]
      );

    if (existingCustomers.length > 0) {
      customerId =
        existingCustomers[0].id;

      await connection.query(
        `
        UPDATE customers
        SET
          name = ?,
          email = ?
        WHERE id = ?
        `,
        [
          customerName,
          customerEmail || null,
          customerId,
        ]
      );
    } else {
      const [customerResult] =
        await connection.query(
          `
          INSERT INTO customers
          (
            shop_id,
            name,
            phone,
            email
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            shopId,
            customerName,
            customerPhone,
            customerEmail || null,
          ]
        );

      customerId =
        customerResult.insertId;
    }

    /*
     * 12. Create appointment
     */

    const [appointmentResult] =
      await connection.query(
        `
        INSERT INTO appointments
        (
          shop_id,
          branch_id,
          customer_id,
          staff_id,
          appointment_date,
          start_time,
          end_time,
          status,
          total_amount,
          currency,
          customer_note
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'pending',
          ?,
          ?,
          ?
        )
        `,
        [
          shopId,
          branchId,
          customerId,
          staffId,
          appointmentDate,
          normalizedStartTime,
          endTime,
          service.price,
          service.currency,
          customerNote || null,
        ]
      );

    const appointmentId =
      appointmentResult.insertId;

    /*
     * 13. Create appointment service snapshot
     */

    await connection.query(
      `
      INSERT INTO appointment_services
      (
        appointment_id,
        service_id,
        service_name,
        duration_minutes,
        price
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        appointmentId,
        service.id,
        service.name,
        service.duration_minutes,
        service.price,
      ]
    );

    /*
     * 14. Create booking notification
     */

    let notificationId = null;

    if (customerEmail) {
      const notificationSubject =
        "Your appointment has been booked";

      const notificationMessage =
        `Hello ${customerName}, your appointment at ${shop.name} has been booked for ${appointmentDate} at ${normalizedStartTime}. Service: ${service.name}. Duration: ${service.duration_minutes} minutes. Price: ${service.currency} ${service.price}.`;

      const [notificationResult] =
        await connection.query(
          `
          INSERT INTO notifications
          (
            user_id,
            appointment_id,
            type,
            channel,
            recipient,
            subject,
            message,
            status
          )
          VALUES
          (
            NULL,
            ?,
            'booking_confirmation',
            'email',
            ?,
            ?,
            ?,
            'pending'
          )
          `,
          [
            appointmentId,
            customerEmail,
            notificationSubject,
            notificationMessage,
          ]
        );

      notificationId =
        notificationResult.insertId;
    }

    /*
     * 15. Commit
     */

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Appointment created successfully",

      data: {
        appointment: {
          id: appointmentId,
          date: appointmentDate,
          startTime: normalizedStartTime,
          endTime,
          status: "pending",
          totalAmount: service.price,
          currency: service.currency,
        },

        customer: {
          id: customerId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
        },

        shop: {
          id: shop.id,
          name: shop.name,
        },

        branch: {
          id: branchId,
          name: branches[0].name,
        },

        staff: {
          id: staff.id,
          name: staff.display_name,
        },

        service: {
          id: service.id,
          name: service.name,
          durationMinutes:
            service.duration_minutes,
          price: service.price,
          currency: service.currency,
        },

        notification: notificationId
          ? {
              id: notificationId,
              type: "booking_confirmation",
              channel: "email",
              status: "pending",
              recipient: customerEmail,
            }
          : null,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }
    }

    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create appointment",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL APPOINTMENTS
|--------------------------------------------------------------------------
*/

const getAppointments = async (req, res) => {
  try {
    const {
      branchId,
      staffId,
      date,
      status,
    } = req.query;

    // Shop comes from authenticated access middleware.
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    let query = `
      SELECT
        a.id,
        a.shop_id,
        a.branch_id,
        a.customer_id,
        a.staff_id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status,
        a.total_amount,
        a.currency,
        a.customer_note,
        a.internal_note,
        a.created_at,
        a.updated_at,

        b.name AS branch_name,

        st.display_name AS staff_name,

        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email

      FROM appointments a

      INNER JOIN branches b
        ON b.id = a.branch_id

      INNER JOIN staff st
        ON st.id = a.staff_id

      INNER JOIN customers c
        ON c.id = a.customer_id

      WHERE a.shop_id = ?
    `;

    const params = [shopId];

    if (branchId) {
      query += ` AND a.branch_id = ?`;
      params.push(branchId);
    }

    if (staffId) {
      query += ` AND a.staff_id = ?`;
      params.push(staffId);
    }

    if (date) {
      query += ` AND a.appointment_date = ?`;
      params.push(date);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += `
      ORDER BY
        a.appointment_date ASC,
        a.start_time ASC
    `;

    const [appointments] =
      await pool.query(
        query,
        params
      );

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
        count:
          formattedAppointments.length,
        appointments:
          formattedAppointments,
      },
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get appointments",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET APPOINTMENT BY ID
|--------------------------------------------------------------------------
*/

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Shop comes from authenticated access middleware.
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    const [appointments] =
      await pool.query(
        `
        SELECT
          a.id,
          a.shop_id,
          a.branch_id,
          a.customer_id,
          a.staff_id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.total_amount,
          a.currency,
          a.customer_note,
          a.internal_note,
          a.created_at,
          a.updated_at,

          b.name AS branch_name,

          st.display_name AS staff_name,

          c.name AS customer_name,
          c.phone AS customer_phone,
          c.email AS customer_email

        FROM appointments a

        INNER JOIN branches b
          ON b.id = a.branch_id

        INNER JOIN staff st
          ON st.id = a.staff_id

        INNER JOIN customers c
          ON c.id = a.customer_id

        WHERE a.id = ?
        AND a.shop_id = ?

        LIMIT 1
        `,
        [id, shopId]
      );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    const appointment = {
      ...appointments[0],
      appointment_date:
        formatDateOnly(
          appointments[0]
            .appointment_date
        ),
    };

    const [services] =
      await pool.query(
        `
        SELECT
          id,
          service_id,
          service_name,
          duration_minutes,
          price
        FROM appointment_services
        WHERE appointment_id = ?
        ORDER BY id ASC
        `,
        [id]
      );

    return res.json({
      success: true,
      data: {
        appointment,
        services,
      },
    });
  } catch (error) {
    console.error(
      "Get appointment by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get appointment",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE APPOINTMENT STATUS
|--------------------------------------------------------------------------
*/

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId =
      Number(req.params.id);

    const { status } = req.body;

    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message:
          "Shop ID could not be determined",
      });
    }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "no_show",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed statuses: pending, confirmed, cancelled, completed, no_show",
      });
    }

    const [appointments] =
      await pool.query(
        `
        SELECT
          a.id,
          a.shop_id,
          a.status,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.total_amount,
          a.currency,

          c.name AS customer_name,
          c.email AS customer_email,

          s.name AS service_name,

          bs.name AS shop_name

        FROM appointments a

        LEFT JOIN customers c
          ON c.id = a.customer_id

        LEFT JOIN appointment_services aps
          ON aps.appointment_id = a.id

        LEFT JOIN services s
          ON s.id = aps.service_id

        LEFT JOIN barber_shops bs
          ON bs.id = a.shop_id

        WHERE a.id = ?
        AND a.shop_id = ?

        LIMIT 1
        `,
        [
          appointmentId,
          shopId,
        ]
      );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    const appointment =
      appointments[0];

    const currentStatus =
      appointment.status;

    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        message:
          `Appointment is already ${status}`,
      });
    }

    const finalStatuses = [
      "completed",
      "cancelled",
      "no_show",
    ];

    if (
      finalStatuses.includes(
        currentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Appointment with status "${currentStatus}" cannot be changed`,
      });
    }

    const validTransitions = {
      pending: [
        "confirmed",
        "cancelled",
        "no_show",
      ],

      confirmed: [
        "completed",
        "cancelled",
        "no_show",
      ],
    };

    if (
      !validTransitions[currentStatus] ||
      !validTransitions[
        currentStatus
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change appointment from "${currentStatus}" to "${status}"`,
      });
    }

    await pool.query(
      `
      UPDATE appointments
      SET status = ?
      WHERE id = ?
      AND shop_id = ?
      `,
      [
        status,
        appointmentId,
        shopId,
      ]
    );

    /*
     * Confirmation notification
     */

    if (
      status === "confirmed" &&
      appointment.customer_email
    ) {
      await pool.query(
        `
        INSERT INTO notifications (
          user_id,
          appointment_id,
          type,
          channel,
          recipient,
          subject,
          message,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          null,
          appointmentId,
          "booking_confirmation",
          "email",
          appointment.customer_email,
          "Your appointment has been confirmed",
          `Hello ${appointment.customer_name}, your appointment at ${appointment.shop_name} has been confirmed for ${formatDateOnly(
            appointment.appointment_date
          )} at ${appointment.start_time}.`,
          "pending",
        ]
      );
    }

    /*
     * Cancellation notification
     */

    if (
      status === "cancelled" &&
      appointment.customer_email
    ) {
      await pool.query(
        `
        INSERT INTO notifications (
          user_id,
          appointment_id,
          type,
          channel,
          recipient,
          subject,
          message,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          null,
          appointmentId,
          "cancelled",
          "email",
          appointment.customer_email,
          "Your appointment has been cancelled",
          `Hello ${appointment.customer_name}, your appointment at ${appointment.shop_name} on ${formatDateOnly(
            appointment.appointment_date
          )} at ${appointment.start_time} has been cancelled.`,
          "pending",
        ]
      );
    }

    /*
     * Get updated appointment
     */

    const [updatedAppointments] =
      await pool.query(
        `
        SELECT
          a.id,
          a.shop_id,
          a.branch_id,
          a.staff_id,
          a.customer_id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.total_amount,
          a.currency

        FROM appointments a

        WHERE a.id = ?
        AND a.shop_id = ?

        LIMIT 1
        `,
        [
          appointmentId,
          shopId,
        ]
      );

    return res.json({
      success: true,
      message:
        `Appointment status updated to ${status}`,

      data: {
        appointment: {
          ...updatedAppointments[0],

          appointment_date:
            formatDateOnly(
              updatedAppointments[0]
                .appointment_date
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Update appointment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update appointment status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESCHEDULE APPOINTMENT
|--------------------------------------------------------------------------
*/

const rescheduleAppointment = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    const {
      appointmentDate,
      startTime,
    } = req.body;

    // IMPORTANT:
    // Shop ID comes from authenticated shop access middleware.
    const shopId = req.shopId;

    if (
      !shopId ||
      !appointmentDate ||
      !startTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "appointmentDate and startTime are required",
      });
    }

    /*
     * Validate date
     */

    const dateMatch =
      /^\d{4}-\d{2}-\d{2}$/.test(
        appointmentDate
      );

    if (!dateMatch) {
      return res.status(400).json({
        success: false,
        message:
          "appointmentDate must be YYYY-MM-DD",
      });
    }

    /*
     * Prevent rescheduling to a past date
     */

    const todayDate = getTodayDate();

    if (appointmentDate < todayDate) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment date cannot be in the past",
      });
    }

    /*
     * Validate time
     */

    const timeMatch =
      /^\d{2}:\d{2}(:\d{2})?$/.test(
        startTime
      );

    if (!timeMatch) {
      return res.status(400).json({
        success: false,
        message:
          "startTime must be HH:mm or HH:mm:ss",
      });
    }

    const normalizedStartTime =
      startTime.length === 5
        ? `${startTime}:00`
        : startTime;

    const startMinute =
      timeToMinutes(
        normalizedStartTime
      );

    if (
      startMinute < 0 ||
      startMinute >= 24 * 60
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment time",
      });
    }

    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    /*
     * 1. Get existing appointment
     */

    const [appointments] =
      await connection.query(
        `
        SELECT
          id,
          shop_id,
          branch_id,
          customer_id,
          staff_id,
          appointment_date,
          start_time,
          end_time,
          status
        FROM appointments
        WHERE id = ?
        AND shop_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [id, shopId]
      );

    if (appointments.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }

    const appointment =
      appointments[0];

    /*
     * Completed / cancelled / no-show
     * appointments cannot be rescheduled.
     */

    if (
      [
        "completed",
        "cancelled",
        "no_show",
      ].includes(
        appointment.status
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Appointment with status "${appointment.status}" cannot be rescheduled`,
      });
    }

    /*
     * 2. Get service duration
     */

    const [appointmentServices] =
      await connection.query(
        `
        SELECT
          service_id,
          duration_minutes
        FROM appointment_services
        WHERE appointment_id = ?
        ORDER BY id ASC
        `,
        [id]
      );

    if (
      appointmentServices.length === 0
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Appointment has no service",
      });
    }

    const duration =
      Number(
        appointmentServices[0]
          .duration_minutes
      );

    const endMinute =
      startMinute + duration;

    if (
      endMinute > 24 * 60
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Appointment would exceed the end of the day",
      });
    }

    const endTime =
      minutesToTime(endMinute);

    /*
     * 3. Check working hours
     */

    const [dayRows] =
      await connection.query(
        `
        SELECT
          DAYOFWEEK(?) - 1 AS day_of_week
        `,
        [appointmentDate]
      );

    const dayOfWeek =
      Number(
        dayRows[0].day_of_week
      );

    const [workingHours] =
      await connection.query(
        `
        SELECT
          start_time,
          end_time
        FROM working_hours
        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?
        AND day_of_week = ?
        AND is_available = 1
        ORDER BY start_time ASC
        `,
        [
          appointment.shop_id,
          appointment.branch_id,
          appointment.staff_id,
          dayOfWeek,
        ]
      );

    const fitsWorkingHours =
      workingHours.some(
        (workingHour) => {
          const workStart =
            timeToMinutes(
              workingHour.start_time
            );

          const workEnd =
            timeToMinutes(
              workingHour.end_time
            );

          return (
            startMinute >= workStart &&
            endMinute <= workEnd
          );
        }
      );

    if (!fitsWorkingHours) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Selected time is outside staff working hours",
      });
    }

    /*
     * 4. Check blocked times
     */

    const [blockedTimes] =
      await connection.query(
        `
        SELECT
          DATE_FORMAT(
            start_datetime,
            '%Y-%m-%d %H:%i:%s'
          ) AS start_datetime_local,

          DATE_FORMAT(
            end_datetime,
            '%Y-%m-%d %H:%i:%s'
          ) AS end_datetime_local

        FROM blocked_times

        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?

        AND DATE(start_datetime) <= ?
        AND DATE(end_datetime) >= ?

        ORDER BY start_datetime ASC
        `,
        [
          appointment.shop_id,
          appointment.branch_id,
          appointment.staff_id,
          appointmentDate,
          appointmentDate,
        ]
      );

    const blockedConflict =
      blockedTimes.some(
        (blocked) => {
          const startDate =
            String(
              blocked.start_datetime_local
            ).substring(0, 10);

          const endDate =
            String(
              blocked.end_datetime_local
            ).substring(0, 10);

          let blockedStart =
            timeToMinutes(
              String(
                blocked.start_datetime_local
              ).substring(11, 19)
            );

          let blockedEnd =
            timeToMinutes(
              String(
                blocked.end_datetime_local
              ).substring(11, 19)
            );

          if (
            startDate < appointmentDate
          ) {
            blockedStart = 0;
          }

          if (
            endDate > appointmentDate
          ) {
            blockedEnd = 24 * 60;
          }

          return overlaps(
            startMinute,
            endMinute,
            blockedStart,
            blockedEnd
          );
        }
      );

    if (blockedConflict) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Selected time is blocked or unavailable",
      });
    }

    /*
     * 5. Check existing appointments
     */

    const [existingAppointments] =
      await connection.query(
        `
        SELECT
          id,
          start_time,
          end_time,
          status
        FROM appointments

        WHERE shop_id = ?
        AND branch_id = ?
        AND staff_id = ?
        AND appointment_date = ?

        AND id != ?

        AND status IN (
          'pending',
          'confirmed'
        )

        ORDER BY start_time ASC

        FOR UPDATE
        `,
        [
          appointment.shop_id,
          appointment.branch_id,
          appointment.staff_id,
          appointmentDate,
          id,
        ]
      );

    const appointmentConflict =
      existingAppointments.some(
        (existingAppointment) => {
          const existingStart =
            timeToMinutes(
              existingAppointment.start_time
            );

          const existingEnd =
            timeToMinutes(
              existingAppointment.end_time
            );

          return overlaps(
            startMinute,
            endMinute,
            existingStart,
            existingEnd
          );
        }
      );

    if (appointmentConflict) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This new time slot has already been booked",
      });
    }

    /*
     * 6. Update appointment
     */

    await connection.query(
      `
      UPDATE appointments
      SET
        appointment_date = ?,
        start_time = ?,
        end_time = ?
      WHERE id = ?
      AND shop_id = ?
      `,
      [
        appointmentDate,
        normalizedStartTime,
        endTime,
        id,
        shopId,
      ]
    );

    /*
     * 7. Create reschedule notification
     */

    const [customerRows] =
      await connection.query(
        `
        SELECT
          name,
          email
        FROM customers
        WHERE id = ?
        LIMIT 1
        `,
        [appointment.customer_id]
      );

    if (
      customerRows.length > 0 &&
      customerRows[0].email
    ) {
      const customer =
        customerRows[0];

      const [shopRows] =
        await connection.query(
          `
          SELECT
            name
          FROM barber_shops
          WHERE id = ?
          LIMIT 1
          `,
          [shopId]
        );

      const shopName =
        shopRows.length > 0
          ? shopRows[0].name
          : "Barber Shop";

      await connection.query(
        `
        INSERT INTO notifications
        (
          user_id,
          appointment_id,
          type,
          channel,
          recipient,
          subject,
          message,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          null,
          id,
          "rescheduled",
          "email",
          customer.email,
          "Your appointment has been rescheduled",
          `Hello ${customer.name}, your appointment at ${shopName} has been rescheduled to ${appointmentDate} at ${normalizedStartTime}.`,
          "pending",
        ]
      );
    }

    /*
     * 8. Commit
     *
     * Only ONE commit.
     */

    await connection.commit();

    return res.json({
      success: true,
      message:
        "Appointment rescheduled successfully",

      data: {
        appointment: {
          id: Number(id),
          date: appointmentDate,
          startTime: normalizedStartTime,
          endTime,
          status: appointment.status,
        },
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }
    }

    console.error(
      "Reschedule appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reschedule appointment",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
|--------------------------------------------------------------------------
| GET CALENDAR APPOINTMENTS
|--------------------------------------------------------------------------
*/

const getCalendarAppointments = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message:
          "Shop ID could not be determined",
      });
    }

    const {
      date,
      view = "day",
    } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Use YYYY-MM-DD",
      });
    }

    if (
      !["day", "week", "month"].includes(
        view
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid view. Use day, week, or month",
      });
    }

    let startDate = date;
    let endDate = date;

    /*
     * Calculate date range
     */

    if (view === "week") {
      const selectedDate =
        new Date(`${date}T00:00:00`);

      const dayOfWeek =
        selectedDate.getDay();

      const mondayOffset =
        dayOfWeek === 0
          ? -6
          : 1 - dayOfWeek;

      const monday =
        new Date(selectedDate);

      monday.setDate(
        selectedDate.getDate() +
          mondayOffset
      );

      const sunday =
        new Date(monday);

      sunday.setDate(
        monday.getDate() + 6
      );

      startDate =
        formatDateOnly(monday);

      endDate =
        formatDateOnly(sunday);
    }

    if (view === "month") {
      const selectedDate =
        new Date(
          `${date}T00:00:00`
        );

      const firstDay =
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );

      const lastDay =
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );

      startDate =
        formatDateOnly(firstDay);

      endDate =
        formatDateOnly(lastDay);
    }

    /*
     * Get appointments
     */

    const [appointments] =
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
          b.name AS branch_name,

          GROUP_CONCAT(
            DISTINCT CONCAT(
              s.name,
              ' | ',
              s.duration_minutes,
              ' min | CHF ',
              s.price
            )
            SEPARATOR ', '
          ) AS services

        FROM appointments a

        LEFT JOIN customers c
          ON c.id = a.customer_id

        LEFT JOIN staff st
          ON st.id = a.staff_id

        LEFT JOIN branches b
          ON b.id = a.branch_id

        LEFT JOIN appointment_services aps
          ON aps.appointment_id = a.id

        LEFT JOIN services s
          ON s.id = aps.service_id

        WHERE a.shop_id = ?

        AND a.appointment_date
            BETWEEN ? AND ?

        GROUP BY
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.total_amount,
          a.currency,
          c.id,
          c.name,
          c.phone,
          c.email,
          st.id,
          st.display_name,
          b.id,
          b.name

        ORDER BY
          a.appointment_date ASC,
          a.start_time ASC
        `,
        [
          shopId,
          startDate,
          endDate,
        ]
      );

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
        view,
        start_date: startDate,
        end_date: endDate,
        count:
          formattedAppointments.length,
        appointments:
          formattedAppointments,
      },
    });
  } catch (error) {
    console.error(
      "Get calendar appointments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch calendar appointments",
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  getCalendarAppointments,
};