
const mongoose = require("mongoose");

const destinationMarginSchema = new mongoose.Schema(
    {
        destination: {
            type: String,
            required: true,
            trim: true
        },
        currency: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        marginPerPerson: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        marginType: {
            type: String,
            enum: ["perPerson", "perNight"],
            default: "perPerson"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { _id: false }
);

const settingsSchema = new mongoose.Schema(
    {
        universalMargin: {
            type: Number,
            default: 15
        },
        destinationMargins: {
            type: [destinationMarginSchema],
            default: [
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
            ]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Settings", settingsSchema);
