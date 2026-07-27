const mongoose = require("mongoose");

const quoteSegmentSchema = new mongoose.Schema(
  {
    segmentNo: { type: Number, default: 1 },
    city: { type: String, default: "" },
    mealPlan: { type: String, default: "CP" },

    hotelId: { type: String, default: "" },
    hotelName: { type: String, default: "" },
    roomType: { type: String, default: "" },

    nights: { type: Number, default: 0 },
    rooms: { type: Number, default: 0 },

    baseHotelCost: { type: Number, default: 0 },
    childCharges: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    rateUnavailable: { type: Boolean, default: false }
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    quoteNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    country: {
      type: String,
      default: ""
    },

    travelDate: {
      type: String,
      default: ""
    },

    adults: {
      type: Number,
      default: 0
    },

    childWithBed: {
      type: Number,
      default: 0
    },

    childWithoutBed: {
      type: Number,
      default: 0
    },

    childWithBedAge: {
      type: String,
      default: ""
    },

    childWithoutBedAge: {
      type: String,
      default: ""
    },

    totalPax: {
      type: Number,
      default: 0
    },

    segments: {
      type: [quoteSegmentSchema],
      default: []
    },

    pickupVehicleId: {
      type: String,
      default: ""
    },

    pickupVehicleName: {
      type: String,
      default: ""
    },

    dropVehicleId: {
      type: String,
      default: ""
    },

    dropVehicleName: {
      type: String,
      default: ""
    },

    hotelCost: {
      type: Number,
      default: 0
    },

    transferCost: {
      type: Number,
      default: 0
    },

    grandTotal: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Quote", quoteSchema);