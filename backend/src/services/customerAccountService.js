const crypto = require("crypto");

const { pool } = require("../config/db");
const { sendEmail } = require("./emailService");

const SETUP_TOKEN_EXPIRY_MINUTES = 30;

// Generate secure random token
const generateSetupToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash token before storing in database
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// Create customer dashboard access
const createCustomerDashboardAccess = async ({
  customerId,
  customerName,
  customerEmail,
}) => {
  const normalizedEmail = customerEmail.trim().toLowerCase();

  const setupToken = generateSetupToken();
  const tokenHash = hashToken(setupToken);

  // Store only hashed token
  await pool.query(
    `
      INSERT INTO customer_password_setup_tokens
      (
        customer_id,
        token_hash,
        expires_at
      )
      VALUES
      (
        ?,
        ?,
        DATE_ADD(
          NOW(),
          INTERVAL ? MINUTE
        )
      )
    `,
    [
      customerId,
      tokenHash,
      SETUP_TOKEN_EXPIRY_MINUTES,
    ]
  );

  // Enable dashboard
  await pool.query(
    `
      UPDATE customers
      SET
        dashboard_enabled = 1,
        credentials_sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [customerId]
  );

  /*
    Frontend developer can later configure this URL
    according to the customer dashboard route.
  */
  const dashboardSetupUrl =
  `http://127.0.0.1:8000/customer/setup-password?token=${setupToken}&email=${encodeURIComponent(
    normalizedEmail
  )}`;

  await sendEmail({
    to: normalizedEmail,

    subject:
      "Swiss Barber - Your Customer Dashboard",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        color: #222;
        line-height: 1.6;
      ">

        <h2 style="margin-bottom: 10px;">
          Welcome to Swiss Barber
        </h2>

        <p>
          Hello ${customerName},
        </p>

        <p>
          Your appointment has been successfully created.
          We have also created your Swiss Barber customer
          dashboard account.
        </p>

        <p>
          From your dashboard you will be able to:
        </p>

        <ul>
          <li>View your appointments</li>
          <li>Reschedule appointments</li>
          <li>Cancel appointments</li>
          <li>View your appointment history</li>
          <li>Manage your profile</li>
          <li>Make a new appointment</li>
        </ul>

        <p>
          Click the button below to set your dashboard password.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${dashboardSetupUrl}"
            style="
              display: inline-block;
              padding: 12px 22px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            "
          >
            Set Up My Dashboard
          </a>
        </div>

        <p>
          This setup link will expire in
          ${SETUP_TOKEN_EXPIRY_MINUTES} minutes.
        </p>

        <p>
          Your dashboard email:
          <strong>${normalizedEmail}</strong>
        </p>

        <p>
          If you did not make this appointment,
          please contact Swiss Barber.
        </p>

        <p>
          Swiss Barber Team
        </p>

      </div>
    `,
  });

  return {
    success: true,
    message:
      "Customer dashboard access created successfully",
  };
};

module.exports = {
  createCustomerDashboardAccess,
};