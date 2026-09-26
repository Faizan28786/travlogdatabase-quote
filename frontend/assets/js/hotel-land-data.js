document.addEventListener("DOMContentLoaded", () => {
    loadHotels();
});
const hotelTab = document.getElementById("hotelTab");
const landTab = document.getElementById("landTab");

hotelTab.addEventListener("click", () => {

    hotelTab.classList.add("active");
    landTab.classList.remove("active");

    loadHotels();

});

landTab.addEventListener("click", () => {

    landTab.classList.add("active");
    hotelTab.classList.remove("active");

    loadLandServices();

});

let hotelData = {};
let landData = [];

async function loadHotels() {

    const tree = document.getElementById("hotelTree");

    tree.innerHTML = "<div class='loading'>Loading Hotels...</div>";

    try {

        // =========================================
        // LOAD VIETNAM HOTELS
        // =========================================

        const vietnamRes = await fetch(
            CONFIG.API_BASE + "/hotels?destination=Vietnam"
        );

        const vietnamResult = await vietnamRes.json();

        // =========================================
        // LOAD INDIA HOTELS
        // =========================================

        const indiaRes = await fetch(
            CONFIG.API_BASE + "/hotels?destination=India"
        );

        const indiaResult = await indiaRes.json();

        console.log("VIETNAM HOTELS:", vietnamResult);
        console.log("INDIA HOTELS:", indiaResult);

        // =========================================
        // GET ARRAYS
        // =========================================

        const vietnamHotels =
            vietnamResult.hotels ||
            vietnamResult.data ||
            [];

        const indiaHotels =
            indiaResult.hotels ||
            indiaResult.data ||
            [];

        // =========================================
        // LOAD LAND DATA
        // =========================================

        const landRes = await fetch(
            CONFIG.API_BASE + "/land-services"
        );

        const landResult = await landRes.json();

        if (landResult.success) {
            landData = landResult.data;
        }

        // =========================================
        // BUILD VIETNAM DATA
        // SAME STRUCTURE AS BEFORE
        // =========================================

        const vietnamData = {};

        vietnamHotels.forEach(hotel => {

            const region =
                hotel.region ||
                hotel.destination ||
                "Vietnam";

            if (!vietnamData[region]) {
                vietnamData[region] = {};
            }

            if (!vietnamData[region][hotel.city]) {
                vietnamData[region][hotel.city] = [];
            }

            vietnamData[region][hotel.city].push(hotel);

        });

        // =========================================
        // BUILD INDIA DATA
        //
        // India:
        // State -> City -> Hotels
        // =========================================

        const indiaData = {};

        indiaHotels.forEach(hotel => {

            const state =
                hotel.region ||
                "Other";

            if (!indiaData[state]) {
                indiaData[state] = {};
            }

            if (!indiaData[state][hotel.city]) {
                indiaData[state][hotel.city] = [];
            }

            indiaData[state][hotel.city].push(hotel);

        });

        console.log("VIETNAM DATA:", vietnamData);
        console.log("INDIA DATA:", indiaData);

        // =========================================
        // COMBINE DATA FOR HOTEL DETAILS
        // =========================================

        hotelData = {
            ...vietnamData,
            ...indiaData
        };

        console.log("FINAL HOTEL DATA:", hotelData);

        // =========================================
        // BUILD FINAL TREE
        // =========================================

        buildHotelTree(vietnamData, indiaData);

    }

    catch (err) {

        console.error("LOAD HOTEL ERROR:", err);

        tree.innerHTML = "Unable to load hotels.";

    }

}

function buildHotelTree(vietnamHotels, indiaHotels) {

    const tree = document.getElementById("hotelTree");

    tree.innerHTML = "";


    // =====================================================
    // HELPER FUNCTION
    // CREATE CATEGORY / STAR / HOTEL TREE
    // =====================================================

    function buildCityTree(cityBody, hotels) {

        // =========================================
        // CATEGORY
        // =========================================

        const categories = {};

        hotels.forEach(hotel => {

            const cat =
                hotel.category ||
                "Others";

            if (!categories[cat]) {
                categories[cat] = [];
            }

            categories[cat].push(hotel);

        });


        // =========================================
        // SAME CATEGORY ORDER AS EXISTING VIETNAM
        // =========================================

        Object.keys(categories)
            .sort()
            .forEach(category => {

                const catCard =
                    document.createElement("div");

                const catHeader =
                    document.createElement("div");

                catHeader.className =
                    "categoryHeader accordion";


                let stars = "";

                if (category.includes("5")) {
                    stars = "★★★★★";
                }

                else if (category.includes("4")) {
                    stars = "★★★★";
                }

                else if (category.includes("3")) {
                    stars = "★★★";
                }

                else if (category.includes("2")) {
                    stars = "★★";
                }

                else {
                    stars = "★";
                }


                catHeader.innerHTML = `
                    <i class="fa-solid fa-chevron-right arrow"></i>
                    ${stars} (${category})
                `;


                const catBody =
                    document.createElement("div");

                catBody.className =
                    "treeBody";


                catHeader.onclick = () => {

                    catBody.classList.toggle("open");

                    catHeader
                        .querySelector(".arrow")
                        .classList.toggle("rotate");

                };


                catCard.appendChild(catHeader);
                catCard.appendChild(catBody);


                // =========================================
                // UNIQUE HOTELS
                // =========================================

                const uniqueHotels = {};


                categories[category].forEach(hotel => {

                    if (!uniqueHotels[hotel.hotelName]) {

                        uniqueHotels[hotel.hotelName] =
                            hotel;

                    }

                });


                Object.values(uniqueHotels)
                    .forEach(hotel => {

                        const hotelItem =
                            document.createElement("div");

                        hotelItem.className =
                            "hotelItem";


                        hotelItem.innerHTML = `
                            <i class="fa-solid fa-hotel"></i>
                            <span>${hotel.hotelName}</span>
                        `;


                        hotelItem.onclick = () => {

                            document
                                .querySelectorAll(".hotelItem")
                                .forEach(x =>
                                    x.classList.remove("active")
                                );

                            hotelItem.classList.add("active");

                            showHotelDetails(hotel);

                        };


                        catBody.appendChild(hotelItem);

                    });


                cityBody.appendChild(catCard);

            });

    }


    // =====================================================
    // HELPER FUNCTION
    // CREATE REGION -> CITY -> CATEGORY
    // =====================================================

    function createRegion(region, cities) {

        const regionCard =
            document.createElement("div");

        regionCard.className =
            "treeRegion";


        const regionHeader =
            document.createElement("div");

        regionHeader.className =
            "regionHeader accordion";


        regionHeader.innerHTML = `
            <i class="fa-solid fa-chevron-right arrow"></i>
            ${region}
        `;


        const regionBody =
            document.createElement("div");

        regionBody.className =
            "treeBody";


        regionHeader.onclick = () => {

            regionBody.classList.toggle("open");

            regionHeader
                .querySelector(".arrow")
                .classList.toggle("rotate");

        };


        regionCard.appendChild(regionHeader);
        regionCard.appendChild(regionBody);


        // =========================================
        // CITY
        // =========================================

        Object.keys(cities).forEach(city => {

            const cityCard =
                document.createElement("div");


            const cityHeader =
                document.createElement("div");

            cityHeader.className =
                "cityHeader accordion";


            cityHeader.innerHTML = `
                <i class="fa-solid fa-chevron-right arrow"></i>
                ${city}
            `;


            const cityBody =
                document.createElement("div");

            cityBody.className =
                "treeBody";


            cityHeader.onclick = () => {

                cityBody.classList.toggle("open");

                cityHeader
                    .querySelector(".arrow")
                    .classList.toggle("rotate");

            };


            cityCard.appendChild(cityHeader);
            cityCard.appendChild(cityBody);


            // =========================================
            // CITY -> CATEGORY -> HOTEL
            // =========================================

            buildCityTree(
                cityBody,
                cities[city]
            );


            regionBody.appendChild(cityCard);

        });


        return regionCard;

    }


    // =====================================================
    // 1. VIETNAM
    //
    // EXACTLY EXISTING STRUCTURE
    // =====================================================

    Object.keys(vietnamHotels).forEach(region => {

        const regionCard =
            createRegion(
                region,
                vietnamHotels[region]
            );

        tree.appendChild(regionCard);

    });


    // =====================================================
    // 2. INDIA
    //
    // India is ONE main accordion.
    //
    // India
    //   -> Himachal Pradesh
    //       -> Shimla
    //           -> 3 Star
    //           -> 4 Star
    //           -> 5 Star
    //
    //   -> Uttarakhand
    //       -> Nainital
    //       -> Kausani
    // =====================================================

    if (
        indiaHotels &&
        Object.keys(indiaHotels).length > 0
    ) {

        const indiaCard =
            document.createElement("div");

        indiaCard.className =
            "treeRegion";


        const indiaHeader =
            document.createElement("div");

        indiaHeader.className =
            "regionHeader accordion";


        indiaHeader.innerHTML = `
            <i class="fa-solid fa-chevron-right arrow"></i>
            India
        `;


        const indiaBody =
            document.createElement("div");

        indiaBody.className =
            "treeBody";


        indiaHeader.onclick = () => {

            indiaBody.classList.toggle("open");

            indiaHeader
                .querySelector(".arrow")
                .classList.toggle("rotate");

        };


        indiaCard.appendChild(indiaHeader);
        indiaCard.appendChild(indiaBody);


        // =========================================
        // INDIA STATES / REGIONS
        // =========================================

        Object.keys(indiaHotels).forEach(state => {

            const stateCard =
                document.createElement("div");


            const stateHeader =
                document.createElement("div");

            stateHeader.className =
                "cityHeader accordion";


            stateHeader.innerHTML = `
                <i class="fa-solid fa-chevron-right arrow"></i>
                ${state}
            `;


            const stateBody =
                document.createElement("div");

            stateBody.className =
                "treeBody";


            stateHeader.onclick = () => {

                stateBody.classList.toggle("open");

                stateHeader
                    .querySelector(".arrow")
                    .classList.toggle("rotate");

            };


            stateCard.appendChild(stateHeader);
            stateCard.appendChild(stateBody);


            // =========================================
            // STATE -> CITY -> CATEGORY -> HOTEL
            // =========================================

            Object.keys(indiaHotels[state])
                .forEach(city => {

                    const cityCard =
                        document.createElement("div");


                    const cityHeader =
                        document.createElement("div");

                    cityHeader.className =
                        "cityHeader accordion";


                    cityHeader.innerHTML = `
                        <i class="fa-solid fa-chevron-right arrow"></i>
                        ${city}
                    `;


                    const cityBody =
                        document.createElement("div");

                    cityBody.className =
                        "treeBody";


                    cityHeader.onclick = () => {

                        cityBody.classList.toggle("open");

                        cityHeader
                            .querySelector(".arrow")
                            .classList.toggle("rotate");

                    };


                    cityCard.appendChild(cityHeader);
                    cityCard.appendChild(cityBody);


                    // =====================================
                    // CITY -> CATEGORY -> HOTEL
                    // =====================================

                    buildCityTree(
                        cityBody,
                        indiaHotels[state][city]
                    );


                    stateBody.appendChild(cityCard);

                });


            indiaBody.appendChild(stateCard);

        });


        // =========================================
        // INDIA ADDED AFTER VIETNAM
        // =========================================

        tree.appendChild(indiaCard);

    }

}
function buildLandTree(data) {

    const tree = document.getElementById("hotelTree");

    tree.innerHTML = "";

    data.forEach(region => {

        const regionCard = document.createElement("div");
        regionCard.className = "treeRegion";

        const regionHeader = document.createElement("div");
        regionHeader.className = "regionHeader accordion";

        regionHeader.innerHTML = `
            <i class="fa-solid fa-chevron-right arrow"></i>
            ${region.region}
        `;

        const regionBody = document.createElement("div");
        regionBody.className = "treeBody";

        regionHeader.onclick = () => {

            regionBody.classList.toggle("open");
            regionHeader.querySelector(".arrow").classList.toggle("rotate");

        };

        regionCard.appendChild(regionHeader);
        regionCard.appendChild(regionBody);

        // ==========================
        // Cities
        // ==========================

        if (region.cities?.length) {

            const cityTitle = document.createElement("div");
            cityTitle.className = "categoryHeader";
            cityTitle.innerHTML = `<i class="fa-solid fa-location-dot"></i> Cities`;

            regionBody.appendChild(cityTitle);

            region.cities.forEach(city => {

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${city}</span>
                `;

                regionBody.appendChild(item);

            });

        }

        // ==========================
        // Transfers
        // ==========================

        if (region.transfer?.length) {

            const title = document.createElement("div");
            title.className = "categoryHeader";
            title.innerHTML = `
                <i class="fa-solid fa-van-shuttle"></i>
                Transfers
            `;

            regionBody.appendChild(title);

            region.transfer.forEach(service => {
                service._parentId = region._id;

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-car"></i>
                    <span>${service.name}</span>
                `;

                item.onclick = () => {

                    document.querySelectorAll(".hotelItem")
                        .forEach(x => x.classList.remove("active"));

                    item.classList.add("active");

                    showLandDetails(service, "Transfer");

                };

                regionBody.appendChild(item);

            });

        }

        // ==========================
        // Private Tours
        // ==========================

        if (region.privateTours?.length) {

            const title = document.createElement("div");
            title.className = "categoryHeader";
            title.innerHTML = `
                <i class="fa-solid fa-map"></i>
                Private Tours
            `;

            regionBody.appendChild(title);

            region.privateTours.forEach(service => {
                service._parentId = region._id;

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-route"></i>
                    <span>${service.name}</span>
                `;

                item.onclick = () => {

                    document.querySelectorAll(".hotelItem")
                        .forEach(x => x.classList.remove("active"));

                    item.classList.add("active");

                    showLandDetails(service, "Private Tour");

                };

                regionBody.appendChild(item);

            });

        }

        // ==========================
        // SIC Tours
        // ==========================

        if (region.sicTours?.length) {

            const title = document.createElement("div");
            title.className = "categoryHeader";
            title.innerHTML = `
                <i class="fa-solid fa-users"></i>
                SIC Tours
            `;

            regionBody.appendChild(title);

            region.sicTours.forEach(service => {
                service._parentId = region._id;

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-route"></i>
                    <span>${service.name}</span>
                `;

                item.onclick = () => {

                    document.querySelectorAll(".hotelItem")
                        .forEach(x => x.classList.remove("active"));

                    item.classList.add("active");

                    showLandDetails(service, "SIC Tour");

                };

                regionBody.appendChild(item);

            });

        }

        // ==========================
        // Local Services
        // ==========================

        if (region.localServices?.length) {

            const title = document.createElement("div");
            title.className = "categoryHeader";
            title.innerHTML = `
                <i class="fa-solid fa-star"></i>
                Local Services
            `;

            regionBody.appendChild(title);

            region.localServices.forEach(service => {
                service._parentId = region._id;

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${service.name}</span>
                `;

                item.onclick = () => {

                    document.querySelectorAll(".hotelItem")
                        .forEach(x => x.classList.remove("active"));

                    item.classList.add("active");

                    showLandDetails(service, "Local Service");

                };

                regionBody.appendChild(item);

            });

        }

        // ==========================
        // Meals
        // ==========================

        if (region.meals?.length) {

            const title = document.createElement("div");
            title.className = "categoryHeader";
            title.innerHTML = `
                <i class="fa-solid fa-utensils"></i>
                Meals
            `;

            regionBody.appendChild(title);

            region.meals.forEach(service => {
                service._parentId = region._id;

                const item = document.createElement("div");
                item.className = "hotelItem";

                item.innerHTML = `
                    <i class="fa-solid fa-bowl-food"></i>
                    <span>${service.name}</span>
                `;

                item.onclick = () => {

                    document.querySelectorAll(".hotelItem")
                        .forEach(x => x.classList.remove("active"));

                    item.classList.add("active");

                    showLandDetails(service, "Meal");

                };

                regionBody.appendChild(item);

            });

        }

        tree.appendChild(regionCard);

    });

}
// ==========================================
// SHOW HOTEL DETAILS
// ==========================================

function showHotelDetails(hotel) {
    currentSelectedHotel = hotel;

    // Header
    document.getElementById("hotelTitle").innerText =
        hotel.hotelName;

    document.getElementById("hotelLocation").innerText =
        `${hotel.city} • ${hotel.region}`;
    document.getElementById("roomTableHead").innerHTML = `
    <tr>
        <th>
            <div class="roomTypeHeader">
                <span>Room Type</span>

                <button
                    type="button"
                    class="addRoomTypeBtn"
                    id="addRoomTypeBtn">
                    <i class="fa-solid fa-plus"></i>
                    Add Room Type
                </button>
            </div>
        </th>

        <th>Meal</th>
        <th>2D1N</th>
        <th>3D2N</th>
        <th>Extra Bed</th>
        <th>CNB</th>
        <th>Action</th>
    </tr>
`;
    document
        .getElementById("addRoomTypeBtn")
        .addEventListener("click", openAddRoomTypeModal);

    // Summary Card

    document.getElementById("hotelSummary").innerHTML = `

        <div class="summaryGrid">

            <div class="summaryItem">
                <label>Destination</label>
                <span>${hotel.destination}</span>
            </div>

            <div class="summaryItem">
                <label>City</label>
                <span>${hotel.city}</span>
            </div>

            <div class="summaryItem">
                <label>Category</label>
                <span>${hotel.category}</span>
            </div>

            <div class="summaryItem">
                <label>Currency</label>
                <span>${hotel.currency}</span>
            </div>

            <div class="summaryItem">
                <label>Pricing</label>
                <span>${hotel.pricingUnit}</span>
            </div>

            <div class="summaryItem full">
                <label>Note</label>
                <span>${hotel.note || "-"}</span>
            </div>

        </div>

    `;

    // Same Hotel ki saari rooms nikaalo

    let rooms = [];
    const region = hotel.region || "Vietnam";

    hotelData[hotel.region][hotel.city].forEach(r => {

        if (r.hotelName === hotel.hotelName) {

            rooms.push(r);

        }

    });

    rooms.sort((a, b) => a.roomType.localeCompare(b.roomType));

    // Table

    const tbody = document.getElementById("roomTableBody");

    tbody.innerHTML = "";

    rooms.forEach(room => {

        tbody.innerHTML += `

        <tr>

            <td>${room.roomType}</td>

            <td>${room.mealPlan}</td>

            <td>${room.rate2D1N}</td>

            <td>${room.rate3D2N}</td>

            <td>${room.extraBed}</td>

            <td>${room.childNoBed}</td>

            <td>

<button
    class="editBtn"
    data-room-id="${room._id}">
    <i class="fa-solid fa-pen"></i>
</button>

<button
    class="deleteBtn"
    onclick="deleteHotelRoom('${room._id}')">
    <i class="fa-solid fa-trash"></i>
</button>

            </td>

        </tr>

        `;

    });
    document.querySelectorAll(".editBtn").forEach(button => {

        button.addEventListener("click", () => {

            const roomId = button.dataset.roomId;

            const room = rooms.find(
                r => String(r._id) === String(roomId)
            );

            if (!room) {
                alert("Room data not found");
                return;
            }

            console.log("EDIT ROOM:", room);

            openEditRoomModal(room);

        });

    });

}

async function deleteHotelRoom(id) {

    if (!id) {
        alert("Room ID not found");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const res = await fetch(
            CONFIG.API_BASE + "/hotels/" + id,
            {
                method: "DELETE"
            }
        );

        const result = await res.json();

        console.log("DELETE RESULT:", result);

        if (!result.success) {
            alert(result.message || "Failed to delete room");
            return;
        }

        alert("Room deleted successfully");

        // Existing MongoDB data dobara fetch hoga
        await refreshCurrentHotelDetails();

    } catch (error) {

        console.error("Delete room error:", error);

        alert("Unable to delete room");

    }
}
function showLandDetails(service, type) {

    document.getElementById("hotelTitle").innerText = service.name;

    document.getElementById("hotelLocation").innerText = type;

    document.getElementById("hotelSummary").innerHTML = `

        <div class="summaryGrid">

            <div class="summaryItem">
                <label>Service</label>
                <span>${service.name}</span>
            </div>

            <div class="summaryItem">
                <label>Type</label>
                <span>${type}</span>
            </div>

            <div class="summaryItem">
                <label>Vehicle</label>
                <span>${service.vehicle || "-"}</span>
            </div>

            <div class="summaryItem">
                <label>Guide</label>
                <span>${service.guide ? "Included" : "-"}</span>
            </div>

        </div>

    `;

    const tbody = document.getElementById("roomTableBody");
    const tableHead = document.getElementById("roomTableHead");

    tbody.innerHTML = "";

    /* =====================================================
       TABLE HEAD
    ===================================================== */

    if (type === "Transfer") {

        tableHead.innerHTML = `
            <tr>
                <th>Pax</th>
                <th>Price</th>
                <th>Action</th>
            </tr>
        `;

    }

    else if (type === "Private Tour") {

        tableHead.innerHTML = `
            <tr>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Action</th>
            </tr>
        `;

    }

    else if (type === "SIC Tour") {

        tableHead.innerHTML = `
            <tr>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Action</th>
            </tr>
        `;

    }

    else if (type === "Local Service") {
        tableHead.innerHTML = `
        <tr>
            <th>Adult</th>
            <th>Child</th>
            <th>Action</th>
        </tr>
    `;
    }

    else if (type === "Meal") {

        tableHead.innerHTML = `
            <tr>
                <th>Meal</th>
                <th>Adult</th>
                <th>Child</th>
                <th>Action</th>
            </tr>
        `;

    }

    // =========================================
    // LOCAL SERVICE - ADULT / CHILD PRICING
    // =========================================

    if (
        type === "Local Service" &&
        (
            service.adult !== undefined ||
            service.child !== undefined
        )
    ) {

        tbody.innerHTML = `

        <tr>

            <td>
                $${Number(service.adult) || 0}
            </td>

            <td>
                $${Number(service.child) || 0}
            </td>

            <td>

                <button
                    class="editBtn"
                    onclick='openEditLandModal(
                        ${JSON.stringify(service)},
                        "${type}"
                    )'>
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    class="deleteBtn"
                    onclick='deleteLandService(
                        ${JSON.stringify(service)},
                        "${type}"
                    )'>
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        </tr>

    `;

        return;
    }
    /* =====================================================
       PER PERSON PRICE
    ===================================================== */

    if (service.price !== undefined && service.price !== null) {

        tbody.innerHTML = `

            <tr>

                <td>
                    Per Person
                </td>

                <td>
                    $${service.price}
                </td>

                <td>

                    <button
                        class="editBtn"
                        onclick='openEditLandModal(
                            ${JSON.stringify(service)},
                            "${type}",
                            "price"
                        )'>
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="deleteBtn"
                        onclick='deleteLandService(
                            ${JSON.stringify(service)},
                            "${type}"
                        )'>
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>

            </tr>

        `;

        return;
    }


    /* =====================================================
       RATES OBJECT
    ===================================================== */

    if (service.rates) {

        Object.keys(service.rates).forEach(pax => {

            const price = service.rates[pax];

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${pax} Pax
                    </td>

                    <td>
                        $${price}
                    </td>

                    <td>

                        <button
                            class="editBtn"
                            onclick='openEditLandModal(
                                ${JSON.stringify(service)},
                                "${type}",
                                "${pax}"
                            )'>
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="deleteBtn"
                            onclick='deleteLandService(
                                ${JSON.stringify(service)},
                                "${type}",
                                "${pax}"
                            )'>
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>

                </tr>

            `;

        });

    }

}
async function loadLandServices() {

    const tree = document.getElementById("hotelTree");

    tree.innerHTML = "<div class='loading'>Loading Land Services...</div>";

    try {

        const res = await fetch(
            CONFIG.API_BASE + "/master-data/land-services"
        );

        const result = await res.json();

        if (!result.success) {

            tree.innerHTML = "No Land Service Found";

            return;

        }
        window.landData = result.data;
        buildLandTree(result.data);

    }

    catch (err) {

        console.log(err);

        tree.innerHTML = "Unable to load Land Services";

    }

}
console.log("Hotel/Land Master JS Loaded");
const hotelModal = document.getElementById("hotelModal");
const closeHotelModal = document.getElementById("closeHotelModal");
const cancelHotelBtn = document.getElementById("cancelHotelBtn");

document.getElementById("btnAddHotel").addEventListener("click", () => {
    hotelModal.classList.add("open");
});

closeHotelModal.addEventListener("click", () => {
    hotelModal.classList.remove("open");
});

cancelHotelBtn.addEventListener("click", () => {
    hotelModal.classList.remove("open");
});

// =========================================
// DOMESTIC INDIA REGION → CITY DATA
// =========================================

const indiaRegionCities = {

    "Himachal Pradesh": [
        "Shimla",
        "Manali",
        "Dharamshala",
        "Kasol",
        "Kullu",
        "Dalhousie",
        "Amritsar",
        "Tirthan Valley",
        "Jibhi"
    ],

    "Uttarakhand": [
        "Nainital",
        "Kausani",
        "Ranikhet",
        "Corbett",
        "Haridwar",
        "Rishikesh",
        "Auli",
        "Joshimath",
        "Mussoorie",
        "Kanatal",
        "Dehradun"
    ],

    "Rajasthan": [
        "Jaipur",
        "Ranthambore",
        "Pushkar",
        "Bikaner",
        "Jodhpur",
        "Jaisalmer",
        "Udaipur",
        "Kumbhalgarh",
        "Chittorgarh"
    ],

    "Golden Triangle": [
        "Delhi",
        "Agra",
        "Jaipur",
        "Vrindavan",
        "Mathura"
    ]

};


// =========================================
// DESTINATION → REGION → CITY
// =========================================

// =========================================
// DESTINATION → REGION → CITY
// =========================================

const vietnamRegionCities = {

    "North Vietnam": [
        "Hanoi",
        "Ha Long",
        "Ninh Binh",
        "Sapa"
    ],

    "Central Vietnam": [
        "Da Nang",
        "Hoi An",
        "Hue",
        "Quang Binh"
    ],

    "South Vietnam": [
        "Ho Chi Minh City",
        "Mekong Delta",
        "Phu Quoc"
    ]

};


function setupHotelLocationDropdowns() {

    const destinationInput =
        document.getElementById("hotelDestinationInput");

    const regionInput =
        document.getElementById("hotelRegionInput");

    const cityInput =
        document.getElementById("hotelCityInput");


    if (!destinationInput || !regionInput || !cityInput) {
        console.log("Hotel location inputs not found");
        return;
    }


    // =========================================
    // LOAD REGIONS
    // =========================================

    function loadRegions() {

        const destination =
            destinationInput.value.trim().toLowerCase();

        regionInput.innerHTML =
            `<option value="">Select Region</option>`;

        cityInput.innerHTML =
            `<option value="">Select City</option>`;

        cityInput.disabled = true;


        let regionData = {};


        // INDIA
        if (destination === "india") {

            regionData = indiaRegionCities;

        }


        // VIETNAM
        else if (destination === "vietnam") {

            regionData = vietnamRegionCities;

        }


        Object.keys(regionData).forEach(region => {

            const option =
                document.createElement("option");

            option.value = region;
            option.textContent = region;

            regionInput.appendChild(option);

        });

    }


    // =========================================
    // LOAD CITIES
    // =========================================

    function loadCities() {

        const destination =
            destinationInput.value.trim().toLowerCase();

        const region =
            regionInput.value;

        cityInput.innerHTML =
            `<option value="">Select City</option>`;

        let cities = [];


        // INDIA
        if (destination === "india") {

            cities =
                indiaRegionCities[region] || [];

        }


        // VIETNAM
        else if (destination === "vietnam") {

            cities =
                vietnamRegionCities[region] || [];

        }


        console.log(
            "Destination:",
            destination,
            "Region:",
            region,
            "Cities:",
            cities
        );


        cities.forEach(city => {

            const option =
                document.createElement("option");

            option.value = city;
            option.textContent = city;

            cityInput.appendChild(option);

        });


        cityInput.disabled = cities.length === 0;

    }


    // =========================================
    // DESTINATION CHANGE
    // =========================================

    destinationInput.addEventListener(
        "change",
        loadRegions
    );


    // =========================================
    // REGION CHANGE
    // =========================================

    regionInput.addEventListener(
        "change",
        loadCities
    );


    // =========================================
    // INITIAL LOAD
    // =========================================

    loadRegions();

}


setupHotelLocationDropdowns();
// =========================================
// SAVE NEW HOTEL
// =========================================

document.getElementById("saveHotelBtn").addEventListener("click", async () => {

    const saveBtn = document.getElementById("saveHotelBtn");

    const hotelName =
        document.getElementById("hotelNameInput").value.trim();

    const destination =
        document.getElementById("hotelDestinationInput").value.trim();

    const region =
        document.getElementById("hotelRegionInput").value.trim();

    const city =
        document.getElementById("hotelCityInput").value.trim();

    const category =
        document.getElementById("hotelCategoryInput").value.trim();

    const currency =
        document.getElementById("hotelCurrencyInput").value.trim();
    const roomType =
        document.getElementById("hotelRoomTypeInput").value.trim();

    const mealPlan =
        document.getElementById("hotelMealPlanInput").value.trim();

    const rate2D1N =
        Number(document.getElementById("hotelRate2D1NInput").value) || 0;

    const extraBed =
        Number(document.getElementById("hotelExtraBedInput").value) || 0;

    const childNoBed =
        Number(document.getElementById("hotelChildNoBedInput").value) || 0;

    let pricingUnit =
        document.getElementById("hotelPricingUnitInput").value.trim().toLowerCase();

    if (
        pricingUnit === "" ||
        pricingUnit === "0"
    ) {
        pricingUnit = "perRoom";
    }
    else if (
        pricingUnit === "per room / night" ||
        pricingUnit === "per room/night" ||
        pricingUnit === "per night"
    ) {
        pricingUnit = "perNight";
    }
    else if (
        pricingUnit === "per room"
    ) {
        pricingUnit = "perRoom";
    }
    else {
        alert("Pricing Unit must be: Per Room or Per Room / Night");
        document.getElementById("hotelPricingUnitInput").focus();
        return;
    }

    const note =
        document.getElementById("hotelNoteInput").value.trim();


    // =========================================
    // VALIDATION
    // =========================================

    if (!hotelName) {

        alert("Please enter hotel name");

        document.getElementById("hotelNameInput").focus();

        return;
    }


    if (!city) {

        alert("Please enter city");

        document.getElementById("hotelCityInput").focus();

        return;
    }
    if (!roomType) {

        alert("Please enter room type");

        document.getElementById("hotelRoomTypeInput").focus();

        return;
    }


    // =========================================
    // PREVENT DOUBLE CLICK
    // =========================================

    saveBtn.disabled = true;

    saveBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;


    try {

        const response = await fetch(
            CONFIG.API_BASE + "/hotels",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    hotelName,
                    destination,
                    region,
                    city,
                    category,
                    currency,
                    pricingUnit,
                    note,

                    roomType,
                    mealPlan,
                    rate2D1N,
                    extraBed,
                    childNoBed

                })
            }
        );


        const result = await response.json();


        console.log("ADD HOTEL RESULT:", result);


        // =========================================
        // API ERROR
        // =========================================

        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to add hotel"
            );

            return;
        }


        // =========================================
        // SUCCESS
        // =========================================

        alert("Hotel added successfully");


        // Close modal
        hotelModal.classList.remove("open");


        // Clear form
        document.getElementById("hotelNameInput").value = "";
        document.getElementById("hotelRegionInput").value = "";
        document.getElementById("hotelCityInput").value = "";
        document.getElementById("hotelCategoryInput").value = "";
        document.getElementById("hotelCurrencyInput").value = "";
        document.getElementById("hotelRoomTypeInput").value = "";
        document.getElementById("hotelMealPlanInput").value = "CP";
        document.getElementById("hotelRate2D1NInput").value = "0";
        document.getElementById("hotelExtraBedInput").value = "0";
        document.getElementById("hotelChildNoBedInput").value = "0";
        document.getElementById("hotelPricingUnitInput").value = "";
        document.getElementById("hotelNoteInput").value = "";


        // =========================================
        // RELOAD HOTELS
        // =========================================

        await loadHotels();


    } catch (error) {

        console.error("ADD HOTEL ERROR:", error);

        alert(
            "Unable to add hotel. Please check server."
        );


    } finally {

        saveBtn.disabled = false;

        saveBtn.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Save Hotel
        `;

    }

});
hotelModal.addEventListener("click", (e) => {
    if (e.target === hotelModal) {
        hotelModal.classList.remove("open");
    }
});

async function restoreHotelRoom(id) {

    if (!id) {
        alert("Hotel / Room ID not found");
        return;
    }

    const confirmRestore = confirm(
        "Are you sure you want to restore this room?"
    );

    if (!confirmRestore) {
        return;
    }

    try {

        const res = await fetch(
            CONFIG.API_BASE + "/hotels/" + id + "/restore",
            {
                method: "PATCH"
            }
        );

        const result = await res.json();

        console.log("RESTORE RESULT:", result);

        if (!result.success) {
            alert(result.message || "Failed to restore room");
            return;
        }

        alert("Room restored successfully");

        await loadHotels();

    } catch (error) {

        console.error("Restore room error:", error);

        alert("Unable to restore room");

    }
}
document.getElementById("btnRestoreHotel").addEventListener("click", async () => {

    try {

        const res = await fetch(
            CONFIG.API_BASE + "/hotels/inactive"
        );

        const result = await res.json();

        console.log("INACTIVE HOTELS:", result);

        if (!result.success) {
            alert("Unable to load deleted rooms");
            return;
        }

        if (!result.hotels.length) {
            alert("No deleted hotel / room found.");
            return;
        }

        let html = "";

        result.hotels.forEach(hotel => {

            html += `
                <div class="restoreItem">

                    <div>
                        <strong>${hotel.hotelName}</strong>

                        <div>
                            ${hotel.city} •
                            ${hotel.roomType} •
                            ${hotel.mealPlan}
                        </div>
                    </div>

                    <button
                        class="restoreOneBtn"
                        onclick="restoreHotelRoom('${hotel._id}')">

                        <i class="fa-solid fa-rotate-left"></i>
                        Restore

                    </button>

                </div>
            `;

        });

        const modal = document.createElement("div");

        modal.className = "restoreModalOverlay";

        modal.innerHTML = `
            <div class="restoreModal">

                <div class="restoreModalHeader">

                    <h2>Deleted Hotels / Rooms</h2>

                    <button
                        class="restoreCloseBtn"
                        onclick="this.closest('.restoreModalOverlay').remove()">

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>

                <div class="restoreList">

                    ${html}

                </div>

            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error("Load inactive hotels error:", error);

        alert("Unable to load deleted rooms");

    }

});
function openEditRoomModal(room) {

    const modal = document.createElement("div");

    modal.className = "editModalOverlay";

    modal.innerHTML = `
        <div class="editModal">

            <div class="editModalHeader">
                <h2>Edit Hotel / Room</h2>

                <button
                    class="editCloseBtn"
                    onclick="this.closest('.editModalOverlay').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="editForm">

                <div class="formGroup">
                    <label>Hotel Name</label>
                    <input
                        id="editHotelName"
                        type="text"
                        value="${room.hotelName || ""}">
                </div>

                <div class="formGroup">
                    <label>Room Type</label>
                    <input
                        id="editRoomType"
                        type="text"
                        value="${room.roomType || ""}">
                </div>

                <div class="formGroup">
                    <label>Meal Plan</label>
                    <input
                        id="editMealPlan"
                        type="text"
                        value="${room.mealPlan || ""}">
                </div>

                <div class="formGroup">
                    <label>2D1N Rate</label>
                    <input
                        id="editRate2D1N"
                        type="number"
                        min="0"
                        value="${room.rate2D1N ?? 0}">
                </div>

                <div class="formGroup">
                    <label>3D2N Rate</label>
                    <input
                        id="editRate3D2N"
                        type="number"
                        min="0"
                        value="${room.rate3D2N ?? 0}">
                </div>

                <div class="formGroup">
                    <label>Extra Bed</label>
                    <input
                        id="editExtraBed"
                        type="number"
                        min="0"
                        value="${room.extraBed ?? 0}">
                </div>

                <div class="formGroup">
                    <label>Child No Bed</label>
                    <input
                        id="editChildNoBed"
                        type="number"
                        min="0"
                        value="${room.childNoBed ?? 0}">
                </div>

                <div class="formGroup">
                    <label>Currency</label>
                    <input
                        id="editCurrency"
                        type="text"
                        value="${room.currency || "USD"}">
                </div>

                <div class="formGroup full">
                    <label>Note</label>
                    <textarea id="editNote">${room.note || ""}</textarea>
                </div>

            </div>

            <div class="editModalFooter">

                <button
                    class="cancelEditBtn"
                    onclick="this.closest('.editModalOverlay').remove()">
                    Cancel
                </button>

                <button
                    class="saveEditBtn"
                    onclick="saveEditedRoom('${room._id}')">
                    <i class="fa-solid fa-save"></i>
                    Save Changes
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}
async function saveEditedRoom(id) {

    if (!id) {
        alert("Room ID not found");
        return;
    }

    const updatedData = {

        hotelName: document.getElementById("editHotelName").value.trim(),

        roomType: document.getElementById("editRoomType").value.trim(),

        mealPlan: document.getElementById("editMealPlan").value.trim(),

        rate2D1N: Number(
            document.getElementById("editRate2D1N").value
        ) || 0,

        rate3D2N: Number(
            document.getElementById("editRate3D2N").value
        ) || 0,

        extraBed: Number(
            document.getElementById("editExtraBed").value
        ) || 0,

        childNoBed: Number(
            document.getElementById("editChildNoBed").value
        ) || 0,

        currency: document.getElementById("editCurrency").value.trim(),

        note: document.getElementById("editNote").value.trim()

    };

    try {

        const res = await fetch(
            CONFIG.API_BASE + "/hotels/" + id,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify(updatedData)
            }
        );

        const result = await res.json();

        console.log("EDIT RESULT:", result);

        if (!result.success) {

            alert(
                result.message || "Failed to update hotel / room"
            );

            return;
        }

        alert("Hotel / Room updated successfully");

        document
            .querySelector(".editModalOverlay")
            ?.remove();

        // MongoDB se latest data dobara fetch
        await refreshCurrentHotelDetails();

    } catch (error) {

        console.error("Edit hotel / room error:", error);

        alert("Unable to update hotel / room");

    }

}
function openEditLandModal(service, type, pax) {

    const modal = document.createElement("div");

    modal.className = "editModalOverlay";

    // =====================================================
    // LOCAL SERVICE
    // Adult + Child pricing
    // =====================================================

    if (type === "Local Service") {

        modal.innerHTML = `
            <div class="editModal">

                <div class="editModalHeader">

                    <h2>Edit Local Service</h2>

                    <button
                        class="editCloseBtn"
                        type="button"
                        onclick="this.closest('.editModalOverlay').remove()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>


                <div class="editForm">

                    <div class="formGroup">

                        <label>Service Name</label>

                        <input
                            id="editLandServiceName"
                            type="text"
                            value="${service.name || ""}">

                    </div>


                    <div class="formGroup">

                        <label>Adult Rate</label>

                        <input
                            id="editLandAdult"
                            type="number"
                            min="0"
                            value="${Number(service.adult) || 0}">

                    </div>


                    <div class="formGroup">

                        <label>Child Rate</label>

                        <input
                            id="editLandChild"
                            type="number"
                            min="0"
                            value="${Number(service.child) || 0}">

                    </div>

                </div>


                <div class="editModalFooter">

                    <button
                        class="cancelEditBtn"
                        type="button"
                        onclick="this.closest('.editModalOverlay').remove()">

                        Cancel

                    </button>


                    <button
                        class="saveEditBtn"
                        type="button"
                        id="saveLandServiceBtn">

                        <i class="fa-solid fa-save"></i>
                        Save Changes

                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);


        document
            .getElementById("saveLandServiceBtn")
            .addEventListener("click", () => {

                saveEditedLandService(
                    service._parentId,
                    type,
                    service.name,
                    null
                );

            });

        return;
    }


    // =====================================================
    // EXISTING LAND SERVICE
    // Transfer / Private Tour / SIC Tour / Meal
    // =====================================================

    modal.innerHTML = `
        <div class="editModal">

            <div class="editModalHeader">

                <h2>Edit Land Service</h2>

                <button
                    class="editCloseBtn"
                    type="button"
                    onclick="this.closest('.editModalOverlay').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <div class="editForm">

                <div class="formGroup">

                    <label>Service Name</label>

                    <input
                        id="editLandServiceName"
                        type="text"
                        value="${service.name || ""}">

                </div>


                <div class="formGroup">

                    <label>Vehicle</label>

                    <input
                        id="editLandVehicle"
                        type="text"
                        value="${service.vehicle || ""}">

                </div>


                <div class="formGroup">

                    <label>Pax</label>

                    <input
                        id="editLandPax"
                        type="text"
                        value="${pax || ""}">

                </div>


                <div class="formGroup">

                    <label>Price</label>

                    <input
                        id="editLandPrice"
                        type="number"
                        min="0"
                        value="${service.rates?.[pax] ?? service.price ?? 0}">

                </div>

            </div>


            <div class="editModalFooter">

                <button
                    class="cancelEditBtn"
                    type="button"
                    onclick="this.closest('.editModalOverlay').remove()">

                    Cancel

                </button>


                <button
                    class="saveEditBtn"
                    type="button"
                    id="saveLandServiceBtn">

                    <i class="fa-solid fa-save"></i>
                    Save Changes

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    document
        .getElementById("saveLandServiceBtn")
        .addEventListener("click", () => {

            saveEditedLandService(
                service._parentId,
                type,
                service.name,
                pax
            );

        });

}
/* =========================================================
   RELOAD LAND TREE WITHOUT RESETTING LEFT SIDE
========================================================= */
async function reloadLandServicesKeepingState(selectedServiceName = "") {

    const tree = document.getElementById("hotelTree");

    // Save current scroll position
    const scrollTop = tree?.scrollTop || 0;

    // Save currently opened regions
    const openRegions = [];

    tree?.querySelectorAll(".treeRegion").forEach(region => {

        const body = region.querySelector(".treeBody");
        const header = region.querySelector(".regionHeader");

        if (body?.classList.contains("open")) {
            openRegions.push(
                header?.textContent.trim()
            );
        }

    });

    // Reload latest land data
    await loadLandServices();

    // Restore opened regions
    tree?.querySelectorAll(".treeRegion").forEach(region => {

        const body = region.querySelector(".treeBody");
        const header = region.querySelector(".regionHeader");
        const arrow = header?.querySelector(".arrow");

        const regionName = header?.textContent.trim();

        if (openRegions.includes(regionName)) {
            body?.classList.add("open");
            arrow?.classList.add("rotate");
        }

    });

    // Restore selected service
    if (selectedServiceName) {

        const items = tree?.querySelectorAll(".hotelItem");

        items?.forEach(item => {

            const text =
                item.querySelector("span")?.textContent.trim();

            if (text === selectedServiceName) {

                items.forEach(x =>
                    x.classList.remove("active")
                );

                item.classList.add("active");

            }

        });

    }

    // Restore scroll position
    if (tree) {
        tree.scrollTop = scrollTop;
    }
}
async function saveEditedLandService(
    id,
    type,
    oldServiceName,
    oldPax
) {

    // =====================================================
    // COMMON
    // =====================================================

    const serviceName =
        document.getElementById("editLandServiceName")
            ?.value
            .trim() || "";


    if (!id) {

        alert("Land service ID not found");

        return;

    }


    // =====================================================
    // LOCAL SERVICE
    // Adult + Child
    // =====================================================

    if (type === "Local Service") {

        const adult =
            document.getElementById("editLandAdult")
                ?.value;


        const child =
            document.getElementById("editLandChild")
                ?.value;


        console.log(
            "SAVE LOCAL SERVICE:",
            {
                id,
                type,
                oldServiceName,
                serviceName,
                adult,
                child
            }
        );


        try {

            const res = await fetch(

                CONFIG.API_BASE +
                "/land-services/" +
                id,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        type: type,

                        serviceName:
                            serviceName,

                        oldServiceName:
                            oldServiceName,

                        adult:
                            Number(adult) || 0,

                        child:
                            Number(child) || 0

                    })

                }

            );


            const result =
                await res.json();


            console.log(
                "LOCAL SERVICE EDIT RESULT:",
                result
            );


            if (!res.ok || !result.success) {

                alert(
                    result.message ||
                    "Failed to update local service"
                );

                return;

            }


            // Close modal
            document
                .querySelector(".editModalOverlay")
                ?.remove();


            // Reload data without resetting left side
            await reloadLandServicesKeepingState(serviceName);


            alert(
                "Local service updated successfully"
            );


        } catch (error) {

            console.error(
                "SAVE LOCAL SERVICE ERROR:",
                error
            );


            alert(
                "Unable to update local service"
            );

        }


        return;
    }


    // =====================================================
    // EXISTING LAND SERVICE
    // Transfer / Private / SIC / Meal
    // =====================================================

    const vehicle =
        document.getElementById("editLandVehicle")
            ?.value
            .trim() || "";


    const pax =
        document.getElementById("editLandPax")
            ?.value
            .trim() || "";


    const price =
        document.getElementById("editLandPrice")
            ?.value || 0;


    console.log(
        "SAVE LAND SERVICE:",
        {

            id,

            type,

            oldServiceName,

            serviceName,

            vehicle,

            oldPax,

            pax,

            price

        }
    );


    try {

        const res = await fetch(

            CONFIG.API_BASE +
            "/land-services/" +
            id,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    type: type,

                    serviceName:
                        serviceName,

                    oldServiceName:
                        oldServiceName,

                    vehicle:
                        vehicle,

                    oldPax:
                        oldPax,

                    pax:
                        pax,

                    price:
                        price

                })

            }

        );


        const result =
            await res.json();


        console.log(
            "LAND EDIT RESULT:",
            result
        );


        if (!res.ok || !result.success) {

            alert(
                result.message ||
                "Failed to update land service"
            );

            return;

        }


        // Close edit modal
        document
            .querySelector(".editModalOverlay")
            ?.remove();


        // Reload existing land data without resetting left side
        await reloadLandServicesKeepingState(serviceName);


        alert(
            "Land service updated successfully"
        );


    } catch (error) {

        console.error(
            "SAVE LAND SERVICE ERROR:",
            error
        );


        alert(
            "Unable to update land service"
        );

    }

}
// ==========================================
// UNIVERSAL MARGIN
// ==========================================

const marginBtn = document.getElementById("marginBtn");
const marginModal = document.getElementById("marginModal");
const closeMarginModal = document.getElementById("closeMarginModal");
const cancelMarginBtn = document.getElementById("cancelMarginBtn");
const saveMarginBtn = document.getElementById("saveMarginBtn");
const universalMarginInput = document.getElementById("universalMarginInput");


// OPEN MARGIN MODAL
if (marginBtn) {

    marginBtn.addEventListener("click", async () => {

        try {

            const res = await fetch(
                CONFIG.API_BASE + "/settings"
            );

            const result = await res.json();

            console.log("SETTINGS:", result);

            if (!result.success) {
                alert("Unable to load margin.");
                return;
            }

            universalMarginInput.value =
                Number(result.settings?.universalMargin || 0);

            window.universalMargin =
                Number(result.settings?.universalMargin || 0);

            marginModal.style.display = "flex";

        } catch (error) {

            console.error("LOAD MARGIN ERROR:", error);

            alert("Unable to load margin.");

        }

    });

}


// CLOSE MARGIN MODAL
if (closeMarginModal) {

    closeMarginModal.addEventListener("click", () => {

        marginModal.style.display = "none";

    });

}


if (cancelMarginBtn) {

    cancelMarginBtn.addEventListener("click", () => {

        marginModal.style.display = "none";

    });

}


// SAVE MARGIN
if (saveMarginBtn) {

    saveMarginBtn.addEventListener("click", async () => {

        const margin =
            Number(universalMarginInput.value) || 0;

        if (margin < 0) {

            alert("Margin cannot be negative.");
            return;

        }

        try {

            const res = await fetch(
                CONFIG.API_BASE + "/settings",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        universalMargin: margin
                    })
                }
            );

            const result = await res.json();

            console.log("SAVED SETTINGS:", result);

            if (!result.success) {

                alert("Unable to save margin.");
                return;

            }

            universalMarginInput.value =
                Number(result.settings?.universalMargin || 0);

            window.universalMargin =
                Number(result.settings?.universalMargin || 0);

            marginModal.style.display = "none";

            alert("Universal margin saved successfully.");

        } catch (error) {

            console.error("SAVE MARGIN ERROR:", error);

            alert("Unable to save margin.");

        }

    });

}
// ==========================================
// ADD ROOM TYPE TO EXISTING HOTEL
// ==========================================

function openAddRoomTypeModal() {

    if (!currentSelectedHotel) {

        alert("Please select a hotel first.");

        return;
    }

    // Prevent duplicate modal
    document
        .querySelector(".addRoomModalOverlay")
        ?.remove();

    const hotel = currentSelectedHotel;

    const modal = document.createElement("div");

    modal.className = "addRoomModalOverlay";

    modal.innerHTML = `

        <div class="addRoomModal">

            <div class="addRoomModalHeader">

                <div>
                    <h2>Add Room Type</h2>

                    <p>
                        ${hotel.hotelName}
                    </p>
                </div>

                <button
                    type="button"
                    class="addRoomCloseBtn"
                    onclick="this.closest('.addRoomModalOverlay').remove()">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div class="addRoomForm">

                <div class="roomFormGroup">

                    <label>Room Type</label>

                    <input
                        id="newRoomType"
                        type="text"
                        placeholder="e.g. Superior"
                        autocomplete="off">

                </div>


                <div class="roomFormGroup">

                    <label>Meal Plan</label>

                    <input
                        id="newRoomMealPlan"
                        type="text"
                        value="CP"
                        placeholder="e.g. CP">

                </div>


                <div class="roomFormGroup">

                    <label>2D1N Rate</label>

                    <input
                        id="newRoomRate2D1N"
                        type="number"
                        min="0"
                        value="0">

                </div>


                <div class="roomFormGroup">

                    <label>3D2N Rate</label>

                    <input
                        id="newRoomRate3D2N"
                        type="number"
                        min="0"
                        value="0">

                </div>


                <div class="roomFormGroup">

                    <label>Extra Bed</label>

                    <input
                        id="newRoomExtraBed"
                        type="number"
                        min="0"
                        value="0">

                </div>


                <div class="roomFormGroup">

                    <label>Child No Bed</label>

                    <input
                        id="newRoomChildNoBed"
                        type="number"
                        min="0"
                        value="0">

                </div>

            </div>


            <div class="addRoomModalFooter">

                <button
                    type="button"
                    class="cancelRoomBtn"
                    onclick="this.closest('.addRoomModalOverlay').remove()">

                    Cancel

                </button>


                <button
                    type="button"
                    class="saveRoomBtn"
                    id="saveNewRoomBtn">

                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Room

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    // Focus room type
    document
        .getElementById("newRoomType")
        .focus();


    document
        .getElementById("saveNewRoomBtn")
        .addEventListener(
            "click",
            saveNewRoomType
        );


    // Close when clicking outside
    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            modal.remove();

        }

    });

}


// ==========================================
// SAVE NEW ROOM TYPE
// ==========================================

async function saveNewRoomType() {

    if (!currentSelectedHotel) {

        alert("Hotel not selected.");

        return;
    }


    const hotel = currentSelectedHotel;


    const roomType =
        document
            .getElementById("newRoomType")
            ?.value
            .trim();


    const mealPlan =
        document
            .getElementById("newRoomMealPlan")
            ?.value
            .trim() || "CP";


    const rate2D1N =
        Number(
            document
                .getElementById("newRoomRate2D1N")
                ?.value
        ) || 0;


    const rate3D2N =
        Number(
            document
                .getElementById("newRoomRate3D2N")
                ?.value
        ) || 0;


    const extraBed =
        Number(
            document
                .getElementById("newRoomExtraBed")
                ?.value
        ) || 0;


    const childNoBed =
        Number(
            document
                .getElementById("newRoomChildNoBed")
                ?.value
        ) || 0;


    // =========================================
    // VALIDATION
    // =========================================

    if (!roomType) {

        alert("Please enter room type.");

        document
            .getElementById("newRoomType")
            .focus();

        return;
    }


    const saveBtn =
        document.getElementById("saveNewRoomBtn");


    saveBtn.disabled = true;

    saveBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;


    try {

        // IMPORTANT:
        // Existing hotel information is automatically
        // copied from currently selected hotel.

        const roomData = {

            hotelName: hotel.hotelName,

            destination: hotel.destination,

            region: hotel.region,

            city: hotel.city,

            category: hotel.category,

            currency: hotel.currency,

            pricingUnit: hotel.pricingUnit,

            note: hotel.note || "",

            roomType: roomType,

            mealPlan: mealPlan,

            rate2D1N: rate2D1N,

            rate3D2N: rate3D2N,

            extraBed: extraBed,

            childNoBed: childNoBed

        };


        console.log(
            "ADDING ROOM TO EXISTING HOTEL:",
            roomData
        );


        const response =
            await fetch(
                CONFIG.API_BASE + "/hotels",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(roomData)

                }
            );


        const result =
            await response.json();


        console.log(
            "ADD ROOM RESULT:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Failed to add room."
            );

            return;
        }


        alert(
            "Room type added successfully."
        );


        // Close modal
        document
            .querySelector(".addRoomModalOverlay")
            ?.remove();


        // =========================================
        // RELOAD HOTELS
        // =========================================

        await refreshCurrentHotelDetails();



    } catch (error) {

        console.error(
            "ADD ROOM ERROR:",
            error
        );

        alert(
            "Unable to add room. Please check server."
        );


    } finally {

        const btn =
            document.getElementById(
                "saveNewRoomBtn"
            );

        if (btn) {

            btn.disabled = false;

            btn.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Room
            `;

        }

    }

}
async function refreshCurrentHotelDetails() {

    if (!currentSelectedHotel) return;

    try {
        const res = await fetch(
            CONFIG.API_BASE + "/hotels?destination=Vietnam"
        );

        const result = await res.json();

        if (!result.success) return;

        const latestHotels = result.hotels || [];

        const hotelName = currentSelectedHotel.hotelName;
        const city = currentSelectedHotel.city;
        const region =
            currentSelectedHotel.region ||
            currentSelectedHotel.destination ||
            "Vietnam";

        const latestRooms = latestHotels.filter(hotel =>
            hotel.hotelName === hotelName &&
            hotel.city === city &&
            (hotel.region || hotel.destination || "Vietnam") === region
        );

        if (!hotelData[region]) {
            hotelData[region] = {};
        }

        if (!hotelData[region][city]) {
            hotelData[region][city] = [];
        }

        hotelData[region][city] =
            hotelData[region][city].filter(
                hotel => hotel.hotelName !== hotelName
            );

        hotelData[region][city].push(...latestRooms);

        if (latestRooms.length > 0) {
            currentSelectedHotel = latestRooms[0];
        }

        showHotelDetails(currentSelectedHotel);

    } catch (error) {
        console.error("Refresh current hotel error:", error);
    }
}