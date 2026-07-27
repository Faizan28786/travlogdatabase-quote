const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const LandService = require("./models/LandService");

const landServices = [

    {
        region: "North Vietnam",

        cities: [
            "Hanoi",
            "Ha Noi",
            "Halong Bay",
            "Ha Long Bay"
        ],

        transfer: [

            {
                name: "Hanoi Airport Private Transfer (One Way)",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 12, 3: 13, 4: 13, 5: 20, 6: 20, 7: 20, 8: 20,
                    9: 63, 10: 63, 11: 63, 12: 63, 13: 63, 14: 63
                }
            },

            {
                name: "Hanoi Hotel → Halong Bay Private Transfer",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 60, 3: 63, 4: 63, 5: 84, 6: 84, 7: 84, 8: 84,
                    9: 146, 10: 146, 11: 146, 12: 146, 13: 146, 14: 146
                }
            },

            {
                name: "Halong Bay → Hanoi Airport Private Transfer",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 60, 3: 63, 4: 63, 5: 84, 6: 84, 7: 84, 8: 84,
                    9: 146, 10: 146, 11: 146, 12: 146, 13: 146, 14: 146
                }
            },

            {
                name: "Airport → Halong Bay Private Transfer",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 60, 3: 63, 4: 63, 5: 84, 6: 84, 7: 84, 8: 84,
                    9: 146, 10: 146, 11: 146, 12: 146, 13: 146, 14: 146
                }
            }

        ],

        privateTours: [

            {
                name: "Hanoi Full Day City Tour PVT (No Lunch)",
                guide: true,
                rates: {
                    2: 61, 3: 41, 4: 39, 5: 35, 6: 33, 7: 32, 8: 31,
                    9: 30, 10: 29, 11: 28, 12: 27, 13: 26, 14: 25
                }
            },

            {
                name: "Hanoi Half Day City Tour PVT (No Lunch)",
                guide: true,
                rates: {
                    2: 46, 3: 31, 4: 29, 5: 27, 6: 26, 7: 24, 8: 22,
                    9: 21, 10: 20, 11: 19, 12: 18, 13: 17, 14: 16
                }
            },

            {
                name: "Ninh Binh Hoa Lu - Trang An Boat PVT",
                guide: true,
                rates: {
                    2: 68, 3: 47, 4: 45, 5: 41, 6: 39, 7: 36, 8: 34,
                    9: 33, 10: 32, 11: 31, 12: 30, 13: 29, 14: 28
                }
            },

            {
                name: "Ninh Binh Hoa Lu - Tam Coc & Mua Cave PVT",
                guide: true,
                rates: {
                    2: 77, 3: 56, 4: 54, 5: 50, 6: 48, 7: 45, 8: 43,
                    9: 42, 10: 41, 11: 40, 12: 39, 13: 38, 14: 37
                }
            },

            {
                name: "Ninh Binh Tam Coc & Mua Cave PVT",
                guide: true,
                rates: {
                    2: 75, 3: 54, 4: 52, 5: 48, 6: 46, 7: 43, 8: 41,
                    9: 40, 10: 39, 11: 38, 12: 37, 13: 36, 14: 35
                }
            },

            {
                name: "Ninh Binh Bai Dinh - Trang An PVT",
                guide: true,
                rates: {
                    2: 81, 3: 52, 4: 58, 5: 57, 6: 56, 7: 55, 8: 54,
                    9: 53, 10: 52, 11: 51, 12: 50, 13: 49, 14: 48
                }
            },

            {
                name: "Ninh Binh Bai Dinh - Trang An - Mua Cave PVT",
                guide: true,
                rates: {
                    2: 88, 3: 67, 4: 65, 5: 64, 6: 63, 7: 62, 8: 61,
                    9: 60, 10: 59, 11: 58, 12: 57, 13: 56, 14: 55
                }
            },

            {
                name: "Incense Village Tour PVT",
                guide: true,
                rates: {
                    2: 52, 3: 35, 4: 33, 5: 31, 6: 29, 7: 29, 8: 27,
                    9: 26, 10: 25, 11: 24, 12: 23, 13: 22, 14: 21
                }
            }

        ],

        sicTours: [

            {
                name: "Hanoi Full Day City Tour SIC (With Local Lunch)",
                price: 27
            },

            {
                name: "Hanoi Half Day Afternoon City Tour SIC",
                price: 24
            },

            {
                name: "Ninh Binh Hoa Lu - Tam Coc SIC",
                price: 28
            },

            {
                name: "Ninh Binh Hoa Lu - Trang An SIC",
                price: 29
            },

            {
                name: "Ninh Binh Hoa Lu - Tam Coc & Mua Cave SIC",
                price: 35
            },

            {
                name: "Ninh Binh Hoa Lu - Trang An & Mua Cave SIC",
                price: 37
            },

            {
                name: "Bai Dinh - Trang An SIC",
                price: 35
            },

            {
                name: "Bai Dinh - Trang An - Mua Cave SIC",
                price: 42
            },

            {
                name: "Incense Village SIC",
                price: 34
            },

            {
                name: "Halong Day Cruise SIC - Diamond Era / Alina (Normal Bus)",
                price: 40
            },

            {
                name: "Halong Day Cruise SIC - Diamond Era / Alina (Limousine)",
                price: 45
            },

            {
                name: "Halong Day Cruise SIC - Cozy Bay / Sea Lion (Normal Bus)",
                price: 45
            },

            {
                name: "Halong Day Cruise SIC - Cozy Bay / Sea Lion (Limousine)",
                price: 53
            }

        ],
        localServices: [

            {
                name: "Old Quarter Cyclo Experience",
                price: 7
            },

            {
                name: "Double Decker Hop On Hop Off",
                price: 8
            },

            {
                name: "Water Puppet Show",
                price: 8
            },

            {
                name: "Hanoi Jeep Tour (4 Hours)",
                price: 132
            }

        ],

        meals: [

            {
                name: "Indian Meal (Per Meal)",
                rates: {
                    2: 19, 3: 18, 4: 18, 5: 17, 6: 17, 7: 16, 8: 16,
                    9: 16, 10: 16, 11: 16, 12: 16, 13: 15, 14: 15
                }
            },

            {
                name: "Dinner Transfer",
                rates: {
                    2: 6, 3: 5, 4: 5, 5: 4, 6: 4, 7: 3, 8: 3,
                    9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3
                }
            }

        ]

    },
    {
        region: "Sapa",

        cities: [
            "Sapa",
            "Ha Giang"
        ],

        transfer: [

            {
                name: "Hanoi Airport → Sapa Hotel (Private)",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 108, 3: 112, 4: 112, 5: 145, 6: 145, 7: 145, 8: 145,
                    9: 342, 10: 342, 11: 342, 12: 342, 13: 342, 14: 342
                }
            },

            {
                name: "Sapa Hotel → Hanoi Airport (Private)",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 108, 3: 112, 4: 112, 5: 145, 6: 145, 7: 145, 8: 145,
                    9: 342, 10: 342, 11: 342, 12: 342, 13: 342, 14: 342
                }
            },

            {
                name: "Hanoi Hotel → Sapa (Private)",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 108, 3: 112, 4: 112, 5: 145, 6: 145, 7: 145, 8: 145,
                    9: 342, 10: 342, 11: 342, 12: 342, 13: 342, 14: 342
                }
            },

            {
                name: "Sapa → Hanoi Hotel (Private)",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 108, 3: 112, 4: 112, 5: 145, 6: 145, 7: 145, 8: 145,
                    9: 342, 10: 342, 11: 342, 12: 342, 13: 342, 14: 342
                }
            }

        ],

        privateTours: [

            {
                name: "Fansipan Cable Car + Round Transfer",
                rates: {
                    2: 64, 3: 57, 4: 55, 5: 56, 6: 54, 7: 53, 8: 52,
                    9: 51, 10: 50, 11: 49, 12: 48, 13: 47, 14: 46
                }
            },

            {
                name: "Cat Cat Village + Moana Garden",
                rates: {
                    2: 37, 3: 34, 4: 32, 5: 33, 6: 32, 7: 31, 8: 30,
                    9: 29, 10: 28, 11: 27, 12: 26, 13: 25, 14: 24
                }
            },

            {
                name: "Cat Cat Village + Fansipan Cable Car (No Guide)",
                rates: {
                    2: 78, 3: 68, 4: 66, 5: 64, 6: 62, 7: 61, 8: 60,
                    9: 59, 10: 58, 11: 57, 12: 56, 13: 55, 14: 54
                }
            },

            {
                name: "Cat Cat Village + Fansipan Cable Car (With Guide)",
                rates: {
                    2: 97, 3: 79, 4: 77, 5: 73, 6: 71, 7: 70, 8: 68,
                    9: 66, 10: 65, 11: 64, 12: 63, 13: 62, 14: 61
                }
            }

        ],

        sicTours: [],

        localServices: [

            {
                name: "Fansipan Legend Cable Car Ticket",
                adult: 33,
                child: 23
            },

            {
                name: "Fansipan Cable Car + Mono Rail",
                adult: 42,
                child: 32
            },

            {
                name: "Mono Rail Ticket",
                adult: 9,
                child: 9
            },

            {
                name: "Fansipan Peak Rail",
                adult: 7,
                child: 7
            },

            {
                name: "Lunch Buffet - Sun Plaza",
                adult: 12,
                child: 11
            },

            {
                name: "Cable Car + Buffet Combo",
                adult: 44,
                child: 31
            }

        ],

        meals: [

            {
                name: "Indian Meal",
                rates: {
                    2: 19, 3: 19, 4: 18, 5: 18, 6: 17, 7: 17, 8: 16,
                    9: 16, 10: 16, 11: 16, 12: 15, 13: 15, 14: 15
                }
            },

            {
                name: "Dinner Transfer",
                rates: {
                    2: 6, 3: 5, 4: 5, 5: 4, 6: 4, 7: 3, 8: 3,
                    9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3
                }
            }

        ]

    },
    {
        region: "Central Vietnam",

        cities: [
            "Da Nang",
            "Danang",
            "Hoi An",
            "Hue"
        ],

        transfer: [

            {
                name: "Danang Airport → Danang Hotel",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 6, 3: 7, 4: 7, 5: 12, 6: 12, 7: 12, 8: 12,
                    9: 52, 10: 52, 11: 52, 12: 52, 13: 52, 14: 52
                }
            },

            {
                name: "Danang Hotel → Danang Airport",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 6, 3: 7, 4: 7, 5: 12, 6: 12, 7: 12, 8: 12,
                    9: 52, 10: 52, 11: 52, 12: 52, 13: 52, 14: 52
                }
            },

            {
                name: "Danang Airport → Hoi An Hotel",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 10, 3: 12, 4: 12, 5: 22, 6: 22, 7: 22, 8: 22,
                    9: 73, 10: 73, 11: 73, 12: 73, 13: 73, 14: 73
                }
            },

            {
                name: "Hoi An Hotel → Danang Airport",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 10, 3: 12, 4: 12, 5: 22, 6: 22, 7: 22, 8: 22,
                    9: 73, 10: 73, 11: 73, 12: 73, 13: 73, 14: 73
                }
            },

            {
                name: "Danang City → Ba Na Hills",
                vehicle: "04 / 07 Seater",
                rates: {
                    2: 16,
                    3: 18,
                    4: 18
                }
            },

            {
                name: "Ba Na Hills → Danang City",
                vehicle: "04 / 07 Seater",
                rates: {
                    2: 16,
                    3: 18,
                    4: 18
                }
            },

            {
                name: "Danang Airport → Hue",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 52, 3: 54, 4: 54, 5: 88, 6: 88, 7: 88, 8: 88,
                    9: 175, 10: 175, 11: 175, 12: 175, 13: 175, 14: 175
                }
            },

            {
                name: "Hue → Danang Airport",
                vehicle: "04 / 07 / 16 / 29 Seater",
                rates: {
                    2: 52, 3: 54, 4: 54, 5: 88, 6: 88, 7: 88, 8: 88,
                    9: 175, 10: 175, 11: 175, 12: 175, 13: 175, 14: 175
                }
            }

        ],

        privateTours: [

            {
                name: "Ba Na Hills & Golden Bridge PVT (No Lunch)",
                rates: {
                    2: 75, 3: 61, 4: 59, 5: 60, 6: 58, 7: 56, 8: 54,
                    9: 53, 10: 52, 11: 51, 12: 50, 13: 49, 14: 48
                }
            },

            {
                name: "Ba Na Hills & Golden Bridge PVT (With Lunch)",
                rates: {
                    2: 88, 3: 74, 4: 72, 5: 73, 6: 71, 7: 70, 8: 67,
                    9: 66, 10: 65, 11: 64, 12: 63, 13: 62, 14: 61
                }
            },

            {
                name: "Ba Na Hills + Golden Bridge + Hoi An PVT",
                rates: {
                    2: 99, 3: 82, 4: 80, 5: 77, 6: 75, 7: 73, 8: 73,
                    9: 72, 10: 71, 11: 70, 12: 69, 13: 68, 14: 67
                }
            },

            {
                name: "Danang City Tour PVT",
                rates: {
                    2: 43, 3: 29, 4: 27, 5: 26, 6: 24, 7: 22, 8: 20,
                    9: 19, 10: 18, 11: 17, 12: 16, 13: 15, 14: 14
                }
            },

            {
                name: "Coconut Village + Hoi An PVT",
                rates: {
                    2: 48, 3: 35, 4: 33, 5: 31, 6: 29, 7: 28, 8: 26,
                    9: 25, 10: 24, 11: 23, 12: 22, 13: 21, 14: 20
                }
            },

            {
                name: "Marble Mountains + Coconut Village + Hoi An PVT",
                rates: {
                    2: 51, 3: 38, 4: 36, 5: 35, 6: 33, 7: 31, 8: 29,
                    9: 28, 10: 27, 11: 26, 12: 25, 13: 24, 14: 23
                }
            },

            {
                name: "Hue City Tour PVT",
                rates: {}
            }

        ],

        sicTours: [

            {
                name: "Marble Mountain & Hoi An SIC (Local Dinner)",
                price: 22
            },

            {
                name: "Linh Ung Pagoda + Marble Mountain + Hoi An SIC",
                price: 24
            },

            {
                name: "Coconut Forest & Hoi An SIC (Without Lantern Boat)",
                price: 30
            },

            {
                name: "Coconut Forest & Hoi An SIC (With Lantern Boat)",
                price: 33
            },

            {
                name: "Marble Mountain + Coconut Forest + Hoi An SIC",
                price: 32
            },

            {
                name: "Marble Mountain + Coconut Forest + Hoi An SIC (Lantern Boat)",
                price: 35
            },

            {
                name: "Ba Na Hills & Golden Bridge SIC (Without Lunch)",
                price: 46
            },

            {
                name: "Ba Na Hills & Golden Bridge SIC (With Lunch)",
                price: 56
            },

            {
                name: "Hue City Tour SIC (Local Lunch)",
                price: 38
            },

            {
                name: "Cham Island Tour SIC",
                price: 28
            }

        ],

        localServices: [],

        meals: [

            {
                name: "Indian Meal",

                rates: {
                    2: 18,
                    3: 16,
                    4: 16,
                    5: 15,
                    6: 15,
                    7: 16,
                    8: 15,
                    9: 15,
                    10: 15,
                    11: 15,
                    12: 15,
                    13: 14,
                    14: 14
                }

            },

            {

                name: "Dinner Transfer",

                rates: {
                    2: 5,
                    3: 3,
                    4: 3,
                    5: 2,
                    6: 2,
                    7: 3,
                    8: 3,
                    9: 2,
                    10: 2,
                    11: 2,
                    12: 2,
                    13: 2,
                    14: 2
                }

            }

        ]
    },
    {
        region: "South Vietnam",

        cities: [
            "Ho Chi Minh",
            "Ho Chi Minh City",
            "Saigon"
        ],

        transfer: [

            {
                name: "Airport Pickup → Hotel (District 1 & 3)",
                vehicle: "04 / 07 / 16 / 29 Seater",

                rates: {
                    2: 10,
                    3: 11,
                    4: 11,
                    5: 23,
                    6: 23,
                    7: 23,
                    8: 23,
                    9: 75,
                    10: 75,
                    11: 75,
                    12: 75,
                    13: 75,
                    14: 75
                }
            },

            {
                name: "Hotel (District 1 & 3) → Airport",
                vehicle: "04 / 07 / 16 / 29 Seater",

                rates: {
                    2: 10,
                    3: 11,
                    4: 11,
                    5: 23,
                    6: 23,
                    7: 23,
                    8: 23,
                    9: 75,
                    10: 75,
                    11: 75,
                    12: 75,
                    13: 75,
                    14: 75
                }
            }

        ],

        privateTours: [

            {

                name: "Half Day Ho Chi Minh City Tour PVT",

                rates: {
                    2: 55,
                    3: 37,
                    4: 35,
                    5: 31,
                    6: 29,
                    7: 28,
                    8: 27,
                    9: 26,
                    10: 25,
                    11: 24,
                    12: 23,
                    13: 22,
                    14: 21
                }

            },

            {

                name: "Cu Chi Tunnel PVT",

                rates: {
                    2: 63,
                    3: 42,
                    4: 40,
                    5: 37,
                    6: 36,
                    7: 35,
                    8: 33,
                    9: 32,
                    10: 31,
                    11: 30,
                    12: 29,
                    13: 28,
                    14: 27
                }

            },

            {

                name: "Cu Chi Tunnel + Mekong Delta PVT",

                rates: {
                    2: 95,
                    3: 80,
                    4: 78,
                    5: 72,
                    6: 70,
                    7: 68,
                    8: 67,
                    9: 66,
                    10: 65,
                    11: 64,
                    12: 63,
                    13: 62,
                    14: 61
                }

            },

            {

                name: "Half Day City + Cu Chi Tunnel PVT",

                rates: {
                    2: 75,
                    3: 48,
                    4: 46,
                    5: 40,
                    6: 38,
                    7: 36,
                    8: 34,
                    9: 33,
                    10: 32,
                    11: 31,
                    12: 30,
                    13: 29,
                    14: 28
                }

            },

            {

                name: "Mekong Delta Full Day PVT",

                rates: {
                    2: 72,
                    3: 50,
                    4: 48,
                    5: 44,
                    6: 42,
                    7: 40,
                    8: 38,
                    9: 37,
                    10: 36,
                    11: 35,
                    12: 34,
                    13: 33,
                    14: 32
                }

            }

        ],

        sicTours: [

            {
                name: "Half Day Morning City Tour SIC",
                price: 18
            },

            {
                name: "Half Day Afternoon City Tour SIC",
                price: 16
            },

            {
                name: "Full Day City Tour SIC",
                price: 37
            },

            {
                name: "Cu Chi Tunnel Morning SIC",
                price: 17
            },

            {
                name: "Cu Chi Tunnel Afternoon SIC",
                price: 20
            },

            {
                name: "Mekong Delta SIC",
                price: 20
            },

            {
                name: "City + Cu Chi Tunnel SIC",
                price: 38
            },

            {
                name: "Cu Chi + Mekong Delta SIC",
                price: 44
            },

            {
                name: "Vung Tau Tour SIC",
                price: 31
            },

            {
                name: "Cai Be - Tan Phong Island SIC",
                price: 29
            },

            {
                name: "Water Puppet + Dinner Cruise SIC",
                price: 52
            },

            {
                name: "Saigon Dinner Cruise SIC",
                price: 50
            },

            {
                name: "Water Bus + Dinner Cruise by Motorbike SIC",
                price: 58
            }

        ],

        localServices: [],

        meals: [

            {

                name: "Indian Meal",

                rates: {
                    2: 22,
                    3: 19,
                    4: 18,
                    5: 17,
                    6: 17,
                    7: 16,
                    8: 16,
                    9: 16,
                    10: 16,
                    11: 16,
                    12: 16,
                    13: 16,
                    14: 16
                }

            },

            {

                name: "Dinner Transfer",

                rates: {
                    2: 9,
                    3: 6,
                    4: 5,
                    5: 4,
                    6: 4,
                    7: 3,
                    8: 3,
                    9: 3,
                    10: 3,
                    11: 3,
                    12: 3,
                    13: 3,
                    14: 3
                }

            }

        ]

    },
    {
        region: "Phu Quoc",

        cities: [
            "Phu Quoc",
            "Duong Dong",
            "An Thoi",
            "Ganh Dau",
            "Grand World"
        ],

        transfer: [

            {
                name: "Airport ⇄ Duong Dong / Central Area",

                rates: {
                    2: 11,
                    3: 12,
                    4: 12,
                    5: 17,
                    6: 17,
                    7: 17,
                    8: 17,
                    9: 48,
                    10: 48,
                    11: 48,
                    12: 48,
                    13: 48,
                    14: 48
                }

            },

            {
                name: "Airport ⇄ Ganh Dau",

                rates: {
                    2: 23,
                    3: 24,
                    4: 24,
                    5: 32,
                    6: 32,
                    7: 32,
                    8: 32,
                    9: 79,
                    10: 79,
                    11: 79,
                    12: 79,
                    13: 79,
                    14: 79
                }

            },

            {
                name: "Airport ⇄ An Thoi",

                rates: {
                    2: 15,
                    3: 18,
                    4: 18,
                    5: 25,
                    6: 25,
                    7: 25,
                    8: 25,
                    9: 75,
                    10: 75,
                    11: 75,
                    12: 75,
                    13: 75,
                    14: 75
                }

            },

            {
                name: "Grand World Transfer (One Way)",

                rates: {
                    2: 21,
                    3: 21,
                    4: 25,
                    5: 31,
                    6: 31,
                    7: 31,
                    8: 31,
                    9: 49,
                    10: 49,
                    11: 49,
                    12: 49,
                    13: 49,
                    14: 49
                }

            },

            {
                name: "Transfer to Hon Thom Cable Car",

                rates: {
                    2: 20,
                    3: 20,
                    4: 22,
                    5: 30,
                    6: 30,
                    7: 30,
                    8: 30,
                    9: 45,
                    10: 45,
                    11: 45,
                    12: 45,
                    13: 45,
                    14: 45
                }

            }

        ],

        privateTours: [

            {
                name: "VinWonders PVT",

                rates: {
                    2: 58,
                    3: 53,
                    4: 51,
                    5: 52,
                    6: 50,
                    7: 48,
                    8: 47,
                    9: 46,
                    10: 45,
                    11: 44,
                    12: 43,
                    13: 42,
                    14: 41
                }

            },

            {
                name: "Vinpearl Safari PVT",

                rates: {
                    2: 51,
                    3: 44,
                    4: 42,
                    5: 43,
                    6: 41,
                    7: 39,
                    8: 38,
                    9: 37,
                    10: 36,
                    11: 35,
                    12: 34,
                    13: 33,
                    14: 32
                }

            },

            {
                name: "VinWonders + Safari PVT",

                rates: {
                    2: 73,
                    3: 67,
                    4: 65,
                    5: 67,
                    6: 65,
                    7: 64,
                    8: 63,
                    9: 62,
                    10: 62,
                    11: 62,
                    12: 62,
                    13: 61,
                    14: 61
                }

            },

            {
                name: "VinWonders + Safari + Grand World PVT",

                rates: {
                    2: 79,
                    3: 72,
                    4: 69,
                    5: 72,
                    6: 69,
                    7: 67,
                    8: 66,
                    9: 65,
                    10: 64,
                    11: 63,
                    12: 62,
                    13: 61,
                    14: 60
                }

            },

            {
                name: "South Island City Tour PVT",

                rates: {
                    2: 77,
                    3: 36,
                    4: 34,
                    5: 40,
                    6: 38,
                    7: 37,
                    8: 35,
                    9: 34,
                    10: 33,
                    11: 32,
                    12: 31,
                    13: 30,
                    14: 29
                }

            },

            {
                name: "4 Islands + Cable Car PVT",

                rates: {
                    2: 133,
                    3: 87,
                    4: 85,
                    5: 82,
                    6: 80,
                    7: 78,
                    8: 76,
                    9: 75,
                    10: 74,
                    11: 73,
                    12: 72,
                    13: 71,
                    14: 70
                }

            },

            {
                name: "4 Islands Speedboat PVT",

                rates: {
                    2: 104,
                    3: 57,
                    4: 55,
                    5: 50,
                    6: 48,
                    7: 46,
                    8: 45,
                    9: 44,
                    10: 43,
                    11: 42,
                    12: 41,
                    13: 39,
                    14: 38
                }

            },

            {
                name: "Sunset Town + Kiss Bridge + Kiss Of The Sea Show PVT",

                rates: {
                    2: 59,
                    3: 61,
                    4: 54,
                    5: 53,
                    6: 52,
                    7: 51,
                    8: 50,
                    9: 49,
                    10: 48,
                    11: 47,
                    12: 46,
                    13: 45,
                    14: 44
                }

            }

        ],

        sicTours: [

            { name: "South Island SIC", price: 26 },

            { name: "4 Islands Speedboat SIC", price: 25 },

            { name: "4 Islands Cable Car SIC", price: 54 },

            { name: "Fishing & Sunset Town SIC", price: 15 },

            { name: "Sunset Town SIC", price: 14 },

            { name: "Night Squid Fishing SIC", price: 11 },

            { name: "Starfish Beach SIC", price: 62 }

        ],

        localServices: [

            { name: "VinWonders Ticket", adult: 36, child: 28 },

            { name: "Vinpearl Safari Ticket", adult: 32, child: 22 },

            { name: "Grand World Gondola", adult: 9, child: 6 },

            { name: "Teddy Bear Museum", adult: 9, child: 6 },

            { name: "Essence Show", adult: 13, child: 9 },

            { name: "Symphony Of The Sea", adult: 21, child: 20 },

            { name: "Kiss Bridge", adult: 5, child: 5 },

            { name: "Kiss Of The Sea Show", adult: 25, child: 25 },

            { name: "Aquatopia + Cable Car", adult: 30, child: 22 }

        ],

        meals: [

            {

                name: "Indian Meal",

                rates: {
                    2: 19,
                    3: 19,
                    4: 18,
                    5: 18,
                    6: 17,
                    7: 17,
                    8: 16,
                    9: 16,
                    10: 16,
                    11: 16,
                    12: 15,
                    13: 15,
                    14: 15
                }

            },

            {

                name: "Dinner Transfer",

                rates: {
                    2: 6,
                    3: 5,
                    4: 5,
                    5: 4,
                    6: 4,
                    7: 3,
                    8: 3,
                    9: 3,
                    10: 3,
                    11: 3,
                    12: 3,
                    13: 3,
                    14: 3
                }

            }

        ]

    },
];
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {

    await LandService.deleteMany({});

    await LandService.insertMany(landServices);

    console.log("✅ Land Services Seeded Successfully");

    process.exit();

})
.catch(err => {

    console.log(err);

});