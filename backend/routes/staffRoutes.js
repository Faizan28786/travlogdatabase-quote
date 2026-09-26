const express = require("express");

const router = express.Router();

const staffController = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// SUPERADMIN ONLY
router.get(
    "/",
    authMiddleware,
    roleMiddleware("superadmin"),
    staffController.getStaff
);
router.put(
    "/:id/password",
    authMiddleware,
    roleMiddleware("superadmin"),
    staffController.changeStaffPassword
);

module.exports = router;