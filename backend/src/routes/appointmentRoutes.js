const express = require("express");

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  getCalendarAppointments,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const shopAccessMiddleware = require("../middleware/shopAccessMiddleware");

const router = express.Router();

/*
 * Public booking
 */
router.post("/", createAppointment);


/*
 * Protected appointment routes
 */
router.get(
  "/",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getAppointments
);


/*
 * Calendar
 */
router.get(
  "/calendar",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getCalendarAppointments
);


/*
 * Appointment details
 */
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  getAppointmentById
);


/*
 * Update appointment status
 */
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  updateAppointmentStatus
);

router.patch(
  "/:id/reschedule",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist"
  ),
  shopAccessMiddleware,
  rescheduleAppointment
);


/*
 * Reschedule appointment
 */
router.put(
  "/:id/reschedule",
  authMiddleware,
  authorizeRoles(
    "super_admin",
    "owner",
    "manager",
    "receptionist",
    "barber"
  ),
  shopAccessMiddleware,
  rescheduleAppointment
);


module.exports = router;