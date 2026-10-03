const jwt = require("jsonwebtoken");

const customerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    req.customer = {
      id: decoded.customerId,
      shopId: decoded.shopId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Customer auth error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Customer session has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid customer authentication token",
    });
  }
};

module.exports = customerAuthMiddleware;