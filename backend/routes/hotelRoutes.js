const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");

/* =========================================================
   HELPERS
========================================================= */
function normalizeCityInput(city = "") {
  const map = {
    saigon: "Ho Chi Minh City",
    "ho chi minh": "Ho Chi Minh City",
    hochiminh: "Ho Chi Minh City",
    "ho chi minh city": "Ho Chi Minh City",
    phuquoc: "Phu Quoc",
    "phu quoc": "Phu Quoc",
    halong: "Halong Bay",
    "halong bay": "Halong Bay",
    danang: "Danang",
    "da nang": "Danang",
    hanoi: "Hanoi",
    sapa: "Sapa",
    hoian: "Hoi An",
    "hoi an": "Hoi An"
  };

  const key = String(city).trim().toLowerCase();
  return map[key] || city;
}

/**
 * Some old hotel docs may not have isActive field.
 * So active filter should include:
 * - isActive: true
 * - OR field missing
 */
function getActiveFilter() {
  return {
    $or: [{ isActive: true }, { isActive: { $exists: false } }]
  };
}

function getDisplayName(hotel) {
  const hotelName = hotel.hotelName || "";
  const category = hotel.category ? ` (${hotel.category})` : "";
  return `${hotelName}${category}`;
}

/* =========================================================
   0) GET ALL HOTELS
   /api/hotels
   /api/hotels?destination=Vietnam
========================================================= */
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find({}).lean();
    return res.json(hotels);
  } catch (error) {
    console.error("GET /api/hotels error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotels"
    });
  }
});

/* =========================================================
   1) GET ALL CITIES FOR DESTINATION
   /api/hotels/cities?destination=Vietnam
========================================================= */
router.get("/cities", async (req, res) => {
  try {
    const destination = req.query.destination || "Vietnam";

    const cities = await Hotel.distinct("city", {
      destination,
      ...getActiveFilter()
    });

    const cityOrder = [
      "Hanoi",
      "Halong Bay",
      "Sapa",
      "Danang",
      "Hoi An",
      "Ho Chi Minh City",
      "Phu Quoc"
    ];

    const orderedCities = [
      ...cityOrder.filter((c) => cities.includes(c)),
      ...cities.filter((c) => !cityOrder.includes(c)).sort((a, b) => a.localeCompare(b))
    ];

    return res.json({
      success: true,
      cities: orderedCities
    });
  } catch (error) {
    console.error("GET /cities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities"
    });
  }
});

/* =========================================================
   2) GET HOTELS BY CITY
   /api/hotels/by-city?destination=Vietnam&city=Danang
========================================================= */
router.get("/by-city", async (req, res) => {
  try {
    const destination = req.query.destination || "Vietnam";
    const rawCity = req.query.city || "";
    const city = normalizeCityInput(rawCity);

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "city is required"
      });
    }

    const hotels = await Hotel.aggregate([
      {
        $match: {
          destination,
          city,
          ...getActiveFilter()
        }
      },
      {
        $group: {
          _id: "$hotelName",
          hotelName: { $first: "$hotelName" },
          category: { $first: "$category" },
          city: { $first: "$city" }
        }
      },
      {
        $project: {
          _id: 0,
          hotelName: 1,
          category: 1,
          city: 1,
          displayName: {
            $cond: [
              { $gt: [{ $strLenCP: { $ifNull: ["$category", ""] } }, 0] },
              { $concat: ["$hotelName", " (", "$category", ")"] },
              "$hotelName"
            ]
          }
        }
      },
      {
        $sort: {
          hotelName: 1
        }
      }
    ]);

    return res.json({
      success: true,
      city,
      hotels
    });
  } catch (error) {
    console.error("GET /by-city error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotels"
    });
  }
});

/* =========================================================
   3) GET ROOM TYPES BY HOTEL + CITY
   /api/hotels/room-types?destination=Vietnam&city=Danang&hotelName=ALANI HOTEL
========================================================= */
router.get("/room-types", async (req, res) => {
  try {
    const destination = req.query.destination || "Vietnam";
    const rawCity = req.query.city || "";
    const city = normalizeCityInput(rawCity);
    const hotelName = req.query.hotelName || "";

    if (!city || !hotelName) {
      return res.status(400).json({
        success: false,
        message: "city and hotelName are required"
      });
    }

    const roomTypes = await Hotel.find({
      destination,
      city,
      hotelName,
      ...getActiveFilter()
    })
      .select(
        "_id destination city hotelName category roomType mealPlan rate2D1N rate3D2N extraBed childNoBed note currency pricingUnit"
      )
      .sort({ rate2D1N: 1, roomType: 1 })
      .lean();

    const formattedRoomTypes = roomTypes.map((room) => ({
      ...room,
      displayName: getDisplayName(room)
    }));

    return res.json({
      success: true,
      city,
      hotelName,
      roomTypes: formattedRoomTypes
    });
  } catch (error) {
    console.error("GET /room-types error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room types"
    });
  }
});

/* =========================================================
   4) CALCULATE SEGMENT
   POST /api/hotels/calculate
========================================================= */
router.post("/calculate", async (req, res) => {
  try {
    const {
      destination = "Vietnam",
      city,
      hotelName,
      roomType,
      mealPlan = "CP",
      nights = 1,
      rooms = 1,
      adults = 2,
      childWithBed = 0,
      childNoBed = 0
    } = req.body || {};

    if (!city || !hotelName || !roomType) {
      return res.status(400).json({
        success: false,
        message: "city, hotelName and roomType are required"
      });
    }

    const normalizedCity = normalizeCityInput(city);

    // Try exact match with mealPlan first
    let hotel = await Hotel.findOne({
      destination,
      city: normalizedCity,
      hotelName,
      roomType,
      mealPlan,
      ...getActiveFilter()
    }).lean();

    // fallback: if exact mealPlan not found, ignore mealPlan
    if (!hotel) {
      hotel = await Hotel.findOne({
        destination,
        city: normalizedCity,
        hotelName,
        roomType,
        ...getActiveFilter()
      }).lean();
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel room not found"
      });
    }

    const totalNights = Math.max(1, Number(nights) || 1);
    const totalRooms = Math.max(1, Number(rooms) || 1);
    const totalAdults = Math.max(0, Number(adults) || 0);
    const totalCWB = Math.max(0, Number(childWithBed) || 0);
    const totalCNB = Math.max(0, Number(childNoBed) || 0);

    const roomRate = Number(hotel.rate2D1N) || 0;
    const extraBedRate = Number(hotel.extraBed) || 0;
    const childNoBedRate = Number(hotel.childNoBed) || 0;

    // base room includes up to 2 adults per room
    const includedAdults = totalRooms * 2;
    const extraAdultCount = Math.max(0, totalAdults - includedAdults);

    const baseHotelCost = roomRate * totalRooms * totalNights;
    const extraAdultCost = extraAdultCount * extraBedRate * totalNights;
    const childWithBedCost = totalCWB * extraBedRate * totalNights;
    const childNoBedCost = totalCNB * childNoBedRate * totalNights;

    const childCharges = childWithBedCost + childNoBedCost;
    const total = baseHotelCost + extraAdultCost + childCharges;

    return res.json({
      success: true,
      hotel: {
        _id: hotel._id,
        destination: hotel.destination,
        city: hotel.city,
        hotelName: hotel.hotelName,
        roomType: hotel.roomType,
        mealPlan: hotel.mealPlan,
        category: hotel.category,
        currency: hotel.currency,
        displayName: getDisplayName(hotel)
      },
      calculation: {
        roomRate,
        extraBedRate,
        childNoBedRate,
        nights: totalNights,
        rooms: totalRooms,
        adults: totalAdults,
        childWithBed: totalCWB,
        childNoBed: totalCNB,
        includedAdults,
        extraAdultCount,
        baseHotelCost,
        extraAdultCost,
        childWithBedCost,
        childNoBedCost,
        childCharges,
        total
      }
    });
  } catch (error) {
    console.error("POST /calculate error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate hotel segment"
    });
  }
});

module.exports = router;