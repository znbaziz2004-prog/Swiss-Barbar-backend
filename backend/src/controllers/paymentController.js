const { pool } = require("../config/db");

const allowedMethods = [
  "cash",
  "card",
  "twint",
  "bank_transfer",
];

const allowedStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// Create payment
const createPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      amount,
      currency,
      method,
      transactionReference,
    } = req.body;

    if (!appointmentId || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "appointmentId and amount are required",
      });
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number greater than 0",
      });
    }

    if (method && !allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Allowed methods: cash, card, twint, bank_transfer",
      });
    }

    // Check appointment and shop access
    const [appointments] = await pool.query(
      `
      SELECT
        a.id,
        a.shop_id,
        a.total_amount,
        a.currency,
        a.status
      FROM appointments a
      INNER JOIN barber_shops bs
        ON bs.id = a.shop_id
      WHERE a.id = ?
      LIMIT 1
      `,
      [appointmentId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = appointments[0];

    // Non-super-admin users can only access their own shop
    if (
      req.user.role !== "super_admin" &&
      req.shopId !== appointment.shop_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this appointment",
      });
    }

    // Payment must match appointment total
    const appointmentTotal = Number(appointment.total_amount);

    if (
      !Number.isFinite(appointmentTotal) ||
      appointmentTotal <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The appointment does not have a valid payment amount",
      });
    }

    if (numericAmount !== appointmentTotal) {
      return res.status(400).json({
        success: false,
        message:
          `Payment amount must match the appointment total of ${appointment.currency} ${appointmentTotal.toFixed(2)}`,
        data: {
          appointmentTotal: appointmentTotal.toFixed(2),
          requestedAmount: numericAmount.toFixed(2),
          currency: appointment.currency,
        },
      });
    }

    // Payment currency must match appointment currency
    const paymentCurrency =
      currency || appointment.currency || "CHF";

    if (paymentCurrency !== appointment.currency) {
      return res.status(400).json({
        success: false,
        message:
          `Payment currency must match the appointment currency (${appointment.currency})`,
        data: {
          appointmentCurrency: appointment.currency,
          requestedCurrency: paymentCurrency,
        },
      });
    }

    // Prevent duplicate active payment records
    const [existingPayments] = await pool.query(
      `
      SELECT
        id,
        status
      FROM payments
      WHERE appointment_id = ?
        AND status IN ('pending', 'paid')
      ORDER BY id DESC
      LIMIT 1
      `,
      [appointmentId]
    );

    if (existingPayments.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An active payment already exists for this appointment",
        data: {
          paymentId: existingPayments[0].id,
          status: existingPayments[0].status,
        },
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO payments
      (
        appointment_id,
        amount,
        currency,
        method,
        status,
        transaction_reference
      )
      VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      [
        appointmentId,
        numericAmount,
        paymentCurrency,
        method || null,
        transactionReference || null,
      ]
    );

    const [payments] = await pool.query(
      `
      SELECT
        id,
        appointment_id,
        amount,
        currency,
        method,
        status,
        transaction_reference,
        paid_at,
        created_at
      FROM payments
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: {
        payment: payments[0],
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
    });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const { appointmentId, status } = req.query;

    const conditions = [];
    const params = [];

    if (req.user.role !== "super_admin") {
      conditions.push("a.shop_id = ?");
      params.push(req.shopId);
    } else if (req.query.shopId) {
      conditions.push("a.shop_id = ?");
      params.push(Number(req.query.shopId));
    }

    if (appointmentId) {
      conditions.push("p.appointment_id = ?");
      params.push(Number(appointmentId));
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment status. Allowed statuses: pending, paid, failed, refunded",
        });
      }

      conditions.push("p.status = ?");
      params.push(status);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [payments] = await pool.query(
      `
      SELECT
        p.id,
        p.appointment_id,
        p.amount,
        p.currency,
        p.method,
        p.status,
        p.transaction_reference,
        p.paid_at,
        p.created_at,
        a.appointment_date,
        a.start_time,
        a.end_time,
        c.id AS customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        s.id AS staff_id,
        s.display_name AS staff_name
      FROM payments p
      INNER JOIN appointments a
        ON a.id = p.appointment_id
      INNER JOIN customers c
        ON c.id = a.customer_id
      INNER JOIN staff s
        ON s.id = a.staff_id
      ${whereClause}
      ORDER BY p.id DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: {
        payments,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const conditions = ["p.id = ?"];
    const params = [id];

    if (req.user.role !== "super_admin") {
      conditions.push("a.shop_id = ?");
      params.push(req.shopId);
    } else if (req.query.shopId) {
      conditions.push("a.shop_id = ?");
      params.push(Number(req.query.shopId));
    }

    const [payments] = await pool.query(
      `
      SELECT
        p.id,
        p.appointment_id,
        p.amount,
        p.currency,
        p.method,
        p.status,
        p.transaction_reference,
        p.paid_at,
        p.created_at,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status AS appointment_status,
        c.id AS customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        s.id AS staff_id,
        s.display_name AS staff_name,
        bs.id AS shop_id,
        bs.name AS shop_name
      FROM payments p
      INNER JOIN appointments a
        ON a.id = p.appointment_id
      INNER JOIN customers c
        ON c.id = a.customer_id
      INNER JOIN staff s
        ON s.id = a.staff_id
      INNER JOIN barber_shops bs
        ON bs.id = a.shop_id
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
      `,
      params
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.json({
      success: true,
      data: {
        payment: payments[0],
      },
    });
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionReference } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Allowed statuses: pending, paid, failed, refunded",
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [payments] = await connection.query(
        `
        SELECT
          p.id,
          p.appointment_id,
          p.amount,
          p.currency,
          p.status,
          a.shop_id,
          a.total_amount,
          a.currency AS appointment_currency
        FROM payments p
        INNER JOIN appointments a
          ON a.id = p.appointment_id
        WHERE p.id = ?
        FOR UPDATE
        `,
        [id]
      );

      if (payments.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      const payment = payments[0];

      if (
        req.user.role !== "super_admin" &&
        req.shopId !== payment.shop_id
      ) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "You do not have access to this payment",
        });
      }

      // Final payment states
      if (
        payment.status === "refunded" &&
        status !== "refunded"
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "A refunded payment cannot be changed",
        });
      }

      if (
        payment.status === "paid" &&
        status === "pending"
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "A paid payment cannot be changed back to pending",
        });
      }

      if (
        payment.status === "refunded" &&
        status === "refunded"
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Payment is already refunded",
        });
      }

      // Validate payment amount against appointment total
      const appointmentTotal = Number(
        payment.total_amount
      );

      const paymentAmount = Number(payment.amount);

      if (
        !Number.isFinite(appointmentTotal) ||
        appointmentTotal <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "The appointment does not have a valid payment amount",
        });
      }

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "The payment does not have a valid amount",
        });
      }

      if (paymentAmount !== appointmentTotal) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Payment amount must match the appointment total of ${payment.appointment_currency} ${appointmentTotal.toFixed(2)}`,
          data: {
            appointmentTotal:
              appointmentTotal.toFixed(2),
            paymentAmount:
              paymentAmount.toFixed(2),
            currency: payment.appointment_currency,
          },
        });
      }

      // Validate payment currency against appointment currency
      if (
        payment.currency !==
        payment.appointment_currency
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Payment currency must match the appointment currency (${payment.appointment_currency})`,
          data: {
            appointmentCurrency:
              payment.appointment_currency,
            paymentCurrency: payment.currency,
          },
        });
      }

      // When marking as paid, make sure there is no
      // other active paid payment for the same appointment.
      if (status === "paid") {
        const [otherPaidPayments] =
          await connection.query(
            `
            SELECT
              id,
              status
            FROM payments
            WHERE appointment_id = ?
              AND status = 'paid'
              AND id <> ?
            LIMIT 1
            `,
            [payment.appointment_id, id]
          );

        if (otherPaidPayments.length > 0) {
          await connection.rollback();

          return res.status(409).json({
            success: false,
            message:
              "Another paid payment already exists for this appointment",
            data: {
              paymentId:
                otherPaidPayments[0].id,
            },
          });
        }
      }

      let paidAt = null;

      if (status === "paid") {
        paidAt = new Date();
      }

      if (status === "refunded") {
        paidAt = null;
      }

      await connection.query(
        `
        UPDATE payments
        SET
          status = ?,
          transaction_reference =
            COALESCE(?, transaction_reference),
          paid_at = ?
        WHERE id = ?
        `,
        [
          status,
          transactionReference || null,
          paidAt,
          id,
        ]
      );

      await connection.commit();

      const [updatedPayments] = await pool.query(
        `
        SELECT
          id,
          appointment_id,
          amount,
          currency,
          method,
          status,
          transaction_reference,
          paid_at,
          created_at
        FROM payments
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

      return res.json({
        success: true,
        message: "Payment status updated successfully",
        data: {
          payment: updatedPayments[0],
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Update payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
};