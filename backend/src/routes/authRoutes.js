const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Public
router.post("/register", register);
router.post("/login", login);


// Any authenticated user
router.get("/me", authMiddleware, getMe);


// Barber only
router.get(
  "/barber-test",
  authMiddleware,
  authorizeRoles("barber"),
  (req, res) => {
    res.json({
      success: true,
      message: "Barber access granted",
      user: req.user,
    });
  }
);


// Owner / Manager
router.get(
  "/management-test",
  authMiddleware,
  authorizeRoles("owner", "manager"),
  (req, res) => {
    res.json({
      success: true,
      message: "Management access granted",
      user: req.user,
    });
  }
);


// Super Admin only
router.get(
  "/super-admin-test",
  authMiddleware,
  authorizeRoles("super_admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Super Admin access granted",
      user: req.user,
    });
  }
);


module.exports = router;