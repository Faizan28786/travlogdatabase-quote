const mongoose = require("mongoose");

const LandServiceSchema = new mongoose.Schema({

    region: String,

    cities: [String],

    transfer: Array,

    privateTours: Array,

    sicTours: Array,

    localServices: Array,

    meals: Array

});

module.exports = mongoose.model(
    "LandService",
    LandServiceSchema
);