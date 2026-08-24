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
exports.createLandService = async (req, res) => {
    try {

        const service = await LandService.create(req.body);

        res.status(201).json({
            success: true,
            data: service
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};


exports.updateLandService = async (req, res) => {
    try {

        const service = await LandService.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Land service not found"
            });
        }

        res.json({
            success: true,
            data: service
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};


exports.deleteLandService = async (req, res) => {
    try {

        const service = await LandService.findByIdAndDelete(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Land service not found"
            });
        }

        res.json({
            success: true,
            message: "Land service deleted successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};