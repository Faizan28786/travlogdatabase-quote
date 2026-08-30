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

        const {
            type,
            serviceName,
            oldServiceName,
            vehicle,
            pax,
            oldPax,
            price
        } = req.body;

        console.log("UPDATE LAND SERVICE REQUEST:", {
            id: req.params.id,
            type,
            serviceName,
            oldServiceName,
            vehicle,
            pax,
            oldPax,
            price
        });

        const fieldMap = {
            "Transfer": "transfer",
            "Private Tour": "privateTours",
            "SIC Tour": "sicTours",
            "Local Service": "localServices",
            "Meal": "meals"
        };

        const field = fieldMap[type];

        if (!field) {

            return res.status(400).json({
                success: false,
                message: "Invalid land service type"
            });

        }

        // Find parent LandService document
        const landService = await LandService.findById(req.params.id);

        if (!landService) {

            return res.status(404).json({
                success: false,
                message: "Land service document not found"
            });

        }

        // Find service inside nested array
        const services = landService[field] || [];

        const serviceIndex = services.findIndex(
            item => String(item.name).trim() === String(oldServiceName).trim()
        );

        if (serviceIndex === -1) {

            console.log("SERVICE NOT FOUND:", {
                field,
                oldServiceName,
                availableServices: services.map(x => x.name)
            });

            return res.status(404).json({
                success: false,
                message: "Service not found"
            });

        }

        const service = services[serviceIndex];

        console.log("SERVICE FOUND:", service);

        // ==========================================
        // UPDATE SERVICE NAME
        // ==========================================

        if (serviceName !== undefined) {

            service.name = String(serviceName).trim();

        }

        // ==========================================
        // UPDATE VEHICLE
        // ==========================================

        if (vehicle !== undefined) {

            service.vehicle = String(vehicle).trim();

        }

        // ==========================================
        // UPDATE RATES
        // ==========================================

        if (
            service.rates &&
            pax !== undefined &&
            pax !== null &&
            pax !== ""
        ) {

            const newPax = String(pax);
            const targetPax = oldPax
                ? String(oldPax)
                : newPax;

            // If pax itself changed
            if (
                oldPax &&
                String(oldPax) !== newPax
            ) {

                delete service.rates[String(oldPax)];

            }

            service.rates[newPax] = Number(price) || 0;

        }

        // ==========================================
        // SIMPLE PRICE SERVICE
        // ==========================================

        else if (
            price !== undefined &&
            service.price !== undefined
        ) {

            service.price = Number(price) || 0;

        }

        // IMPORTANT
        landService.markModified(field);

        await landService.save();

        console.log(
            "LAND SERVICE SAVED:",
            landService[field][serviceIndex]
        );

        return res.json({

            success: true,

            message: "Land service updated successfully",

            data: landService

        });

    } catch (err) {

        console.error(
            "UPDATE LAND SERVICE ERROR:",
            err
        );

        return res.status(500).json({

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