const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= GET STAFF =================
exports.getStaff = async (req, res) => {
    try {

        const staff = await User.find({
            role: "staff"
        })
            .select("_id name email company active lastLogin createdAt")
            .sort({
                name: 1
            })
            .lean();

        return res.json({
            success: true,
            staff
        });

    } catch (error) {

        console.error("Get staff error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff"
        });

    }
};
// ================= CHANGE STAFF PASSWORD =================
exports.changeStaffPassword = async (req, res) => {
    try {

        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password is required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const staff = await User.findOne({
            _id: id,
            role: "staff"
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        staff.password = hashedPassword;

        await staff.save();

        return res.json({
            success: true,
            message: "Staff password changed successfully"
        });

    } catch (error) {

        console.error("Change staff password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to change staff password"
        });

    }
};