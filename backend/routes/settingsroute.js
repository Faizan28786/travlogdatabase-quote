const express = require("express");
const router = express.Router();
const Settings = require("../models/settings");

/* =========================================================
   GET SETTINGS
   GET /api/settings
========================================================= */

router.get("/", async (req, res) => {

    try {

        let settings = await Settings.findOne().lean();

        if (!settings) {

            settings = await Settings.create({
                universalMargin: 0
            });

        }

        return res.json({
            success: true,
            settings
        });

    } catch (error) {

        console.error("GET /api/settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch settings",
            error: error.message
        });

    }

});


/* =========================================================
   UPDATE SETTINGS
   PUT /api/settings
========================================================= */

router.put("/", async (req, res) => {

    try {

        const universalMargin = Math.max(
            0,
            Number(req.body?.universalMargin) || 0
        );

        const settings =
            await Settings.findOneAndUpdate(
                {},
                {
                    universalMargin
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            ).lean();

        return res.json({

            success: true,

            message: "Settings updated successfully",

            settings

        });

    } catch (error) {

        console.error("PUT /api/settings error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to update settings",

            error: error.message

        });

    }

});


module.exports = router;