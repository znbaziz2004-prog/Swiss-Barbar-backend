const { pool } = require("../config/db");

const shopAccessMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user.id;
    const role = req.user.role;

    /*
     * Super Admin
     *
     * Super admin can access all shops.
     */
    if (role === "super_admin") {
      req.shopId = req.query.shopId
        ? Number(req.query.shopId)
        : null;

      return next();
    }

    /*
     * Owner
     *
     * Owner can access the shop where
     * barber_shops.owner_id = logged-in user ID.
     */
    if (role === "owner") {
      const [shops] = await pool.query(
  `
  SELECT id, status
  FROM barber_shops
  WHERE owner_id = ?
  LIMIT 1
  `,
  [userId]
);

      if (shops.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No barber shop assigned to this account",
        });
      }

      const ownerShopId = shops[0].id;
      if (shops[0].status !== "active") {
  return res.status(403).json({
    success: false,
    message: `Your barber shop is currently ${shops[0].status}`,
  });
}

      /*
       * If shopId is supplied in request,
       * verify that it belongs to this owner.
       */
      if (
        req.query.shopId &&
        Number(req.query.shopId) !== ownerShopId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this barber shop",
        });
      }

      req.shopId = ownerShopId;

      return next();
    }

    /*
     * Manager / Receptionist / Barber
     *
     * Their shop is resolved through staff.
     */
    if (
      role === "manager" ||
      role === "receptionist" ||
      role === "barber"
    ) {
      const [staffMembers] = await pool.query(
        `
        SELECT
  s.id,
  s.shop_id,
  s.branch_id,
  s.status,
  bs.status AS shop_status
FROM staff s
INNER JOIN barber_shops bs
  ON bs.id = s.shop_id
WHERE s.user_id = ?
LIMIT 1
        `,
        [userId]
      );

      if (staffMembers.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "No staff profile is assigned to this account",
        });
      }

      const staff = staffMembers[0];

      if (staff.status !== "active") {
  return res.status(403).json({
    success: false,
    message: "Your staff account is not active",
  });
}

if (staff.shop_status !== "active") {
  return res.status(403).json({
    success: false,
    message: `Your barber shop is currently ${staff.shop_status}`,
  });
}

      /*
       * Verify requested shop.
       */
      if (
        req.query.shopId &&
        Number(req.query.shopId) !== staff.shop_id
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this barber shop",
        });
      }

      req.shopId = staff.shop_id;
      req.staffId = staff.id;
      req.branchId = staff.branch_id;

      return next();
    }

    /*
     * Unknown role
     */
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access shops",
    });
  } catch (error) {
    console.error(
      "Shop access middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify shop access",
    });
  }
};

module.exports = shopAccessMiddleware;