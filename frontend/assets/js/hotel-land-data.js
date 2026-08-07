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

        const res = await fetch(CONFIG.API_BASE + "/hotels?destination=Vietnam");

        const result = await res.json();

        console.log(result);
        console.log(result.data);

        if (!result.success) {

            tree.innerHTML = "No Hotel Found";
            return;

        }

        // Backend se array aayega
        const hotels = result.hotels;
        const landRes = await fetch(CONFIG.API_BASE + "/land-services");
        const landResult = await landRes.json();

        if (landResult.success) {
            landData = landResult.data;
        }

        // Tree format banate hain (Region -> City -> Hotels)
        hotelData = {};

        hotels.forEach(hotel => {

            const region = hotel.region || hotel.destination || "Vietnam";

            if (!hotelData[region]) {
                hotelData[region] = {};
            }

            if (!hotelData[region][hotel.city]) {
                hotelData[region][hotel.city] = [];
            }

            hotelData[region][hotel.city].push(hotel);

        });

        console.log(hotelData);

        buildHotelTree(hotelData);

    } catch (err) {

        console.log(err);

        tree.innerHTML = "Unable to load hotels.";

    }

}

function buildHotelTree(hotels) {

    const tree = document.getElementById("hotelTree");
    tree.innerHTML = "";

    Object.keys(hotels).forEach(region => {

        const regionCard = document.createElement("div");
        regionCard.className = "treeRegion";

        const regionHeader = document.createElement("div");
        regionHeader.className = "regionHeader accordion";
        regionHeader.innerHTML = `
            <i class="fa-solid fa-chevron-right arrow"></i>
            ${region}
        `;

        const regionBody = document.createElement("div");
        regionBody.className = "treeBody";

        regionHeader.onclick = () => {
            regionBody.classList.toggle("open");
            regionHeader.querySelector(".arrow").classList.toggle("rotate");
        };

        regionCard.appendChild(regionHeader);
        regionCard.appendChild(regionBody);

        // ================= CITY ====================

        Object.keys(hotels[region]).forEach(city => {

            const cityCard = document.createElement("div");

            const cityHeader = document.createElement("div");
            cityHeader.className = "cityHeader accordion";
            cityHeader.innerHTML = `
                <i class="fa-solid fa-chevron-right arrow"></i>
                ${city}
            `;

            const cityBody = document.createElement("div");
            cityBody.className = "treeBody";

            cityHeader.onclick = () => {
                cityBody.classList.toggle("open");
                cityHeader.querySelector(".arrow").classList.toggle("rotate");
            };

            cityCard.appendChild(cityHeader);
            cityCard.appendChild(cityBody);

            // ================= CATEGORY =================

            const categories = {};

            hotels[region][city].forEach(hotel => {

                const cat = hotel.category || "Others";

                if (!categories[cat]) {
                    categories[cat] = [];
                }

                categories[cat].push(hotel);

            });

            Object.keys(categories).sort().forEach(category => {

                const catCard = document.createElement("div");

                const catHeader = document.createElement("div");
                catHeader.className = "categoryHeader accordion";

                let stars = "";

                if (category.includes("5")) stars = "★★★★★";
                else if (category.includes("4")) stars = "★★★★";
                else if (category.includes("3")) stars = "★★★";
                else if (category.includes("2")) stars = "★★";
                else stars = "★";

                catHeader.innerHTML = `
                    <i class="fa-solid fa-chevron-right arrow"></i>
                    ${stars} (${category})
                `;

                const catBody = document.createElement("div");
                catBody.className = "treeBody";

                catHeader.onclick = () => {
                    catBody.classList.toggle("open");
                    catHeader.querySelector(".arrow").classList.toggle("rotate");
                };

                catCard.appendChild(catHeader);
                catCard.appendChild(catBody);

                // ================= UNIQUE HOTELS =================

                const uniqueHotels = {};

                categories[category].forEach(hotel => {

                    if (!uniqueHotels[hotel.hotelName]) {
                        uniqueHotels[hotel.hotelName] = hotel;
                    }

                });

                Object.values(uniqueHotels).forEach(hotel => {

                    const hotelItem = document.createElement("div");

                    hotelItem.className = "hotelItem";

                    hotelItem.innerHTML = `
                        <i class="fa-solid fa-hotel"></i>
                        <span>${hotel.hotelName}</span>
                    `;

                    hotelItem.onclick = () => {

                        document
                            .querySelectorAll(".hotelItem")
                            .forEach(x => x.classList.remove("active"));

                        hotelItem.classList.add("active");

                        showHotelDetails(hotel);

                    };

                    catBody.appendChild(hotelItem);

                });

                cityBody.appendChild(catCard);

            });

            regionBody.appendChild(cityCard);

        });

        tree.appendChild(regionCard);

    });

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

    // Header
    document.getElementById("hotelTitle").innerText =
        hotel.hotelName;

    document.getElementById("hotelLocation").innerText =
        `${hotel.city} • ${hotel.region}`;

    // Summary Card

    document.getElementById("hotelSummary").innerHTML = `

        <div class="summaryGrid">

            <div class="summaryItem">
                <label>Destination</label>
                <span>${hotel.destination}</span>
            </div>

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
    // ===============================
    // LOCAL SERVICE ADULT / CHILD RATE
    // ===============================

    if (
        type === "Local Service" &&
        service.priceConfig
    ) {

        tbody.innerHTML = `
        <tr>
            <td colspan="5">Adult</td>
            <td colspan="2">$${service.priceConfig.adult}</td>
        </tr>

        <tr>
            <td colspan="5">Child</td>
            <td colspan="2">$${service.priceConfig.child}</td>
        </tr>
    `;

        return;
    }
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

                <button class="editBtn">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="deleteBtn">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        </tr>

        `;

    });

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

    tbody.innerHTML = "";

    // ===============================
    // PER PERSON PRICE
    // ===============================

    if (service.price) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">
                    Per Person
                </td>

                <td>
                    $${service.price}
                </td>

            </tr>

        `;

        return;

    }

    // ===============================
    // RATES OBJECT
    // ===============================

    if (service.rates) {

        Object.keys(service.rates).forEach(pax => {

            tbody.innerHTML += `

                <tr>

                    <td colspan="6">

                        ${pax} Pax

                    </td>

                    <td>

                        $${service.rates[pax]}

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
