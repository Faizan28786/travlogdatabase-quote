const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    hotelName: {
      type: String,
      required: true,
      trim: true
    },

    // Frontend dropdown me agar custom display name chahiye
    displayName: {
      type: String,
      default: "",
      trim: true
    },

    category: {
      type: String,
      default: "",
      trim: true
    },

    roomType: {
      type: String,
      required: true,
      trim: true
    },

    mealPlan: {
      type: String,
      default: "CP",
      trim: true
    },

    // Main room rate (2D1N = 1 night rate)
    rate2D1N: {
      type: Number,
      default: 0,
      min: 0
    },

    // Optional 3D2N package rate (2 nights equivalent)
    rate3D2N: {
      type: Number,
      default: 0,
      min: 0
    },

    // Extra bed / child with bed / extra adult rate
    extraBed: {
      type: Number,
      default: 0,
      min: 0
    },

    // Numeric child no bed rate
    childNoBed: {
      type: Number,
      default: 0,
      min: 0
    },

    note: {
      type: String,
      default: "",
      trim: true
    },

    currency: {
      type: String,
      default: "USD",
      trim: true
    },
    isActive: {
  type: Boolean,
  default: true
},
    // IMPORTANT:
    // "perRoom" = room based hotel
    // "perPerson" = cruise / per pax costing
    pricingUnit: {
      type: String,
      enum: ["perRoom", "perPerson"],
      default: "perRoom"
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

hotelSchema.index({ destination: 1, city: 1, isActive: 1 });
hotelSchema.index({ city: 1, hotelName: 1, isActive: 1 });
hotelSchema.index({ hotelName: 1, roomType: 1, mealPlan: 1, isActive: 1 });

module.exports = mongoose.model("Hotel", hotelSchema);