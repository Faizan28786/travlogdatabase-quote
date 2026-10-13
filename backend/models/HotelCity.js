const mongoose = require("mongoose");

const hotelCitySchema = new mongoose.Schema(
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
        city: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

hotelCitySchema.index(
    { destination: 1, region: 1, city: 1 },
    { unique: true }
);

module.exports = mongoose.model("HotelCity", hotelCitySchema);