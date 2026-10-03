const express = require("express");

const { pool } = require("../config/db");
const customerAuthMiddleware = require("../middleware/customerAuthMiddleware");
const { sendEmail } = require("../services/emailService");
const router = express.Router();


// Get logged-in customer profile
router.get("/profile", customerAuthMiddleware, async (req, res) => {
  try {
    const [customers] = await pool.execute(
      `
      SELECT
        id,
        shop_id,
        name,
        phone,
        email,
        email_verified_at,
        dashboard_enabled,
        created_at,
        updated_at
      FROM customers
      WHERE id = ?
        AND shop_id = ?
      LIMIT 1
      `,
      [req.customer.id, req.customer.shopId]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    if (!customer.dashboard_enabled) {
      return res.status(403).json({
        success: false,
        message: "Customer dashboard access is disabled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer profile fetched successfully",
      data: {
        customer: {
          id: customer.id,
          shopId: customer.shop_id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          emailVerified: !!customer.email_verified_at,
          dashboardEnabled: !!customer.dashboard_enabled,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Customer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer profile",
    });
  }
});

router.get("/bookings", customerAuthMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status,
        a.total_amount,
        a.currency,
        a.customer_note,
        a.created_at,

        bs.id AS shop_id,
        bs.name AS shop_name,

        b.id AS branch_id,
        b.name AS branch_name,

        s.id AS staff_id,
        s.display_name AS staff_name,

        aps.service_id,
        aps.service_name,
        aps.duration_minutes,
        aps.price AS service_price

      FROM appointments a

      INNER JOIN barber_shops bs
        ON bs.id = a.shop_id

      INNER JOIN branches b
        ON b.id = a.branch_id

      INNER JOIN staff s
        ON s.id = a.staff_id

      LEFT JOIN appointment_services aps
        ON aps.appointment_id = a.id

      WHERE a.customer_id = ?
        AND a.shop_id = ?

      ORDER BY
        a.appointment_date DESC,
        a.start_time DESC
      `,
      [req.customer.id, req.customer.shopId]
    );

    return res.status(200).json({
      success: true,
      message: "Customer bookings fetched successfully",
      data: {
        bookings: bookings.map((booking) => ({
          id: booking.id,
          date: booking.appointment_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          status: booking.status,
          totalAmount: booking.total_amount,
          currency: booking.currency,
          customerNote: booking.customer_note,

          shop: {
            id: booking.shop_id,
            name: booking.shop_name,
          },

          branch: {
            id: booking.branch_id,
            name: booking.branch_name,
          },

          staff: {
            id: booking.staff_id,
            name: booking.staff_name,
          },

          service: {
            id: booking.service_id,
            name: booking.service_name,
            durationMinutes: booking.duration_minutes,
            price: booking.service_price,
          },

          createdAt: booking.created_at,
        })),
        count: bookings.length,
      },
    });
  } catch (error) {
    console.error("Customer bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer bookings",
    });
  }
});
router.get("/bookings/:id", customerAuthMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [bookings] = await pool.execute(
      `
      SELECT
        a.id,
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

        bs.id AS shop_id,
        bs.name AS shop_name,

        b.id AS branch_id,
        b.name AS branch_name,

        s.id AS staff_id,
        s.display_name AS staff_name,

        aps.service_id,
        aps.service_name,
        aps.duration_minutes,
        aps.price AS service_price

      FROM appointments a

      INNER JOIN barber_shops bs
        ON bs.id = a.shop_id

      INNER JOIN branches b
        ON b.id = a.branch_id

      INNER JOIN staff s
        ON s.id = a.staff_id

      LEFT JOIN appointment_services aps
        ON aps.appointment_id = a.id

      WHERE a.id = ?
        AND a.customer_id = ?
        AND a.shop_id = ?

      LIMIT 1
      `,
      [bookingId, req.customer.id, req.customer.shopId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    return res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: {
        booking: {
          id: booking.id,
          date: booking.appointment_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          status: booking.status,
          totalAmount: booking.total_amount,
          currency: booking.currency,
          customerNote: booking.customer_note,
          internalNote: booking.internal_note,

          shop: {
            id: booking.shop_id,
            name: booking.shop_name,
          },

          branch: {
            id: booking.branch_id,
            name: booking.branch_name,
          },

          staff: {
            id: booking.staff_id,
            name: booking.staff_name,
          },

          service: {
            id: booking.service_id,
            name: booking.service_name,
            durationMinutes: booking.duration_minutes,
            price: booking.service_price,
          },

          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Customer booking details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load booking details",
    });
  }
});

router.patch(
  "/bookings/:id/cancel",
  customerAuthMiddleware,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      const [bookings] = await pool.execute(
        `
          SELECT
            a.id,
            a.status,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.total_amount,
            a.currency,
            s.display_name AS staff_name,
            b.name AS branch_name,
            bs.name AS shop_name,
            aps.service_name
          FROM appointments a
          LEFT JOIN staff s
            ON s.id = a.staff_id
          LEFT JOIN branches b
            ON b.id = a.branch_id
          LEFT JOIN barber_shops bs
            ON bs.id = a.shop_id
          LEFT JOIN appointment_services aps
            ON aps.appointment_id = a.id
          WHERE a.id = ?
            AND a.customer_id = ?
            AND a.shop_id = ?
          LIMIT 1
        `,
        [
          bookingId,
          req.customer.id,
          req.customer.shopId,
        ]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const booking = bookings[0];

      if (
        !["pending", "confirmed"].includes(
          booking.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending or confirmed bookings can be cancelled",
        });
      }

      /*
       * Cancel booking
       */
      await pool.execute(
        `
          UPDATE appointments
          SET
            status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND customer_id = ?
            AND shop_id = ?
        `,
        [
          bookingId,
          req.customer.id,
          req.customer.shopId,
        ]
      );

      /*
       * Create cancellation notification
       */
      const notificationSubject =
        "Your appointment has been cancelled";

      const notificationMessage =
        `Hello ${req.customer.name}, your appointment at ${booking.shop_name} scheduled for ${booking.appointment_date} at ${booking.start_time} has been cancelled.`;

      const [notificationResult] =
        await pool.execute(
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
              'cancelled',
              'email',
              ?,
              ?,
              ?,
              'pending'
            )
          `,
          [
            bookingId,
            req.customer.email,
            notificationSubject,
            notificationMessage,
          ]
        );

      const notificationId =
        notificationResult.insertId;

      /*
       * Send cancellation email
       */
      try {
        await sendEmail({
          to: req.customer.email,
          subject: notificationSubject,
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #222;
            ">
              <h2>Swiss Barber</h2>

              <p>Hello ${req.customer.name},</p>

              <p>
                Your appointment has been successfully cancelled.
              </p>

              <p>
                <strong>Date:</strong>
                ${booking.appointment_date}<br>

                <strong>Time:</strong>
                ${booking.start_time}<br>

                <strong>Service:</strong>
                ${booking.service_name || "Appointment"}<br>

                <strong>Barber:</strong>
                ${booking.staff_name || "Swiss Barber"}
              </p>

              <p>
                If you would like to book another appointment,
                you can make a new booking anytime.
              </p>

              <p>
                Thank you for choosing Swiss Barber.
              </p>

              <p>
                Swiss Barber Team
              </p>
            </div>
          `,
        });

        await pool.execute(
          `
            UPDATE notifications
            SET status = 'sent'
            WHERE id = ?
          `,
          [notificationId]
        );

        console.log(
          "Cancellation email sent successfully"
        );
      } catch (emailError) {
        console.error(
          "Cancellation email failed:",
          emailError.message
        );

        await pool.execute(
          `
            UPDATE notifications
            SET status = 'failed'
            WHERE id = ?
          `,
          [notificationId]
        );
      }

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          bookingId: Number(bookingId),
          status: "cancelled",
        },
      });
    } catch (error) {
      console.error(
        "Customer cancel booking error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to cancel booking",
      });
    }
  }
);
router.get(
  "/bookings/:id/reschedule-availability",
  customerAuthMiddleware,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      const { date, startTime } = req.query;

      if (!date || !startTime) {
        return res.status(400).json({
          success: false,
          message: "Date and start time are required",
        });
      }

      // Get customer's booking
      const [bookings] = await pool.execute(
        `
        SELECT
          id,
          shop_id,
          branch_id,
          staff_id,
          status
        FROM appointments
        WHERE id = ?
          AND customer_id = ?
          AND shop_id = ?
        LIMIT 1
        `,
        [bookingId, req.customer.id, req.customer.shopId]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const booking = bookings[0];

      // Only pending or confirmed bookings can be rescheduled
      if (!["pending", "confirmed"].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Booking cannot be rescheduled because its current status is ${booking.status}`,
        });
      }

      // Get current booking duration
      const [services] = await pool.execute(
        `
        SELECT duration_minutes
        FROM appointment_services
        WHERE appointment_id = ?
        LIMIT 1
        `,
        [bookingId]
      );

      if (services.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Booking service information not found",
        });
      }

      const durationMinutes = services[0].duration_minutes;

      // Calculate new end time
      const [endTimeResult] = await pool.execute(
        `
        SELECT ADDTIME(
          ?,
          SEC_TO_TIME(? * 60)
        ) AS end_time
        `,
        [startTime, durationMinutes]
      );

      const endTime = endTimeResult[0].end_time;

      // Check overlapping appointments for same barber
      const [conflicts] = await pool.execute(
        `
        SELECT id
        FROM appointments
        WHERE staff_id = ?
          AND branch_id = ?
          AND appointment_date = ?
          AND status IN ('pending', 'confirmed')
          AND id != ?
          AND start_time < ?
          AND end_time > ?
        LIMIT 1
        `,
        [
          booking.staff_id,
          booking.branch_id,
          date,
          bookingId,
          endTime,
          startTime,
        ]
      );

      if (conflicts.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Selected time is not available",
          data: {
            available: false,
            date,
            startTime,
            endTime,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Selected time is available",
        data: {
          available: true,
          date,
          startTime,
          endTime,
          durationMinutes,
        },
      });
    } catch (error) {
      console.error("Reschedule availability error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to check reschedule availability",
      });
    }
  }
);
router.patch(
  "/bookings/:id/reschedule",
  customerAuthMiddleware,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      const { date, startTime } = req.body;

      if (!date || !startTime) {
        return res.status(400).json({
          success: false,
          message: "Date and start time are required",
        });
      }

      // Get customer's booking
      const [bookings] = await pool.execute(
        `
        SELECT
          id,
          shop_id,
          branch_id,
          staff_id,
          status
        FROM appointments
        WHERE id = ?
          AND customer_id = ?
          AND shop_id = ?
        LIMIT 1
        `,
        [bookingId, req.customer.id, req.customer.shopId]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const booking = bookings[0];

      // Only pending and confirmed bookings can be rescheduled
      if (!["pending", "confirmed"].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Booking cannot be rescheduled because its current status is ${booking.status}`,
        });
      }

      // Get original service duration
      const [services] = await pool.execute(
        `
        SELECT
          duration_minutes
        FROM appointment_services
        WHERE appointment_id = ?
        LIMIT 1
        `,
        [bookingId]
      );

      if (services.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Booking service information not found",
        });
      }

      const durationMinutes = services[0].duration_minutes;

      // Calculate new end time
      const [endTimeResult] = await pool.execute(
        `
        SELECT ADDTIME(
          ?,
          SEC_TO_TIME(? * 60)
        ) AS end_time
        `,
        [startTime, durationMinutes]
      );

      const endTime = endTimeResult[0].end_time;

      // Check staff working hours
      const [workingHours] = await pool.execute(
        `
        SELECT
          start_time,
          end_time
        FROM working_hours
        WHERE shop_id = ?
          AND branch_id = ?
          AND staff_id = ?
          AND day_of_week = DAYOFWEEK(?)
          AND is_available = 1
        LIMIT 1
        `,
        [
          booking.shop_id,
          booking.branch_id,
          booking.staff_id,
          date,
        ]
      );

      if (workingHours.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected date is outside staff working hours",
        });
      }

      const workingHour = workingHours[0];

      if (
        startTime < workingHour.start_time ||
        endTime > workingHour.end_time
      ) {
        return res.status(400).json({
          success: false,
          message: "Selected time is outside staff working hours",
        });
      }

      // Check for conflicting appointments
      const [conflicts] = await pool.execute(
        `
        SELECT id
        FROM appointments
        WHERE staff_id = ?
          AND branch_id = ?
          AND appointment_date = ?
          AND status IN ('pending', 'confirmed')
          AND id != ?
          AND start_time < ?
          AND end_time > ?
        LIMIT 1
        `,
        [
          booking.staff_id,
          booking.branch_id,
          date,
          bookingId,
          endTime,
          startTime,
        ]
      );

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Selected time is not available",
        });
      }

      // Update appointment
      await pool.execute(
        `
        UPDATE appointments
        SET
          appointment_date = ?,
          start_time = ?,
          end_time = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND customer_id = ?
          AND shop_id = ?
        `,
        [
          date,
          startTime,
          endTime,
          bookingId,
          req.customer.id,
          req.customer.shopId,
        ]
      );

    const [notificationResult] = await pool.execute(
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
    'rescheduled',
    'email',
    ?,
    ?,
    ?,
    'pending'
  )
  `,
  [
    bookingId,
    req.customer.email,
    "Your appointment has been rescheduled",
    `Your Swiss Barber appointment has been rescheduled to ${date} at ${startTime}.`,
  ]
);

const notificationId = notificationResult.insertId;

try {
  await sendEmail({
    to: req.customer.email,
    subject: "Your appointment has been rescheduled",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Appointment Rescheduled</h2>
        <p>Hello,</p>
        <p>Your Swiss Barber appointment has been successfully rescheduled.</p>

        <p>
          <strong>Date:</strong> ${date}<br>
          <strong>Time:</strong> ${startTime}<br>
          <strong>Duration:</strong> ${durationMinutes} minutes
        </p>

        <p>Thank you for choosing Swiss Barber.</p>
      </div>
    `,
  });

  await pool.execute(
    `
    UPDATE notifications
    SET status = 'sent'
    WHERE id = ?
    `,
    [notificationId]
  );
} catch (emailError) {
  console.error("Reschedule email failed:", emailError.message);

  await pool.execute(
    `
    UPDATE notifications
    SET status = 'failed'
    WHERE id = ?
    `,
    [notificationId]
  );
}

      return res.status(200).json({
        success: true,
        message: "Booking rescheduled successfully",
        data: {
          bookingId: Number(bookingId),
          date,
          startTime,
          endTime,
          durationMinutes,
          status: booking.status,
        },
      });
    } catch (error) {
      console.error("Customer reschedule booking error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reschedule booking",
      });
    }
  }
);
module.exports = router;