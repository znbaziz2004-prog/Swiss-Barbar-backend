const bcrypt = require("bcryptjs");
const { pool } = require("../config/db")
const jwt = require("jsonwebtoken");

const {
  sendCustomerOtp,
  verifyCustomerOtp,
  
} = require("../services/customerOtpService");

// Send OTP
const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await sendCustomerOtp({
      email,
      purpose: "booking_verification",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Send customer OTP error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification code",
    });
  }
};

// Verify OTP
const verifyCode = async (req, res) => {
  try {
    const {
      email,
      code,
      shopId,
    } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required",
      });
    }

    const result = await verifyCustomerOtp({
      email,
      code,
      purpose: "booking_verification",
      shopId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Verify customer OTP error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};
// Customer Login
const loginCustomer = async (req, res) => {
  try {
    const { email, password, shopId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [customers] = await pool.execute(
      `
      SELECT
        id,
        shop_id,
        name,
        phone,
        email,
        password_hash,
        email_verified_at,
        dashboard_enabled
      FROM customers
      WHERE email = ?
        AND shop_id = ?
      LIMIT 1
      `,
      [normalizedEmail, shopId]
    );

    if (customers.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const customer = customers[0];

    if (!customer.dashboard_enabled) {
      return res.status(403).json({
        success: false,
        message: "Customer dashboard access is not enabled",
      });
    }

    if (!customer.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Customer account is not configured for login",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!customer.email_verified_at) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }


    
    const token = jwt.sign(
  {
    customerId: customer.id,
    shopId: customer.shop_id,
    email: customer.email,
    role: "customer",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

return res.status(200).json({
  success: true,
  message: "Customer login successful",
  data: {
    token,
    expiresIn: "7d",
    customer: {
      id: customer.id,
      shopId: customer.shop_id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    },
  },
});
  } catch (error) {
    console.error("Customer login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Customer login failed",
    });
  }
};

module.exports = {
  sendCode,
  verifyCode,
  loginCustomer,
};