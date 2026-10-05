const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");


// =====================================================
// CREATE BARBER SHOP + OWNER
// Super Admin only
// =====================================================

const createShop = async (req, res) => {
  let connection;

  try {
    const {
      shopName,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword,

      phone,
      email,
      website,

      address,
      city,
      postalCode,
      canton,

      latitude,
      longitude,
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !shopName ||
      !ownerName ||
      !ownerEmail ||
      !ownerPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Shop name, owner name, owner email and owner password are required",
      });
    }


    // =================================================
    // GET DATABASE CONNECTION
    // =================================================

    connection = await pool.getConnection();


    // =================================================
    // CHECK OWNER EMAIL
    // =================================================

    const [existingUsers] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [ownerEmail]
    );

    if (existingUsers.length > 0) {
      connection.release();

      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }


    // =================================================
    // START TRANSACTION
    // =================================================

    await connection.beginTransaction();


    // =================================================
    // HASH OWNER PASSWORD
    // =================================================

    const passwordHash = await bcrypt.hash(
      ownerPassword,
      12
    );


    // =================================================
    // CREATE OWNER
    // =================================================

    const [ownerResult] = await connection.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone,
        password_hash,
        role,
        status
      )
      VALUES (?, ?, ?, ?, 'owner', 'active')
      `,
      [
        ownerName,
        ownerEmail,
        ownerPhone || null,
        passwordHash,
      ]
    );

    const ownerId = ownerResult.insertId;


    // =================================================
    // CREATE SHOP
    // =================================================

    const [shopResult] = await connection.query(
      `
      INSERT INTO barber_shops
      (
        owner_id,
        name,
        phone,
        email,
        website,
        address,
        city,
        postal_code,
        canton,
        country,
        latitude,
        longitude,
        currency,
        timezone,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Switzerland', ?, ?, 'CHF', 'Europe/Zurich', 'active')
      `,
      [
        ownerId,
        shopName,
        phone || null,
        email || null,
        website || null,
        address || null,
        city || null,
        postalCode || null,
        canton || null,
        latitude || null,
        longitude || null,
      ]
    );

    const shopId = shopResult.insertId;


    // =================================================
    // COMMIT
    // =================================================

    await connection.commit();

    connection.release();


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Barber shop and owner created successfully",

      data: {
        shop: {
          id: shopId,
          name: shopName,
          city: city || null,
          canton: canton || null,
          status: "active",
        },

        owner: {
          id: ownerId,
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone || null,
          role: "owner",
          status: "active",
        },
      },
    });


  } catch (error) {

    // =================================================
    // ROLLBACK
    // =================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }

      connection.release();
    }


    console.error(
      "Create shop error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Failed to create barber shop",
    });
  }
};

// =====================================================
// PUBLIC SHOP REGISTRATION
// =====================================================

const registerShop = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const {
      shopName,
      defaultLanguage,
      firstName,
      lastName,
      email,
      cocNumber,
      vatId,
      country,
      streetName,
      buildingNumber,
      postalCode,
      city,
      companyPhone,
      privatePhone,
      instagramUsername,
      referralSource,
      packageCode,
      password,
    } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const allowedLanguages = ["en", "de", "fr", "it"];
    const swissPhonePattern = /^\+41\d{7,12}$/;

    if (
      !shopName ||
      !defaultLanguage ||
      !firstName ||
      !normalizedEmail ||
      !streetName ||
      !buildingNumber ||
      !postalCode ||
      !city ||
      !companyPhone ||
      !privatePhone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required registration fields",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (!allowedLanguages.includes(defaultLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Select a supported language",
      });
    }

    if (country !== "Switzerland") {
      return res.status(400).json({
        success: false,
        message: "Registration is currently available in Switzerland",
      });
    }

    if (!swissPhonePattern.test(companyPhone) || !swissPhonePattern.test(privatePhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter valid Swiss phone numbers with the +41 country code",
      });
    }

    if (packageCode !== "standard") {
      return res.status(400).json({
        success: false,
        message: "Select the Standard package to continue",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    connection = await pool.getConnection();

    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    const normalizedFirstName = String(firstName).trim();
    const normalizedLastName = String(lastName || "").trim();
    const fullName = [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ");
    const passwordHash = await bcrypt.hash(password, 12);
    const [ownerResult] = await connection.query(
      `
      INSERT INTO users
        (name, first_name, last_name, default_language, email, phone, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'owner', 'active')
      `,
      [
        fullName,
        normalizedFirstName,
        normalizedLastName || null,
        defaultLanguage,
        normalizedEmail,
        privatePhone,
        passwordHash,
      ]
    );

    const address = `${String(streetName).trim()} ${String(buildingNumber).trim()}`;
    const [shopResult] = await connection.query(
      `
      INSERT INTO barber_shops
        (owner_id, name, phone, email, address, street_name, building_number,
         city, postal_code, country, coc_number, vat_id, instagram_username,
         referral_source, subscription_package, subscription_monthly_price,
         subscription_currency, subscription_one_time_fee, currency, timezone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Switzerland', ?, ?, ?, ?,
              'standard', 29.00, 'EUR', 0.00, 'CHF', 'Europe/Zurich', 'pending')
      `,
      [
        ownerResult.insertId,
        String(shopName).trim(),
        companyPhone,
        normalizedEmail,
        address,
        String(streetName).trim(),
        String(buildingNumber).trim(),
        String(city).trim(),
        String(postalCode).trim(),
        cocNumber ? String(cocNumber).trim() : null,
        vatId ? String(vatId).trim() : null,
        instagramUsername ? String(instagramUsername).trim() : null,
        referralSource ? String(referralSource).trim() : null,
      ]
    );

    await connection.commit();
    transactionStarted = false;

    const user = {
      id: ownerResult.insertId,
      name: fullName,
      email: normalizedEmail,
      phone: privatePhone,
      role: "owner",
      status: "active",
    };
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration received. Your shop is pending activation.",
      data: {
        user,
        shop: {
          id: shopResult.insertId,
          name: String(shopName).trim(),
          country: "Switzerland",
          status: "pending",
          package: "standard",
          monthlyPrice: 29,
          currency: "EUR",
          oneTimeFee: 0,
        },
        token,
      },
    });
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Shop registration rollback error:", rollbackError.message);
      }
    }

    console.error("Shop registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// =====================================================
// GET SHOP PROFILE
// Owner / Manager / Receptionist / Barber
// =====================================================

const getShopProfile = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    const [shops] = await pool.query(
      `
      SELECT
        id,
        owner_id,
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        postal_code,
        canton,
        country,
        latitude,
        longitude,
        currency,
        timezone,
        tax_rate,
        status,
        created_at,
        updated_at
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    return res.json({
      success: true,
      data: {
        shop: shops[0],
      },
    });
  } catch (error) {
    console.error("Get shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop profile",
    });
  }
};


// =====================================================
// UPDATE SHOP PROFILE
// Owner / Manager
// =====================================================

const updateShopProfile = async (req, res) => {
  try {
    const shopId = req.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop context is required",
      });
    }

    const {
      name,
      description,
      phone,
      email,
      website,
      address,
      city,
      postalCode,
      canton,
      country,
      latitude,
      longitude,
      currency,
      timezone,
      taxRate,
    } = req.body;

    // ================================================
    // GET CURRENT SHOP
    // ================================================

    const [shops] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        postal_code,
        canton,
        country,
        latitude,
        longitude,
        currency,
        timezone,
        tax_rate
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    const currentShop = shops[0];

    // ================================================
    // VALIDATION
    // ================================================

    const updatedName =
      name !== undefined ? name.trim() : currentShop.name;

    if (!updatedName) {
      return res.status(400).json({
        success: false,
        message: "Shop name is required",
      });
    }

    // ================================================
    // PRESERVE EXISTING VALUES
    // ================================================

    const updatedDescription =
      description !== undefined
        ? description
        : currentShop.description;

    const updatedPhone =
      phone !== undefined
        ? phone
        : currentShop.phone;

    const updatedEmail =
      email !== undefined
        ? email
        : currentShop.email;

    const updatedWebsite =
      website !== undefined
        ? website
        : currentShop.website;

    const updatedAddress =
      address !== undefined
        ? address
        : currentShop.address;

    const updatedCity =
      city !== undefined
        ? city
        : currentShop.city;

    const updatedPostalCode =
      postalCode !== undefined
        ? postalCode
        : currentShop.postal_code;

    const updatedCanton =
      canton !== undefined
        ? canton
        : currentShop.canton;

    const updatedCountry =
      country !== undefined
        ? country
        : currentShop.country;

    const updatedLatitude =
      latitude !== undefined
        ? latitude
        : currentShop.latitude;

    const updatedLongitude =
      longitude !== undefined
        ? longitude
        : currentShop.longitude;

    const updatedCurrency =
      currency !== undefined
        ? currency
        : currentShop.currency;

    const updatedTimezone =
      timezone !== undefined
        ? timezone
        : currentShop.timezone;

    const updatedTaxRate =
      taxRate !== undefined
        ? taxRate
        : currentShop.tax_rate;

    // ================================================
    // UPDATE SHOP
    // ================================================

    await pool.query(
      `
      UPDATE barber_shops
      SET
        name = ?,
        description = ?,
        phone = ?,
        email = ?,
        website = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        canton = ?,
        country = ?,
        latitude = ?,
        longitude = ?,
        currency = ?,
        timezone = ?,
        tax_rate = ?
      WHERE id = ?
      `,
      [
        updatedName,
        updatedDescription,
        updatedPhone,
        updatedEmail,
        updatedWebsite,
        updatedAddress,
        updatedCity,
        updatedPostalCode,
        updatedCanton,
        updatedCountry,
        updatedLatitude,
        updatedLongitude,
        updatedCurrency,
        updatedTimezone,
        updatedTaxRate,
        shopId,
      ]
    );

    // ================================================
    // FETCH UPDATED SHOP
    // ================================================

    const [updatedShops] = await pool.query(
      `
      SELECT
        id,
        owner_id,
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        postal_code,
        canton,
        country,
        latitude,
        longitude,
        currency,
        timezone,
        tax_rate,
        status,
        created_at,
        updated_at
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    return res.json({
      success: true,
      message: "Shop profile updated successfully",
      data: {
        shop: updatedShops[0],
      },
    });
  } catch (error) {
    console.error("Update shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop profile",
    });
  }
};

const getAllShops = async (req, res) => {
  try {
    const [shops] = await pool.query(`
      SELECT
        bs.id,
        bs.owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        bs.name,
        bs.description,
        bs.phone,
        bs.email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.currency,
        bs.timezone,
        bs.tax_rate,
        bs.status,
        bs.created_at,
        bs.updated_at
      FROM barber_shops bs
      INNER JOIN users u
        ON u.id = bs.owner_id
      ORDER BY bs.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        shops,
      },
    });
  } catch (error) {
    console.error("Get all shops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber shops",
    });
  }
};
const getShopById = async (req, res) => {
  try {
    const shopId = Number(req.params.id);

    if (!shopId || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID",
      });
    }

    const [shops] = await pool.query(
      `
      SELECT
        bs.id,
        bs.owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.status AS owner_status,
        bs.name,
        bs.description,
        bs.phone,
        bs.email,
        bs.website,
        bs.address,
        bs.city,
        bs.postal_code,
        bs.canton,
        bs.country,
        bs.latitude,
        bs.longitude,
        bs.currency,
        bs.timezone,
        bs.tax_rate,
        bs.status,
        bs.created_at,
        bs.updated_at
      FROM barber_shops bs
      INNER JOIN users u
        ON u.id = bs.owner_id
      WHERE bs.id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        shop: shops[0],
      },
    });
  } catch (error) {
    console.error("Get shop by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber shop",
    });
  }
};

const updateShopStatus = async (req, res) => {
  try {
    const shopId = Number(req.params.id);
    const { status } = req.body;

    if (!shopId || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "active",
      "suspended",
      "inactive",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: pending, active, suspended, inactive",
      });
    }

    const [shops] = await pool.query(
      `
      SELECT id, status
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber shop not found",
      });
    }

    const previousStatus = shops[0].status;

    await pool.query(
      `
      UPDATE barber_shops
      SET status = ?
      WHERE id = ?
      `,
      [status, shopId]
    );

    const [updatedShops] = await pool.query(
      `
      SELECT
        id,
        owner_id,
        name,
        city,
        status,
        updated_at
      FROM barber_shops
      WHERE id = ?
      LIMIT 1
      `,
      [shopId]
    );

    return res.status(200).json({
      success: true,
      message: "Shop status updated successfully",
      data: {
        previous_status: previousStatus,
        shop: updatedShops[0],
      },
    });
  } catch (error) {
    console.error("Update shop status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop status",
    });
  }
};

module.exports = {
  createShop,
  registerShop,
  getShopProfile,
  updateShopProfile,
  getAllShops,
   getShopById,
   updateShopStatus,
};