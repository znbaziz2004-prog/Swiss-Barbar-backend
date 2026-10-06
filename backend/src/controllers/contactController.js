const { pool } = require("../config/db");

const createContactMessage = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email and message are required.",
      });
    }

    await pool.query(
      `
      INSERT INTO contact_messages
      (
        name,
        phone,
        email,
        message
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        name.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        message.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Create contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not send your message.",
    });
  }
};

module.exports = {
  createContactMessage,
};