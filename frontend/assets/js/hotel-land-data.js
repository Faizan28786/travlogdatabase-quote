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

    // Header
    document.getElementById("hotelTitle").innerText =
        hotel.hotelName;

    document.getElementById("hotelLocation").innerText =
        `${hotel.city} • ${hotel.region}`;
    document.getElementById("roomTableHead").innerHTML = `
    <tr>
        <th>Room Type</th>
        <th>Meal</th>
        <th>2D1N</th>
        <th>3D2N</th>
        <th>Extra Bed</th>
        <th>CNB</th>
        <th>Action</th>
    </tr>
`;

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
        await loadHotels();

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

    const pricingUnit =
        document.getElementById("hotelPricingUnitInput").value.trim();

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
                    "Content-Type": "application/json"
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
        await loadHotels();

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


            // Reload data
            await loadLandServices();


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


        // Reload existing land data
        await loadLandServices();


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