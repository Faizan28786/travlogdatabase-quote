
const mongoose = require("mongoose");

const hotelRegionSchema = new mongoose.Schema(
    {
        destination: {
            type: String,
            required: true,
            trim: true
        },
        region: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

hotelRegionSchema.index(
    { destination: 1, region: 1 },
    { unique: true }
);

module.exports = mongoose.model("HotelRegion", hotelRegionSchema);
