const express = require("express");
const router = express.Router();
const Quote = require("../models/Quote");

/* =========================================================
   TEST ROUTE
========================================================= */
router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "quoteData route working"
  });
});

/* =========================================================
   MASTER QUOTE DATA
========================================================= */
const quoteMaster = {
  Thailand: {
    vehicles: [
      { id: "veh-th-pvt", name: "Private Car", price: 2500 },
      { id: "veh-th-sic", name: "SIC Transfer", price: 1200 },
      { id: "veh-th-van", name: "Private Van", price: 4000 }
    ]
  },

  Vietnam: {
    vehicles: [
      { id: "veh-vn-pvt", name: "Private Car", price: 2200 },
      { id: "veh-vn-sic", name: "SIC Transfer", price: 1100 },
      { id: "veh-vn-van", name: "Private Van", price: 3800 }
    ]
  }
};

/* =========================================================
   GET MASTER DATA
   GET /api/quote-data/master/:country
========================================================= */
router.get("/master/:country", (req, res) => {
  try {
    const country = req.params.country;
    const data = quoteMaster[country];

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Country data not found"
      });
    }

    return res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    console.log("MASTER DATA ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load master data",
      error: error.message
    });
  }
});

/* =========================================================
   SAVE QUOTE
   POST /api/quote-data/save
========================================================= */
router.post("/save", async (req, res) => {
  try {
    const {
      quoteNo,
      country,
      travelDate,

      adults,
      childWithBed,
      childWithoutBed,
      childWithBedAge,
      childWithoutBedAge,
      totalPax,

      segments = [],

      pickupVehicleId,
      pickupVehicleName,
      dropVehicleId,
      dropVehicleName,

      hotelCost,
      transferCost,
      grandTotal
    } = req.body || {};

    if (!quoteNo) {
      return res.status(400).json({
        success: false,
        message: "Quote No is required"
      });
    }

    const normalizedSegments = Array.isArray(segments)
      ? segments.map((seg, index) => ({
          segmentNo: Number(seg.segmentNo) || index + 1,
          city: seg.city || "",
          mealPlan: seg.mealPlan || "CP",
          hotelId: seg.hotelId || "",
          hotelName: seg.hotelName || "",
          roomType: seg.roomType || "",
          nights: Number(seg.nights) || 0,
          rooms: Number(seg.rooms) || 0,
          baseHotelCost: Number(seg.baseHotelCost) || 0,
          childCharges: Number(seg.childCharges) || 0,
          total: Number(seg.total) || 0,
          rateUnavailable: Boolean(seg.rateUnavailable)
        }))
      : [];

    const savedQuote = await Quote.findOneAndUpdate(
      { quoteNo },
      {
        quoteNo,
        country: country || "",
        travelDate: travelDate || "",

        adults: Number(adults) || 0,
        childWithBed: Number(childWithBed) || 0,
        childWithoutBed: Number(childWithoutBed) || 0,
        childWithBedAge: childWithBedAge || "",
        childWithoutBedAge: childWithoutBedAge || "",
        totalPax: Number(totalPax) || 0,

        segments: normalizedSegments,

        pickupVehicleId: pickupVehicleId || "",
        pickupVehicleName: pickupVehicleName || "",
        dropVehicleId: dropVehicleId || "",
        dropVehicleName: dropVehicleName || "",

        hotelCost: Number(hotelCost) || 0,
        transferCost: Number(transferCost) || 0,
        grandTotal: Number(grandTotal) || 0
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Quote saved successfully",
      quote: savedQuote
    });
  } catch (error) {
    console.log("SAVE QUOTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save quote",
      error: error.message
    });
  }
});

/* =========================================================
   GET ALL QUOTES
   GET /api/quote-data/all
========================================================= */
router.get("/all", async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quotes
    });
  } catch (error) {
    console.log("GET ALL QUOTES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotes"
    });
  }
});

/* =========================================================
   GET SINGLE QUOTE
   GET /api/quote-data/:quoteNo
========================================================= */
router.get("/:quoteNo", async (req, res) => {
  try {
    const quote = await Quote.findOne({ quoteNo: req.params.quoteNo });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found"
      });
    }

    return res.status(200).json({
      success: true,
      quote
    });
  } catch (error) {
    console.log("GET QUOTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quote",
      error: error.message
    });
  }
});

/* =========================================================
   DELETE QUOTE
   DELETE /api/quote-data/delete-quote/:id
========================================================= */
router.delete("/delete-quote/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;

    const deletedQuote = await Quote.findByIdAndDelete(quoteId);

    if (!deletedQuote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quote deleted successfully"
    });
  } catch (error) {
    console.log("DELETE QUOTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete quote",
      error: error.message
    });
  }
});

module.exports = router;