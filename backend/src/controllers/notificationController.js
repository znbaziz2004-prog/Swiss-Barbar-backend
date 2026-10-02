const { pool } = require("../config/db");

/*
 * Helper
 *
 * Prevents appointment DATE values from shifting
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


/*
 * Get notifications
 */
const getNotifications = async (req, res) => {
  try {
    const {
      userId,
      appointmentId,
      status,
      type,
    } = req.query;

    let query = `
      SELECT
        n.id,
        n.user_id,
        n.appointment_id,
        n.type,
        n.channel,
        n.recipient,
        n.subject,
        n.message,
        n.status,
        n.sent_at,
        n.created_at,
        a.appointment_date,
        a.start_time,
        a.end_time
      FROM notifications n
      LEFT JOIN appointments a
        ON n.appointment_id = a.id
      WHERE 1 = 1
    `;

    const params = [];

    if (userId) {
      query += " AND n.user_id = ?";
      params.push(userId);
    }

    if (appointmentId) {
      query += " AND n.appointment_id = ?";
      params.push(appointmentId);
    }

    if (status) {
      query += " AND n.status = ?";
      params.push(status);
    }

    if (type) {
      query += " AND n.type = ?";
      params.push(type);
    }

    query += " ORDER BY n.created_at DESC";

    const [notifications] =
      await pool.query(
        query,
        params
      );

    /*
     * Format appointment dates
     */
    const formattedNotifications =
      notifications.map(
        (notification) => ({
          ...notification,

          appointment_date:
            formatDateOnly(
              notification.appointment_date
            ),
        })
      );

    res.json({
      success: true,
      data: {
        count:
          formattedNotifications.length,

        notifications:
          formattedNotifications,
      },
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
};


/*
 * Get notification by ID
 */
const getNotificationById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [notifications] =
      await pool.query(
        `
        SELECT
          n.id,
          n.user_id,
          n.appointment_id,
          n.type,
          n.channel,
          n.recipient,
          n.subject,
          n.message,
          n.status,
          n.sent_at,
          n.created_at,
          a.appointment_date,
          a.start_time,
          a.end_time

        FROM notifications n

        LEFT JOIN appointments a
          ON n.appointment_id = a.id

        WHERE n.id = ?
        `,
        [id]
      );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    const notification =
      notifications[0];

    notification.appointment_date =
      formatDateOnly(
        notification.appointment_date
      );

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(
      "Get notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notification",
    });
  }
};


/*
 * Create notification
 */
const createNotification = async (
  req,
  res
) => {
  try {
    const {
      userId,
      appointmentId,
      type,
      channel = "email",
      recipient,
      subject,
      message,
    } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message:
          "Notification type is required",
      });
    }

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message:
          "Notification recipient is required",
      });
    }

    const allowedTypes = [
      "booking_confirmation",
      "booking_reminder",
      "booking_created",
      "rescheduled",
      "cancelled",
    ];

    const allowedChannels = [
      "email",
      "sms",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification type",
      });
    }

    if (!allowedChannels.includes(channel)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification channel",
      });
    }

    const [result] =
      await pool.query(
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

        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `,
        [
          userId || null,
          appointmentId || null,
          type,
          channel,
          recipient,
          subject || null,
          message || null,
        ]
      );

    const [notifications] =
      await pool.query(
        `
        SELECT *
        FROM notifications
        WHERE id = ?
        `,
        [result.insertId]
      );

    res.status(201).json({
      success: true,
      message:
        "Notification created successfully",
      data: notifications[0],
    });
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create notification",
    });
  }
};


/*
 * Update notification status
 */
const updateNotificationStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "sent",
      "failed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification status",
      });
    }

    const sentAt =
      status === "sent"
        ? new Date()
        : null;

    const [result] =
      await pool.query(
        `
        UPDATE notifications
        SET
          status = ?,
          sent_at = ?

        WHERE id = ?
        `,
        [
          status,
          sentAt,
          id,
        ]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    const [notifications] =
      await pool.query(
        `
        SELECT *
        FROM notifications
        WHERE id = ?
        `,
        [id]
      );

    res.json({
      success: true,
      message:
        "Notification status updated successfully",
      data: notifications[0],
    });
  } catch (error) {
    console.error(
      "Update notification status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update notification status",
    });
  }
};


module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotificationStatus,
};