require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const createSuperAdmin = async () => {
  try {
    const name = "Swiss Barber Admin";
    const email = "admin@swissbarber.com";
    const password = "Admin@12345";

    // Check if already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      console.log("⚠️ Super Admin already exists");
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Super Admin
    const [result] = await pool.query(
      `
      INSERT INTO users
      (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'super_admin', 'active')
      `,
      [name, email, passwordHash]
    );

    console.log("✅ Super Admin created successfully");
    console.log("ID:", result.insertId);
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);

  } catch (error) {
    console.error("❌ Failed to create Super Admin:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();