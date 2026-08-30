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

  return map[key] || city.trim();
}


function getActiveFilter() {
  return {
    $or: [
      { isActive: true },
      { isActive: { $exists: false } }
    ]
  };
}


function getDisplayName(hotel) {

  const hotelName = hotel.hotelName || "";

  const category = hotel.category
    ? ` (${hotel.category})`
    : "";

  return `${hotelName}${category}`;
}


/* =========================================================
   1. GET ALL HOTELS
   GET /api/hotels
========================================================= */

router.get("/", async (req, res) => {

  try {

    const destination =
      req.query.destination || "Vietnam";

    const hotels = await Hotel.find({
      destination,
      ...getActiveFilter()
    })
      .sort({
        region: 1,
        city: 1,
        hotelName: 1,
        roomType: 1
      })
      .lean();

    return res.json({
      success: true,
      hotels
    });

  } catch (error) {

    console.error("GET /api/hotels error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotels",
      error: error.message
    });

  }

});


/* =========================================================
   2. GET CITIES
   GET /api/hotels/cities
========================================================= */

router.get("/cities", async (req, res) => {

  try {

    const destination =
      req.query.destination || "Vietnam";

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

      ...cityOrder.filter(
        city => cities.includes(city)
      ),

      ...cities
        .filter(city => !cityOrder.includes(city))
        .sort((a, b) => a.localeCompare(b))

    ];

    return res.json({
      success: true,
      cities: orderedCities
    });

  } catch (error) {

    console.error("GET /cities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message
    });

  }

});


/* =========================================================
   3. GET HOTELS BY CITY
   GET /api/hotels/by-city
========================================================= */

router.get("/by-city", async (req, res) => {

  try {

    const destination =
      req.query.destination || "Vietnam";

    const rawCity =
      req.query.city || "";

    const city =
      normalizeCityInput(rawCity);

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
          hotelName: {
            $first: "$hotelName"
          },
          category: {
            $first: "$category"
          },
          city: {
            $first: "$city"
          }
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

              {
                $gt: [
                  {
                    $strLenCP: {
                      $ifNull: [
                        "$category",
                        ""
                      ]
                    }
                  },
                  0
                ]
              },

              {
                $concat: [
                  "$hotelName",
                  " (",
                  "$category",
                  ")"
                ]
              },

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
      message: "Failed to fetch hotels",
      error: error.message
    });

  }

});


/* =========================================================
   4. GET ROOM TYPES
   GET /api/hotels/room-types
========================================================= */

router.get("/room-types", async (req, res) => {

  try {

    const destination =
      req.query.destination || "Vietnam";

    const city =
      normalizeCityInput(
        req.query.city || ""
      );

    const hotelName =
      req.query.hotelName || "";

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
      .sort({
        rate2D1N: 1,
        roomType: 1
      })
      .lean();

    const formattedRoomTypes =
      roomTypes.map(room => ({

        ...room,

        displayName:
          getDisplayName(room)

      }));

    return res.json({

      success: true,

      city,

      hotelName,

      roomTypes:
        formattedRoomTypes

    });

  } catch (error) {

    console.error(
      "GET /room-types error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch room types",
      error: error.message
    });

  }

});


/* =========================================================
   5. CALCULATE HOTEL
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

        message:
          "city, hotelName and roomType are required"

      });

    }


    const normalizedCity =
      normalizeCityInput(city);


    let hotel =
      await Hotel.findOne({

        destination,

        city: normalizedCity,

        hotelName,

        roomType,

        mealPlan,

        ...getActiveFilter()

      }).lean();


    if (!hotel) {

      hotel =
        await Hotel.findOne({

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

        message:
          "Hotel room not found"

      });

    }


    const totalNights =
      Math.max(
        1,
        Number(nights) || 1
      );

    const totalRooms =
      Math.max(
        1,
        Number(rooms) || 1
      );

    const totalAdults =
      Math.max(
        0,
        Number(adults) || 0
      );

    const totalCWB =
      Math.max(
        0,
        Number(childWithBed) || 0
      );

    const totalCNB =
      Math.max(
        0,
        Number(childNoBed) || 0
      );


    const roomRate =
      Number(hotel.rate2D1N) || 0;

    const extraBedRate =
      Number(hotel.extraBed) || 0;

    const childNoBedRate =
      Number(hotel.childNoBed) || 0;


    const includedAdults =
      totalRooms * 2;

    const extraAdultCount =
      Math.max(
        0,
        totalAdults - includedAdults
      );


    const baseHotelCost =
      roomRate *
      totalRooms *
      totalNights;


    const extraAdultCost =
      extraAdultCount *
      extraBedRate *
      totalNights;


    const childWithBedCost =
      totalCWB *
      extraBedRate *
      totalNights;


    const childNoBedCost =
      totalCNB *
      childNoBedRate *
      totalNights;


    const childCharges =
      childWithBedCost +
      childNoBedCost;


    const total =
      baseHotelCost +
      extraAdultCost +
      childCharges;


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

        displayName:
          getDisplayName(hotel)

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

    console.error(
      "POST /calculate error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to calculate hotel segment",

      error: error.message

    });

  }

});


/* =========================================================
   6. INACTIVE HOTELS
   GET /api/hotels/inactive
========================================================= */

router.get("/inactive", async (req, res) => {

  try {

    const hotels =
      await Hotel.find({
        isActive: false
      })
        .sort({
          region: 1,
          city: 1,
          hotelName: 1,
          roomType: 1
        })
        .lean();

    return res.json({

      success: true,

      hotels

    });

  } catch (error) {

    console.error(
      "GET /inactive error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch inactive hotels",

      error: error.message

    });

  }

});


/* =========================================================
   7. ADD NEW HOTEL
   POST /api/hotels
========================================================= */

router.post("/", async (req, res) => {

  try {

    const {

      hotelName,

      destination = "Vietnam",

      region = "",

      city = "",

      category = "",

      currency = "USD",

      pricingUnit = "Per Room / Night",

      note = ""

    } = req.body || {};


    if (!hotelName || !city) {

      return res.status(400).json({

        success: false,

        message:
          "Hotel name and city are required"

      });

    }


    const hotel =
      await Hotel.create({

        hotelName:
          hotelName.trim(),

        destination:
          destination.trim(),

        region:
          region.trim(),

        city:
          normalizeCityInput(city),

        category:
          category.trim(),

        currency:
          currency.trim(),

        pricingUnit:
          pricingUnit.trim(),

        note:
          note.trim(),

        isActive: true,

        roomType: "",

        mealPlan: "",

        rate2D1N: 0,

        rate3D2N: 0,

        extraBed: 0,

        childNoBed: 0

      });


    return res.status(201).json({

      success: true,

      message:
        "Hotel added successfully",

      data: hotel

    });

  } catch (error) {

    console.error(
      "POST /api/hotels error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to add hotel",

      error: error.message

    });

  }

});


/* =========================================================
   8. UPDATE HOTEL / ROOM
   PUT /api/hotels/:id
========================================================= */

router.put("/:id", async (req, res) => {

  try {

    const hotel =
      await Hotel.findByIdAndUpdate(

        req.params.id,

        req.body,

        {

          new: true,

          runValidators: true

        }

      ).lean();


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel / room not found"

      });

    }


    return res.json({

      success: true,

      message:
        "Hotel / room updated successfully",

      hotel

    });

  } catch (error) {

    console.error(
      "PUT /api/hotels/:id error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to update hotel / room",

      error: error.message

    });

  }

});


/* =========================================================
   9. DELETE / SOFT DELETE
   DELETE /api/hotels/:id
========================================================= */

router.delete("/:id", async (req, res) => {

  try {

    const hotel =
      await Hotel.findByIdAndUpdate(

        req.params.id,

        {
          isActive: false
        },

        {
          new: true
        }

      ).lean();


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel / room not found"

      });

    }


    return res.json({

      success: true,

      message:
        "Hotel / room deleted successfully",

      data: hotel

    });

  } catch (error) {

    console.error(
      "DELETE /api/hotels/:id error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to delete hotel / room",

      error: error.message

    });

  }

});


/* =========================================================
   10. RESTORE
   PATCH /api/hotels/:id/restore
========================================================= */

router.patch("/:id/restore", async (req, res) => {

  try {

    const hotel =
      await Hotel.findByIdAndUpdate(

        req.params.id,

        {
          isActive: true
        },

        {

          new: true,

          runValidators: true

        }

      ).lean();


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel / room not found"

      });

    }


    return res.json({

      success: true,

      message:
        "Hotel / room restored successfully",

      data: hotel

    });

  } catch (error) {

    console.error(
      "PATCH /restore error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to restore hotel / room",

      error: error.message

    });

  }

});


module.exports = router;