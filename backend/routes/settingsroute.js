
const express = require("express");
const router = express.Router();
const Settings = require("../models/settings");

const DEFAULT_DESTINATION_MARGINS = [
    {
        destination: "India",
        currency: "INR",
        marginPerPerson: 200,
        marginType: "perNight",
        isActive: true
    },
    {
        destination: "Vietnam",
        currency: "USD",
        marginPerPerson: 15,
        marginType: "perPerson",
        isActive: true
    }
];

router.get("/", async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                universalMargin: 15,
                destinationMargins: DEFAULT_DESTINATION_MARGINS
            });
        } else if (!settings.destinationMargins || settings.destinationMargins.length === 0) {
            settings.destinationMargins = DEFAULT_DESTINATION_MARGINS;
            await settings.save();
        }

        return res.json({
            success: true,
            settings: settings.toObject()
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

router.put("/", async (req, res) => {
    try {
        const body = req.body || {};
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({
                universalMargin: 15,
                destinationMargins: DEFAULT_DESTINATION_MARGINS
            });
        }

        if (Object.prototype.hasOwnProperty.call(body, "universalMargin")) {
            const margin = Number(body.universalMargin);

            if (!Number.isFinite(margin) || margin < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Universal margin must be a valid non-negative number."
                });
            }

            settings.universalMargin = margin;
        }

        if (Object.prototype.hasOwnProperty.call(body, "destinationMargins")) {
            if (!Array.isArray(body.destinationMargins)) {
                return res.status(400).json({
                    success: false,
                    message: "destinationMargins must be an array."
                });
            }

            const normalizedMargins = [];
            const seenDestinations = new Set();

            for (const item of body.destinationMargins) {
                const destination = String(item.destination || "").trim();
                const currency = String(item.currency || "").trim().toUpperCase();
                const marginPerPerson = Number(item.marginPerPerson);
                const marginType = item.marginType || "perPerson";

                if (!destination || !/^[A-Z]{3}$/.test(currency)) {
                    return res.status(400).json({
                        success: false,
                        message: "Each margin requires a destination and a valid three-letter currency code."
                    });
                }

                if (!Number.isFinite(marginPerPerson) || marginPerPerson < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Each margin must be a valid non-negative number."
                    });
                }

                if (!["perPerson", "perNight"].includes(marginType)) {
                    return res.status(400).json({
                        success: false,
                        message: "marginType must be perPerson or perNight."
                    });
                }

                const destinationKey = destination.toLowerCase();

                if (seenDestinations.has(destinationKey)) {
                    return res.status(400).json({
                        success: false,
                        message: "Duplicate destination: " + destination
                    });
                }

                seenDestinations.add(destinationKey);

                normalizedMargins.push({
                    destination,
                    currency,
                    marginPerPerson,
                    marginType,
                    isActive: item.isActive !== false
                });
            }

            settings.destinationMargins = normalizedMargins;
        }

        await settings.save();

        return res.json({
            success: true,
            message: "Settings updated successfully",
            settings: settings.toObject()
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
