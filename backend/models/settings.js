const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        universalMargin: {
            type: Number,
            default: 15
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Settings", settingsSchema);