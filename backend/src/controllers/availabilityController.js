const { pool } = require("../config/db");

const getAvailableSlots = async (req, res) => {
  try {
    const {
      shopId,
      branchId,
      staffId,
      serviceId,
      date,
      slotInterval = 30,
    } = req.query;

    if (!shopId || !branchId || !staffId || !serviceId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "shopId, branchId, staffId, serviceId and date are required",
      });
    }

    // --------------------------------------------------
    // 1. Get service
    // --------------------------------------------------

    const [services] = await pool.query(
      `
      SELECT
        id,
        shop_id,
        name,
        duration_minutes,
        price,
        currency,
        status
      FROM services
      WHERE id = ?
      AND shop_id = ?
      LIMIT 1
      `,
      [serviceId, shopId]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];

    if (service.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Service is inactive",
      });
    }

    // --------------------------------------------------
    // 2. Verify branch belongs to shop
    // --------------------------------------------------

    const [branches] = await pool.query(
      `
      SELECT id, name, status
      FROM branches
      WHERE id = ?
      AND shop_id = ?
      LIMIT 1
      `,
      [branchId, shopId]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (branches[0].status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Branch is inactive",
      });
    }

    // --------------------------------------------------
    // 3. Verify staff belongs to shop + branch
    // --------------------------------------------------

    const [staffRows] = await pool.query(
      `
      SELECT
        id,
        shop_id,
        branch_id,
        display_name,
        status
      FROM staff
      WHERE id = ?
      AND shop_id = ?
      AND branch_id = ?
      LIMIT 1
      `,
      [staffId, shopId, branchId]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found for this branch",
      });
    }

    const staff = staffRows[0];

    if (staff.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Staff member is inactive",
      });
    }

    // --------------------------------------------------
    // 4. Verify staff can perform this service
    // --------------------------------------------------

    const [staffServices] = await pool.query(
      `
      SELECT 1
      FROM staff_services
      WHERE staff_id = ?
      AND service_id = ?
      LIMIT 1
      `,
      [staffId, serviceId]
    );

    if (staffServices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This service is not assigned to this staff member",
      });
    }

    // --------------------------------------------------
    // 5. Get day of week
    // --------------------------------------------------

    const requestedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const dayOfWeek = requestedDate.getDay();

    // --------------------------------------------------
    // 6. Get staff working hours
    // --------------------------------------------------

    const [workingHours] = await pool.query(
      `
      SELECT
        id,
        start_time,
        end_time,
        is_available
      FROM working_hours
      WHERE shop_id = ?
      AND branch_id = ?
      AND staff_id = ?
      AND day_of_week = ?
      AND is_available = 1
      ORDER BY start_time ASC
      `,
      [shopId, branchId, staffId, dayOfWeek]
    );

    if (workingHours.length === 0) {
      return res.json({
        success: true,
        data: {
          date,
          staffId: Number(staffId),
          serviceId: Number(serviceId),
          serviceDuration: service.duration_minutes,
          slots: [],
          message: "Staff is not available on this day",
        },
      });
    }

    // --------------------------------------------------
    // 7. Get existing appointments
    // --------------------------------------------------

    const [appointments] = await pool.query(
      `
      SELECT
        start_time,
        end_time,
        status
      FROM appointments
      WHERE shop_id = ?
      AND branch_id = ?
      AND staff_id = ?
      AND appointment_date = ?
      AND status IN ('pending', 'confirmed')
      ORDER BY start_time ASC
      `,
      [shopId, branchId, staffId, date]
    );

    // --------------------------------------------------
    // 8. Get blocked times
    // --------------------------------------------------

    const [blockedTimes] = await pool.query(
  `
  SELECT
    DATE_FORMAT(start_datetime, '%Y-%m-%d %H:%i:%s') AS start_datetime_local,
    DATE_FORMAT(end_datetime, '%Y-%m-%d %H:%i:%s') AS end_datetime_local
  FROM blocked_times
  WHERE shop_id = ?
  AND branch_id = ?
  AND staff_id = ?
  AND DATE(start_datetime) <= ?
  AND DATE(end_datetime) >= ?
  ORDER BY start_datetime ASC
  `,
  [shopId, branchId, staffId, date, date]
);

    // --------------------------------------------------
    // Helper: convert TIME to minutes
    // --------------------------------------------------

    const timeToMinutes = (timeValue) => {
      const timeString = String(timeValue).substring(0, 8);

      const [hours, minutes] = timeString
        .split(":")
        .map(Number);

      return hours * 60 + minutes;
    };

    // --------------------------------------------------
    // Helper: check overlap
    // --------------------------------------------------

    const overlaps = (
      startMinute,
      endMinute,
      blockedStart,
      blockedEnd
    ) => {
      return (
        startMinute < blockedEnd &&
        endMinute > blockedStart
      );
    };

    // --------------------------------------------------
    // Convert appointments to minutes
    // --------------------------------------------------

    const appointmentRanges = appointments.map((appointment) => ({
      start: timeToMinutes(appointment.start_time),
      end: timeToMinutes(appointment.end_time),
    }));

    // --------------------------------------------------
    // Convert blocked times to minutes
    // --------------------------------------------------

    const getDateTimeMinutes = (dateTimeValue) => {
  const value = String(dateTimeValue);

  const timePart = value.includes("T")
    ? value.split("T")[1]
    : value.split(" ")[1];

  if (!timePart) {
    return null;
  }

  const [hours, minutes] = timePart
    .substring(0, 8)
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const blockedRanges = blockedTimes
  .map((blocked) => {
    const startValue = String(blocked.start_datetime_local);
    const endValue = String(blocked.end_datetime_local);

    const startDate = startValue.substring(0, 10);
    const endDate = endValue.substring(0, 10);

    let startMinutes = timeToMinutes(
      startValue.substring(11, 19)
    );

    let endMinutes = timeToMinutes(
      endValue.substring(11, 19)
    );

    if (startDate < date) {
      startMinutes = 0;
    }

    if (endDate > date) {
      endMinutes = 24 * 60;
    }

    return {
      start: startMinutes,
      end: endMinutes,
    };
  });

    // --------------------------------------------------
    // 9. Generate slots
    // --------------------------------------------------

    const interval = Math.max(Number(slotInterval) || 30, 5);
    const duration = Number(service.duration_minutes);

    const slots = [];

    for (const workingHour of workingHours) {
      const workStart = timeToMinutes(
        workingHour.start_time
      );

      const workEnd = timeToMinutes(
        workingHour.end_time
      );

      for (
        let startMinute = workStart;
        startMinute + duration <= workEnd;
        startMinute += interval
      ) {
        const endMinute = startMinute + duration;

        const appointmentConflict = appointmentRanges.some(
          (appointment) =>
            overlaps(
              startMinute,
              endMinute,
              appointment.start,
              appointment.end
            )
        );

        if (appointmentConflict) {
          continue;
        }

        const blockedConflict = blockedRanges.some(
          (blocked) =>
            overlaps(
              startMinute,
              endMinute,
              blocked.start,
              blocked.end
            )
        );

        if (blockedConflict) {
          continue;
        }

        const formatTime = (minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          return `${String(hours).padStart(2, "0")}:${String(
            mins
          ).padStart(2, "0")}`;
        };

        slots.push({
          startTime: formatTime(startMinute),
          endTime: formatTime(endMinute),
        });
      }
    }

    return res.json({
      success: true,
      data: {
        date,
        staff: {
          id: staff.id,
          name: staff.display_name,
        },
        service: {
          id: service.id,
          name: service.name,
          durationMinutes: service.duration_minutes,
          price: service.price,
          currency: service.currency,
        },
        slots,
      },
    });
  } catch (error) {
    console.error("Get available slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate available slots",
    });
  }
};

module.exports = {
  getAvailableSlots,
};