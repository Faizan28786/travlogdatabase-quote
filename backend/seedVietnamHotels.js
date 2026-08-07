
require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");

/* =========================================================
   CONFIG
========================================================= */
const DESTINATION = "Vietnam";
const DEFAULT_MEAL_PLAN = "CP";
const DEFAULT_CURRENCY = "USD";

/* =========================================================
   HELPERS
========================================================= */
function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function normalizeHotelName(name) {
  return toText(name).replace(/\s+/g, " ").trim();
}

function normalizeRoomType(roomType) {
  return toText(roomType).replace(/\s+/g, " ").trim();
}

function normalizeCategory(category) {
  return toText(category).replace(/\s+/g, " ").trim();
}
function getRegion(city) {

  const map = {

    "Hanoi": "North Vietnam",
    "Halong Bay": "North Vietnam",
    "Sapa": "North Vietnam",

    "Danang": "Central Vietnam",
    "Hoi An": "Central Vietnam",

    "Ho Chi Minh City": "South Vietnam",
    "Phu Quoc": "South Vietnam"

  };

  return map[city] || "";
}
function makeHotel({
  city,
  hotelName,
  category,
  roomType,
  rate,
  extraBed = 0,
  childNoBed = "",
  note = "",
  mealPlan = DEFAULT_MEAL_PLAN,
  currency = DEFAULT_CURRENCY
}) {
  return {
    destination: DESTINATION,
    region: getRegion(city),   // <-- NEW
    city: toText(city),
    hotelName: normalizeHotelName(hotelName),
    category: normalizeCategory(category),
    roomType: normalizeRoomType(roomType),
    mealPlan: toText(mealPlan, DEFAULT_MEAL_PLAN),
    rate2D1N: toNumber(rate, 0),
    rate3D2N: 0,
    extraBed: toNumber(extraBed, 0),
    childNoBed: toText(childNoBed),
    note: toText(note),
    currency: toText(currency, DEFAULT_CURRENCY).toUpperCase()
  };
}

function dedupeHotels(hotels) {
  const map = new Map();

  for (const hotel of hotels) {
    const key = [
      hotel.destination,
      hotel.city.toLowerCase(),
      hotel.hotelName.toLowerCase(),
      hotel.category.toLowerCase(),
      hotel.roomType.toLowerCase()
    ].join("||");

    if (!map.has(key)) {
      map.set(key, hotel);
    }
  }

  return Array.from(map.values());
}

/* =========================================================
   HANOI
========================================================= */
const hanoiHotels = [
  // 3 STAR
  makeHotel({ city: "Hanoi", hotelName: "TK123 Hotel", category: "3 Star", roomType: "Deluxe Double - Hoan Kiem District", rate: 49, extraBed: 0, childNoBed: "8" }),
  makeHotel({ city: "Hanoi", hotelName: "TK123 Hotel", category: "3 Star", roomType: "Family Suite - 03 Pax - Hoan Kiem District", rate: 58, extraBed: 29, childNoBed: "12" }),
  makeHotel({ city: "Hanoi", hotelName: "Bonne Nuite Hotel", category: "3 Star", roomType: "Deluxe - Hoan Kiem District", rate: 53, extraBed: 15, childNoBed: "8" }),
  makeHotel({ city: "Hanoi", hotelName: "Golden Legend Palace Hotel", category: "3 Star", roomType: "Deluxe Window - Hoan Kiem District", rate: 43, extraBed: 15, childNoBed: "8" }),
  makeHotel({ city: "Hanoi", hotelName: "22 Land Residence Hoan Kiem", category: "3 Star", roomType: "Superior", rate: 58, extraBed: 14, childNoBed: "9" }),
  makeHotel({ city: "Hanoi", hotelName: "La Dolce Vita", category: "3 Star", roomType: "Skylight Window Internal - Hoan Kiem District", rate: 45, extraBed: 19, childNoBed: "11" }),
  makeHotel({ city: "Hanoi", hotelName: "Eco Luxury Hotel", category: "3 Star", roomType: "Deluxe - Hoan Kiem District", rate: 40, extraBed: 14, childNoBed: "10" }),
  makeHotel({ city: "Hanoi", hotelName: "Hotel De Rond", category: "3 Star", roomType: "Deluxe - Hoan Kiem District", rate: 51, extraBed: 17, childNoBed: "8" }),
  makeHotel({ city: "Hanoi", hotelName: "Flower Garden Hotel", category: "3 Star", roomType: "Superior - Ba Dinh District", rate: 67, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Hanoi", hotelName: "Flower Garden Hotel", category: "3 Star", roomType: "Deluxe - Ba Dinh District", rate: 0, extraBed: 26, childNoBed: "" }),

  // 4 STAR
  makeHotel({ city: "Hanoi", hotelName: "Signature by M Village Tho Nhuom", category: "4 Star", roomType: "Studio - Hoan Kiem District", rate: 67, extraBed: 0, childNoBed: "7" }),
  makeHotel({ city: "Hanoi", hotelName: "Signature by M Village Tho Nhuom", category: "4 Star", roomType: "DLX - Hoan Kiem District", rate: 77, extraBed: 35, childNoBed: "13" }),
  makeHotel({ city: "Hanoi", hotelName: "Hanoian Central & Spa", category: "4 Star", roomType: "Superior - Hoan Kiem District", rate: 74, extraBed: 0, childNoBed: "15" }),
  makeHotel({ city: "Hanoi", hotelName: "Hanoian Central & Spa", category: "4 Star", roomType: "Family Room - 03 Pax - Hoan Kiem District", rate: 105, extraBed: 0, childNoBed: "15" }),
  makeHotel({ city: "Hanoi", hotelName: "Babylon Premium Hotel & Spa", category: "4 Star", roomType: "Deluxe - 02 Adult Only - Hoan Kiem District", rate: 58, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Hanoi", hotelName: "Hai Bay Hotel", category: "4 Star", roomType: "Deluxe Internal Window - Hoan Kiem District", rate: 54, extraBed: 0, childNoBed: "22" }),
  makeHotel({ city: "Hanoi", hotelName: "Hai Bay Hotel", category: "4 Star", roomType: "Family Suite 2BR - Hoan Kiem District", rate: 118, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Hanoi", hotelName: "La Passion Classic", category: "4 Star", roomType: "Deluxe City View - Hoan Kiem District", rate: 75, extraBed: 20, childNoBed: "11" }),
  makeHotel({ city: "Hanoi", hotelName: "San Premium Hotel", category: "4 Star", roomType: "Deluxe No View - Hoan Kiem - 03 May to 30 Sep 2026", rate: 45, extraBed: 22, childNoBed: "15" }),
  makeHotel({ city: "Hanoi", hotelName: "San Premium Hotel", category: "4 Star", roomType: "Deluxe No View - Hoan Kiem - 11 Jan to 02 May 2026", rate: 58, extraBed: 22, childNoBed: "15" }),
  makeHotel({ city: "Hanoi", hotelName: "Super Candle Hotel", category: "4 Star", roomType: "Superior - Ba Dinh District", rate: 65, extraBed: 25, childNoBed: "10" }),
  makeHotel({ city: "Hanoi", hotelName: "Minasi Premium Hotel", category: "4 Star", roomType: "Deluxe - Ba Dinh District - May/Jun/Jul/Aug/Sep", rate: 60, extraBed: 28, childNoBed: "10" }),
  makeHotel({ city: "Hanoi", hotelName: "Minasi Premium Hotel", category: "4 Star", roomType: "Deluxe - Ba Dinh District - Jan/Mar/Apr/Oct/Nov/Dec", rate: 71, extraBed: 28, childNoBed: "10" }),
  makeHotel({ city: "Hanoi", hotelName: "La Casa Hotel", category: "4 Star", roomType: "Deluxe - Hai Ba Trung District", rate: 69, extraBed: 27, childNoBed: "12" }),

  // 5 STAR
  makeHotel({ city: "Hanoi", hotelName: "Dolce By Wyndham", category: "5 Star", roomType: "Golden Classic - Ba Dinh District", rate: 153, extraBed: 53, childNoBed: "18" }),
  makeHotel({ city: "Hanoi", hotelName: "Novotel Thai Ha", category: "5 Star", roomType: "Superior Double - Dong Da District", rate: 120, extraBed: 44, childNoBed: "10" }),
  makeHotel({ city: "Hanoi", hotelName: "Grand Plaza", category: "5 Star", roomType: "ROH - Cau Giay District", rate: 101, extraBed: 37, childNoBed: "16" }),
  makeHotel({ city: "Hanoi", hotelName: "Apricot Hotel", category: "5 Star", roomType: "Sketch - Hoan Kiem District - Jan/Feb/Apr/Nov/Dec", rate: 161, extraBed: 66, childNoBed: "25" }),
  makeHotel({ city: "Hanoi", hotelName: "Apricot Hotel", category: "5 Star", roomType: "Sketch - Hoan Kiem District - May to Sep 2026", rate: 130, extraBed: 66, childNoBed: "25" }),
  makeHotel({ city: "Hanoi", hotelName: "Pan Pacific", category: "5 Star", roomType: "Deluxe - Ba Dinh District - 01 Jan to 30 Apr / Oct to 31 Dec 2026", rate: 179, extraBed: 61, childNoBed: "15" }),
  makeHotel({ city: "Hanoi", hotelName: "Pan Pacific", category: "5 Star", roomType: "Deluxe - Ba Dinh District - 01 Jan to 30 Sep 2026", rate: 156, extraBed: 61, childNoBed: "15" })
];

/* =========================================================
   HALONG BAY
========================================================= */
const halongBayHotels = [
  makeHotel({ city: "Halong Bay", hotelName: "La Pandora Boutique", category: "4 Star", roomType: "Ocean View 1st Floor", rate: 198, extraBed: 99, childNoBed: "74" }),
  makeHotel({ city: "Halong Bay", hotelName: "La Pandora Cruise", category: "4 Star", roomType: "Suite Balcony 1st Floor", rate: 236, extraBed: 118, childNoBed: "89" }),
  makeHotel({ city: "Halong Bay", hotelName: "Mila Cruise", category: "4 Star", roomType: "Deluxe", rate: 212, extraBed: 106, childNoBed: "80" }),
  makeHotel({ city: "Halong Bay", hotelName: "La Regina Classic Cruise", category: "4 Star", roomType: "Deluxe", rate: 179, extraBed: 89.5, childNoBed: "67" }),
  makeHotel({ city: "Halong Bay", hotelName: "La Regina Royal Cruise", category: "4 Star", roomType: "Noble Suite", rate: 214, extraBed: 107, childNoBed: "80" }),
  makeHotel({ city: "Halong Bay", hotelName: "Le Journey Premium Cruise", category: "4 Star", roomType: "Deluxe", rate: 200, extraBed: 100, childNoBed: "75" }),
  makeHotel({ city: "Halong Bay", hotelName: "Amanda Ha Long Cruise", category: "4 Star", roomType: "Deluxe", rate: 210, extraBed: 105, childNoBed: "79" }),
  makeHotel({ city: "Halong Bay", hotelName: "Hera Boutique Cruise", category: "4 Star", roomType: "Deluxe - Upto April 2026", rate: 202, extraBed: 101, childNoBed: "76" }),
  makeHotel({ city: "Halong Bay", hotelName: "Hera Boutique Cruise", category: "4 Star", roomType: "Deluxe - 01 May to Sep 2026", rate: 400, extraBed: 200, childNoBed: "150" }),
  makeHotel({ city: "Halong Bay", hotelName: "Verdure Lotus Classic", category: "4 Star", roomType: "Deluxe", rate: 218, extraBed: 109, childNoBed: "82" }),

  makeHotel({ city: "Halong Bay", hotelName: "Le Journey Luxury Lan Ha Bay", category: "5 Star", roomType: "Deluxe", rate: 244, extraBed: 122, childNoBed: "92" }),
  makeHotel({ city: "Halong Bay", hotelName: "Amanda Luxury Cruise", category: "5 Star", roomType: "Junior", rate: 258, extraBed: 129, childNoBed: "97" }),
  makeHotel({ city: "Halong Bay", hotelName: "Hera Grand Luxury", category: "5 Star", roomType: "Junior Suite", rate: 222, extraBed: 111, childNoBed: "83" }),
  makeHotel({ city: "Halong Bay", hotelName: "Aqua of the Seas", category: "5 Star", roomType: "Junior - Upto 15 Oct 2026", rate: 266, extraBed: 133, childNoBed: "100" }),
  makeHotel({ city: "Halong Bay", hotelName: "Aqua of the Seas", category: "5 Star", roomType: "Junior - 16 Oct to 30 Apr 2026", rate: 288, extraBed: 144, childNoBed: "108" }),
  makeHotel({ city: "Halong Bay", hotelName: "Aspira Cruise", category: "5 Star", roomType: "Junior Suite", rate: 264, extraBed: 132, childNoBed: "99" }),
  makeHotel({ city: "Halong Bay", hotelName: "Verdure Lotus Grandeur", category: "5 Star", roomType: "Grandeur Classic", rate: 214, extraBed: 107, childNoBed: "80" }),
  makeHotel({ city: "Halong Bay", hotelName: "Genesis Regal Cruise", category: "5 Star", roomType: "Junior Suite - 01 Jan to 30 Apr 2026", rate: 310, extraBed: 155, childNoBed: "116" }),
  makeHotel({ city: "Halong Bay", hotelName: "Genesis Regal Cruise", category: "5 Star", roomType: "Junior Suite - 01 May to 30 Sep 2026", rate: 246, extraBed: 123, childNoBed: "92" }),
  makeHotel({ city: "Halong Bay", hotelName: "Majesty Prime Cruise", category: "5 Star", roomType: "Junior Suite - 01 Jan to 30 Apr 2026", rate: 310, extraBed: 155, childNoBed: "116" }),
  makeHotel({ city: "Halong Bay", hotelName: "Majesty Prime Cruise", category: "5 Star", roomType: "Junior Suite - 01 May to 30 Sep 2026", rate: 246, extraBed: 123, childNoBed: "92" }),
  makeHotel({ city: "Halong Bay", hotelName: "Alisa Premier Cruise", category: "5 Star", roomType: "Junior Balcony", rate: 265, extraBed: 132.5, childNoBed: "99" }),
  makeHotel({ city: "Halong Bay", hotelName: "Rita Cruise", category: "5 Star", roomType: "Junior Suite", rate: 291, extraBed: 145.5, childNoBed: "109" }),
  makeHotel({ city: "Halong Bay", hotelName: "Paradise Elegance Cruise", category: "5 Star", roomType: "Deluxe Balcony", rate: 332, extraBed: 166, childNoBed: "133" }),
  makeHotel({ city: "Halong Bay", hotelName: "Paradise Grand Cruise", category: "5 Star", roomType: "Grand Balcony", rate: 332, extraBed: 166, childNoBed: "133" })
];

/* =========================================================
   SAPA
========================================================= */
const sapaHotels = [
  // 3 STAR
  makeHotel({ city: "Sapa", hotelName: "Sapa Centre Hotel", category: "3 Star", roomType: "Superior", rate: 38, extraBed: 0, childNoBed: "9" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Centre Hotel", category: "3 Star", roomType: "Family", rate: 50, extraBed: 15, childNoBed: "9" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Relax Hotel & Spa", category: "3 Star", roomType: "Deluxe Room City View", rate: 41, extraBed: 15, childNoBed: "15" }),
  makeHotel({ city: "Sapa", hotelName: "Ta Pi Boutique Hotel", category: "3 Star", roomType: "Superior City View", rate: 23, extraBed: 13, childNoBed: "11" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Village Hotel", category: "3 Star", roomType: "Deluxe Double", rate: 33, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Village Hotel", category: "3 Star", roomType: "Family Garden", rate: 33, extraBed: 15, childNoBed: "11" }),

  // 4 STAR
  makeHotel({ city: "Sapa", hotelName: "Sapa Highland Resort & Spa", category: "4 Star", roomType: "Superior Garden or City View", rate: 54, extraBed: 22, childNoBed: "15" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Highland Resort & Spa", category: "4 Star", roomType: "DLX Triple Mountain View", rate: 84, extraBed: 0, childNoBed: "15" }),
  makeHotel({ city: "Sapa", hotelName: "Bamboo Sapa Hotel", category: "4 Star", roomType: "Superior Window", rate: 63, extraBed: 27, childNoBed: "15" }),
  makeHotel({ city: "Sapa", hotelName: "Sapa Square", category: "4 Star", roomType: "Superior", rate: 83, extraBed: 37, childNoBed: "15" }),

  // 5 STAR
  makeHotel({ city: "Sapa", hotelName: "Silk Path Grand Sapa", category: "5 Star", roomType: "Balcony Classic", rate: 102, extraBed: 42, childNoBed: "33" }),
  makeHotel({ city: "Sapa", hotelName: "KK Sapa Hotel", category: "5 Star", roomType: "Superior", rate: 90, extraBed: 27, childNoBed: "15" }),
  makeHotel({ city: "Sapa", hotelName: "Lady Hill Sapa", category: "5 Star", roomType: "Superior", rate: 102, extraBed: 23, childNoBed: "19" }),
  makeHotel({ city: "Sapa", hotelName: "Pao's Leisure Sapa", category: "5 Star", roomType: "DLX Garden", rate: 80, extraBed: 31, childNoBed: "15" })
];

/* =========================================================
   DANANG
========================================================= */
const danangHotels = [
  // 3 STAR
  makeHotel({ city: "Danang", hotelName: "Soho Boutique Hotel", category: "3 Star", roomType: "Superior", rate: 28, extraBed: 13, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Tamarind Hotel", category: "3 Star", roomType: "Superior", rate: 0, extraBed: 0, childNoBed: "0" }),
  makeHotel({ city: "Danang", hotelName: "Senorita Boutique Hotel", category: "3 Star", roomType: "Superior", rate: 34, extraBed: 17, childNoBed: "10" }),
  makeHotel({ city: "Danang", hotelName: "Sunny Ocean Hotel", category: "3 Star", roomType: "Superior - No Extra Bed", rate: 36, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Sunny Ocean Hotel", category: "3 Star", roomType: "Family Room", rate: 72, extraBed: 20, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Roliva Hotel", category: "3 Star", roomType: "Deluxe - No Extra Bed", rate: 30, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Roliva Hotel", category: "3 Star", roomType: "Deluxe Triple", rate: 55, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Pharaoh Boutique Hotel", category: "3 Star", roomType: "King Room - Internal Window", rate: 24, extraBed: 13, childNoBed: "11" }),

  // 4 STAR
  makeHotel({ city: "Danang", hotelName: "The Sail Hotel", category: "4 Star", roomType: "Superior", rate: 39, extraBed: 15, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "The Sail Hotel", category: "4 Star", roomType: "Deluxe Triple", rate: 55, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Bluesun Hotel", category: "4 Star", roomType: "Deluxe", rate: 51, extraBed: 21, childNoBed: "15" }),
  makeHotel({ city: "Danang", hotelName: "Cicilia Da Nang Hotel", category: "4 Star", roomType: "Deluxe Window - No Extra Bed", rate: 47, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Cicilia Da Nang Hotel", category: "4 Star", roomType: "Triple City View", rate: 80, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Seven Sea Hotel", category: "4 Star", roomType: "Superior - No Extra Bed", rate: 40, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Seven Sea Hotel", category: "4 Star", roomType: "Deluxe Triple Room", rate: 56, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Alani Hotel", category: "4 Star", roomType: "Seaside View Room", rate: 42, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Alani Hotel", category: "4 Star", roomType: "City View Family Room", rate: 70, extraBed: 20, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Yarra Ocean Suites Danang", category: "4 Star", roomType: "Yarra Room", rate: 56, extraBed: 18, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Eden Ocean Da Nang Hotel", category: "4 Star", roomType: "Deluxe Twin", rate: 45, extraBed: 15, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Eden Ocean Da Nang Hotel", category: "4 Star", roomType: "Deluxe Triple", rate: 56, extraBed: 15, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Holiday Beach Danang", category: "4 Star", roomType: "Superior City - No Extra Bed", rate: 58, extraBed: 0, childNoBed: "11" }),

  // 5 STAR
  makeHotel({ city: "Danang", hotelName: "DLG Hotel", category: "5 Star", roomType: "Deluxe Partial Ocean", rate: 79, extraBed: 25, childNoBed: "15" }),
  makeHotel({ city: "Danang", hotelName: "DLG Hotel", category: "5 Star", roomType: "Family Partial Ocean", rate: 190, extraBed: 25, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Grand Mercure Hotel", category: "5 Star", roomType: "Superior", rate: 83, extraBed: 37, childNoBed: "11" }),
  makeHotel({ city: "Danang", hotelName: "Risemount Premier", category: "5 Star", roomType: "Deluxe", rate: 78, extraBed: 0, childNoBed: "12" }),
  makeHotel({ city: "Danang", hotelName: "Four Points by Sheraton", category: "5 Star", roomType: "Superior Ocean", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Danang", hotelName: "Radisson Hotel", category: "5 Star", roomType: "Deluxe", rate: 88, extraBed: 39, childNoBed: "13" }),
  makeHotel({ city: "Danang", hotelName: "Grand Tourane Hotel", category: "5 Star", roomType: "Deluxe City", rate: 74, extraBed: 26, childNoBed: "12" }),
  makeHotel({ city: "Danang", hotelName: "Nesta Celia Hotel", category: "5 Star", roomType: "Superior", rate: 61, extraBed: 30, childNoBed: "12" })
];

/* =========================================================
   HO CHI MINH CITY / SAIGON
========================================================= */
const hcmHotels = [
  // 3 STAR
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Prague Hotel", category: "3 Star", roomType: "Deluxe Window", rate: 48, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Prague Hotel", category: "3 Star", roomType: "Family Triple Room with Window", rate: 61, extraBed: 15, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Queen Ann Saigon", category: "3 Star", roomType: "Deluxe Window", rate: 50, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Queen Ann Saigon", category: "3 Star", roomType: "Deluxe Triple Window", rate: 71, extraBed: 19, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Victory Hotel Saigon", category: "3 Star", roomType: "Deluxe", rate: 60, extraBed: 24, childNoBed: "11" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Nicey Boutique Hotel", category: "3 Star", roomType: "Deluxe", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Happy Green Life", category: "3 Star", roomType: "Deluxe Window - No Extra Bed", rate: 47, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Acnos Hotel", category: "3 Star", roomType: "Deluxe", rate: 63, extraBed: 0, childNoBed: "8" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Acnos Hotel", category: "3 Star", roomType: "Family Room - 3 Pax", rate: 90, extraBed: 0, childNoBed: "8" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Diamond Hill", category: "3 Star", roomType: "Deluxe", rate: 50, extraBed: 0, childNoBed: "13" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Diamond Hill", category: "3 Star", roomType: "Premier Triple", rate: 73, extraBed: 0, childNoBed: "13" }),

  // 4 STAR
  makeHotel({ city: "Ho Chi Minh City", hotelName: "The Odys Boutique Hotel", category: "4 Star", roomType: "Junior Deluxe - Only Double Bed", rate: 69, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "The Odys Boutique Hotel", category: "4 Star", roomType: "Triple Room - 03 Pax", rate: 135, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Hotel Royal Saigon", category: "4 Star", roomType: "Deluxe - No Extra Bed", rate: 82, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Sky Gem Ben Thanh", category: "4 Star", roomType: "Deluxe - No Extra Bed", rate: 67, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Alagon City", category: "4 Star", roomType: "Premier Window", rate: 80, extraBed: 0, childNoBed: "12" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Alagon City", category: "4 Star", roomType: "Family Internal Window", rate: 136, extraBed: 0, childNoBed: "12" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Harmony Hotel & Spa", category: "4 Star", roomType: "Junior - No View", rate: 93, extraBed: 33, childNoBed: "10" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "A & EM Art Saigon Hotel", category: "4 Star", roomType: "Deluxe", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Cicilia Saigon", category: "4 Star", roomType: "Deluxe - No View", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Happy Life Grand", category: "4 Star", roomType: "Lessini Premier", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Paragon Hotel", category: "4 Star", roomType: "Deluxe Window", rate: 0, extraBed: 0, childNoBed: "" }),

  // 5 STAR
  makeHotel({ city: "Ho Chi Minh City", hotelName: "La Vela Saigon", category: "5 Star", roomType: "La Vela Deluxe", rate: 140, extraBed: 0, childNoBed: "13" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Nikko Saigon", category: "5 Star", roomType: "Deluxe Double", rate: 179, extraBed: 61, childNoBed: "61" }),
  makeHotel({ city: "Ho Chi Minh City", hotelName: "Equatorial Hotel", category: "5 Star", roomType: "Deluxe", rate: 135, extraBed: 59, childNoBed: "20" })
];

/* =========================================================
   PHU QUOC
========================================================= */
const phuQuocHotels = [
  // 3 STAR
  makeHotel({ city: "Phu Quoc", hotelName: "Brenta Hotel", category: "3 Star", roomType: "Superior", rate: 43, extraBed: 13, childNoBed: "13" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Maison Hotel Phu Quoc", category: "3 Star", roomType: "Deluxe Double City View", rate: 28, extraBed: 0, childNoBed: "8" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Maison Hotel Phu Quoc", category: "3 Star", roomType: "DLX Triple Ocean View", rate: 42, extraBed: 0, childNoBed: "8" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Rock Mila Hotel", category: "3 Star", roomType: "Standard Room - No Extra Bed", rate: 28, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Rock Mila Hotel", category: "3 Star", roomType: "Standard Triple - 03 Pax", rate: 41, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Stellar Hotel Phu Quoc", category: "3 Star", roomType: "SUP Window Double", rate: 0, extraBed: 0, childNoBed: "" }),
  makeHotel({ city: "Phu Quoc", hotelName: "TK Hotel Phu Quoc", category: "3 Star", roomType: "Superior", rate: 42, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "TK Hotel Phu Quoc", category: "3 Star", roomType: "Deluxe Triple", rate: 72, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Gaia Hotel Phu Quoc", category: "3 Star", roomType: "Standard City View", rate: 41, extraBed: 15, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Gaia Hotel Phu Quoc", category: "3 Star", roomType: "Premier Triple Room", rate: 60, extraBed: 15, childNoBed: "10" }),

  // 4 STAR
  makeHotel({ city: "Phu Quoc", hotelName: "Tom Hill Resort", category: "4 Star", roomType: "Superior Garden View", rate: 49, extraBed: 22, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Tom Hill Resort", category: "4 Star", roomType: "DLX Garden Triple", rate: 80, extraBed: 0, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Sunset Beach Resort & Spa", category: "4 Star", roomType: "Deluxe - May to Oct", rate: 69, extraBed: 22, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Sunset Beach Resort & Spa", category: "4 Star", roomType: "Deluxe - Jan to Apr & Nov to Dec", rate: 80, extraBed: 22, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Saigon Phu Quoc Resort & Spa", category: "4 Star", roomType: "Panorama Room - Jan to Apr", rate: 64, extraBed: 26, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Saigon Phu Quoc Resort & Spa", category: "4 Star", roomType: "Panorama Room - May to Sep", rate: 49, extraBed: 26, childNoBed: "11" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Lahana Resort & Spa", category: "4 Star", roomType: "Deluxe with Garden View", rate: 91, extraBed: 26, childNoBed: "13" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Lahana Resort & Spa", category: "4 Star", roomType: "DLX Triple Garden View - 31st March", rate: 130, extraBed: 0, childNoBed: "13" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Lahana Resort & Spa", category: "4 Star", roomType: "Triple Garden View - April/May & Oct", rate: 111, extraBed: 0, childNoBed: "13" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Muong Thanh Luxury Phu Quoc", category: "4 Star", roomType: "Deluxe", rate: 67, extraBed: 24, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Muong Thanh Luxury Phu Quoc", category: "4 Star", roomType: "Deluxe Triple", rate: 90, extraBed: 0, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Wyndham Garden Grandworld", category: "4 Star", roomType: "Superior - 01 Apr to 31 Oct 2026", rate: 62, extraBed: 31, childNoBed: "8" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Wyndham Garden Grandworld", category: "4 Star", roomType: "Superior - 01 Nov to 31 Mar", rate: 75, extraBed: 31, childNoBed: "" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Tahiti Resort", category: "4 Star", roomType: "Deluxe Garden", rate: 75, extraBed: 24, childNoBed: "13" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Vinholidays Fiesta - Grandworld", category: "4 Star", roomType: "Standard - Upto March", rate: 105, extraBed: 51, childNoBed: "26" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Vinholidays Fiesta - Grandworld", category: "4 Star", roomType: "Standard", rate: 86, extraBed: 51, childNoBed: "26" }),

  // 5 STAR
  makeHotel({ city: "Phu Quoc", hotelName: "Sol By Melia Phu Quoc", category: "5 Star", roomType: "Standard - 01 Mar to 31 Oct", rate: 83, extraBed: 53, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Novotel Phu Quoc Resort", category: "5 Star", roomType: "Superior", rate: 114, extraBed: 46, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Sonaga Beach Resort & Villa", category: "5 Star", roomType: "Deluxe Mountain View", rate: 111, extraBed: 39, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "The Shells Resort and Spa Phu Quoc", category: "5 Star", roomType: "Luxury Villa Garden", rate: 117, extraBed: 42, childNoBed: "15" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Camia Resort", category: "5 Star", roomType: "Deluxe Garden", rate: 104, extraBed: 48, childNoBed: "24" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Movenpick Residence", category: "5 Star", roomType: "Studio", rate: 124, extraBed: 61, childNoBed: "10" }),
  makeHotel({ city: "Phu Quoc", hotelName: "Green Bay Resort", category: "5 Star", roomType: "Green Villa", rate: 175, extraBed: 57, childNoBed: "15" })
];

/* =========================================================
   HOI AN
========================================================= */
const hoiAnHotels = [
  makeHotel({ city: "Hoi An", hotelName: "Coco River Resort & Spa", category: "3 Star", roomType: "Deluxe Double Garden View", rate: 45, extraBed: 18, childNoBed: "11" }),
  makeHotel({ city: "Hoi An", hotelName: "Eco Lux Riverside", category: "3 Star", roomType: "Diamond Pearl Luxury Room", rate: 38, extraBed: 15, childNoBed: "10" }),
  makeHotel({ city: "Hoi An", hotelName: "Eco Lux Riverside", category: "3 Star", roomType: "Triple Room Balcony", rate: 70, extraBed: 0, childNoBed: "10" }),
  makeHotel({ city: "Hoi An", hotelName: "Silkotel Hoi An", category: "4 Star", roomType: "Deluxe", rate: 62, extraBed: 29, childNoBed: "15" })
];

/* =========================================================
   ALL HOTELS (ORDER MATTERS)
========================================================= */
const allHotelsRaw = [
  ...hanoiHotels,
  ...halongBayHotels,
  ...sapaHotels,
  ...danangHotels,
  ...hcmHotels,
  ...phuQuocHotels,
  ...hoiAnHotels
];

const allHotels = dedupeHotels(allHotelsRaw);

/* =========================================================
   SUMMARY
========================================================= */
function getSummary(hotels) {
  const cities = [
    "Hanoi",
    "Halong Bay",
    "Sapa",
    "Danang",
    "Ho Chi Minh City",
    "Phu Quoc",
    "Hoi An"
  ];

  return cities.reduce((acc, city) => {
    acc[city] = hotels.filter((h) => h.city === city).length;
    return acc;
  }, {});
}

/* =========================================================
   SEED
========================================================= */
async function seedHotels() {
  try {
    console.log("1️⃣ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    console.log(`2️⃣ Deleting old ${DESTINATION} hotels...`);
    await Hotel.deleteMany({ destination: DESTINATION });
    console.log(`🗑️ Old ${DESTINATION} hotels deleted`);

    console.log(`3️⃣ Inserting ${allHotels.length} ${DESTINATION} hotels...`);
    await Hotel.insertMany(allHotels, { ordered: true });
    console.log(`✅ ${DESTINATION} hotels seeded successfully: ${allHotels.length} hotels inserted`);

    const summary = getSummary(allHotels);

    console.log("📊 Seed Summary:");
    Object.entries(summary).forEach(([city, count]) => {
      console.log(`   ${city}: ${count}`);
    });

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    try {
      await mongoose.connection.close();
    } catch (_) { }
    process.exit(1);
  }
}

seedHotels();

