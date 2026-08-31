const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      default: "",
      trim: true
    },

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

    // Optional custom display name
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

    // Room details are stored WITH the hotel.
    // No separate Room collection is required.
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

    // Main room rate
    // Existing calculation uses this field.
    rate2D1N: {
      type: Number,
      default: 0,
      min: 0
    },

    // Optional 3D2N package rate
    rate3D2N: {
      type: Number,
      default: 0,
      min: 0
    },

    // Extra Person / Extra Adult / Child With Bed rate
    // KEEPING FIELD NAME "extraBed" so existing
    // calculation functionality does not break.
    extraBed: {
      type: Number,
      default: 0,
      min: 0
    },

    // Child No Bed rate
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

    // Hotel is active by default
    isActive: {
      type: Boolean,
      default: true
    },

    // Internal values:
    // perRoom   = room based costing
    // perPerson = per pax costing
    pricingUnit: {
      type: String,
      enum: ["perRoom", "perNight"],
      default: "perRoom"
    }
  },
  {
    timestamps: true
  }
);


// Existing indexes — KEEPING them
hotelSchema.index({
  destination: 1,
  city: 1,
  isActive: 1
});

hotelSchema.index({
  city: 1,
  hotelName: 1,
  isActive: 1
});

hotelSchema.index({
  hotelName: 1,
  roomType: 1,
  mealPlan: 1,
  isActive: 1
});


module.exports = mongoose.model("Hotel", hotelSchema);