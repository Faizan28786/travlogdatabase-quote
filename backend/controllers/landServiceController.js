const LandService = require("../models/LandService");

exports.getLandServices = async (req, res) => {

    try {

        const city = req.query.city;

        if (!city) {

            return res.json([]);

        }

        const data = await LandService.findOne({

            cities: { $regex: new RegExp("^" + city + "$", "i") }

        });

        if (!data) {

            return res.json([]);

        }

        res.json(data);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: err.message

        });

    }

};