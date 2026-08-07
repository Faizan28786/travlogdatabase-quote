const express = require("express");
const router = express.Router();

console.log("MASTER DATA ROUTE FILE LOADED");

const Hotel = require("../models/Hotel");
const LandService = require("../models/LandService");

/* =====================================================
   GET ALL HOTELS
===================================================== */

router.get("/hotels", async (req, res) => {

    try {

        const hotels = await Hotel.find({
            isActive: true
        })
            .sort({
                region: 1,
                city: 1,
                hotelName: 1,
                category: 1,
                roomType: 1
            })
            .lean();

        return res.json({
            success: true,
            data: hotels
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


/* =====================================================
   GET ALL LAND SERVICES
===================================================== */

router.get("/land-services", async (req, res) => {

    try {

        const services = await LandService.find().sort({
            city: 1
        });

        return res.json({
            success: true,
            data: services
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;