const crypto = require("crypto");
const { pool } = require("../config/db");
const { sendEmail } = require("./emailService");

const OTP_EXPIRY_MINUTES = 10;
const BOOKING_TOKEN_EXPIRY_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateBookingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

/*
|--------------------------------------------------------------------------
| SEND CUSTOMER OTP
|--------------------------------------------------------------------------
*/

const sendCustomerOtp = async ({
  email,
  purpose = "booking_verification",
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  await pool.query(
    `
      UPDATE customer_email_verifications
      SET verified_at = CURRENT_TIMESTAMP
      WHERE email = ?
        AND purpose = ?
        AND verified_at IS NULL
    `,
    [normalizedEmail, purpose]
  );

  const code = generateOtp();

  await pool.query(
    `
      INSERT INTO customer_email_verifications
      (
        email,
        code,
        purpose,
        expires_at
      )
      VALUES
      (
        ?,
        ?,
        ?,
        DATE_ADD(NOW(), INTERVAL ? MINUTE)
      )
    `,
    [
      normalizedEmail,
      code,
      purpose,
      OTP_EXPIRY_MINUTES,
    ]
  );

  await sendEmail({
    to: normalizedEmail,
    subject: "Swiss Barber - Email Verification Code",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        color: #222;
      ">
        <h2>Swiss Barber</h2>

        <p>Your email verification code is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 25px 0;
        ">
          ${code}
        </div>

        <p>
          This code will expire in
          ${OTP_EXPIRY_MINUTES} minutes.
        </p>

        <p>
          If you did not request this code,
          you can safely ignore this email.
        </p>

        <p>Swiss Barber Team</p>
      </div>
    `,
  });

  return {
    success: true,
    message: "Verification code sent successfully",
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY CUSTOMER OTP
|--------------------------------------------------------------------------
*/

const verifyCustomerOtp = async ({
  email,
  code,
  purpose = "booking_verification",
  shopId,
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();

  if (!normalizedEmail || !normalizedCode) {
    throw new Error(
      "Email and verification code are required"
    );
  }

  if (!shopId) {
    throw new Error(
      "Shop ID is required for booking verification"
    );
  }

  const [rows] = await pool.query(
    `
      SELECT *
      FROM customer_email_verifications
      WHERE email = ?
        AND purpose = ?
        AND verified_at IS NULL
      ORDER BY id DESC
      LIMIT 1
    `,
    [
      normalizedEmail,
      purpose,
    ]
  );

  if (rows.length === 0) {
    throw new Error(
      "No active verification code found"
    );
  }

  const verification = rows[0];

  if (
    new Date(verification.expires_at) <
    new Date()
  ) {
    throw new Error(
      "Verification code has expired"
    );
  }

  if (
    verification.attempts >=
    MAX_OTP_ATTEMPTS
  ) {
    throw new Error(
      "Too many incorrect attempts. Please request a new code"
    );
  }

  if (
    verification.code !== normalizedCode
  ) {
    await pool.query(
      `
        UPDATE customer_email_verifications
        SET attempts = attempts + 1
        WHERE id = ?
      `,
      [verification.id]
    );

    throw new Error(
      "Invalid verification code"
    );
  }

  /*
   * Mark OTP as verified
   */

  await pool.query(
    `
      UPDATE customer_email_verifications
      SET verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [verification.id]
  );

  /*
   * Generate secure booking token
   */

  const bookingToken =
    generateBookingToken();

  const tokenHash =
    hashToken(bookingToken);

  await pool.query(
    `
      INSERT INTO customer_booking_verifications
      (
        email,
        shop_id,
        token_hash,
        expires_at
      )
      VALUES
      (
        ?,
        ?,
        ?,
        DATE_ADD(
          NOW(),
          INTERVAL ? MINUTE
        )
      )
    `,
    [
      normalizedEmail,
      shopId,
      tokenHash,
      BOOKING_TOKEN_EXPIRY_MINUTES,
    ]
  );

  return {
    success: true,
    message:
      "Email verified successfully",

    email: normalizedEmail,

    bookingVerificationToken:
      bookingToken,

    expiresInMinutes:
      BOOKING_TOKEN_EXPIRY_MINUTES,
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY BOOKING TOKEN
|--------------------------------------------------------------------------
*/

const verifyBookingToken = async ({
  token,
  email,
  shopId,
  connection = pool,
}) => {
  if (!token) {
    throw new Error(
      "Booking verification token is required"
    );
  }

  if (!email) {
    throw new Error(
      "Email is required"
    );
  }

  if (!shopId) {
    throw new Error(
      "Shop ID is required"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const tokenHash =
    hashToken(token);

  const [rows] =
    await connection.query(
      `
        SELECT
          id,
          email,
          shop_id,
          expires_at,
          used_at
        FROM customer_booking_verifications
        WHERE token_hash = ?
        AND email = ?
        AND shop_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [
        tokenHash,
        normalizedEmail,
        shopId,
      ]
    );

  if (rows.length === 0) {
    throw new Error(
      "Invalid booking verification token"
    );
  }

  const verification =
    rows[0];

  if (verification.used_at) {
    throw new Error(
      "Booking verification token has already been used"
    );
  }

  if (
    new Date(verification.expires_at) <
    new Date()
  ) {
    throw new Error(
      "Booking verification token has expired"
    );
  }

  return verification;
};

/*
|--------------------------------------------------------------------------
| CONSUME BOOKING TOKEN
|--------------------------------------------------------------------------
*/

const consumeBookingToken = async ({
  token,
  email,
  shopId,
  connection = pool,
}) => {
  const verification =
    await verifyBookingToken({
      token,
      email,
      shopId,
      connection,
    });

  await connection.query(
    `
      UPDATE customer_booking_verifications
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [verification.id]
  );

  return true;
};

module.exports = {
  sendCustomerOtp,
  verifyCustomerOtp,
  verifyBookingToken,
  consumeBookingToken,
};