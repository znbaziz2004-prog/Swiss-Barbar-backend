const { pool } = require("../config/db");

/**
 * GET /api/settings
 * Super Admin only
 */
const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT setting_key, setting_value
      FROM system_settings
      ORDER BY setting_key ASC
    `);

    const settings = {};

    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

/**
 * PUT /api/settings
 * Super Admin only
 */
const saveSettings = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const settings = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Settings data is required",
      });
    }

    await connection.beginTransaction();

    for (const [key, value] of Object.entries(settings)) {
      const settingValue =
        typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? "");

      await connection.query(
        `
        INSERT INTO system_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value)
        `,
        [key, settingValue]
      );
    }

    await connection.commit();

    const [rows] = await connection.query(`
      SELECT setting_key, setting_value
      FROM system_settings
      ORDER BY setting_key ASC
    `);

    const updatedSettings = {};

    rows.forEach((row) => {
      updatedSettings[row.setting_key] = row.setting_value;
    });

    res.json({
      success: true,
      message: "Settings saved successfully",
      data: updatedSettings,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Save settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save settings",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getSettings,
  saveSettings,
};