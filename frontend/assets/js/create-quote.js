const API_BASE = CONFIG.API_BASE + "/quote-data";
const HOTEL_API = CONFIG.HOTEL_API;
const EXPORT_API = CONFIG.EXPORT_API;

/* =========================================================
   ELEMENTS
========================================================= */
const optionTabs = document.getElementById("optionTabs");
const addOptionBtn = document.getElementById("addOptionBtn");
const quoteNoEl = document.getElementById("quoteNo");

const countryEl = document.getElementById("country");
const travelDateEl = document.getElementById("travelDate");

const adultsEl = document.getElementById("adults");
const childWithBedEl = document.getElementById("childWithBed");
const childWithoutBedEl = document.getElementById("childWithoutBed");
const childWithBedAgeEl = document.getElementById("childWithBedAge");
const childWithoutBedAgeEl = document.getElementById("childWithoutBedAge");
const roomsEl = document.getElementById("rooms");
const landChildEl = document.getElementById("landChild");
const landChildAgeEl = document.getElementById("landChildAge");

const pickupVehicleEl = document.getElementById("pickupVehicle");
const dropVehicleEl = document.getElementById("dropVehicle");

const addSegmentBtn = document.getElementById("addSegmentBtn");
const segmentsContainer = document.getElementById("segmentsContainer");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const saveQuoteBtn = document.getElementById("saveQuoteBtn");
const previewBtn = document.getElementById("previewBtn");
const addLandPartBtn = document.getElementById("addLandPartBtn");

const totalPaxInputEl = document.getElementById("totalPax");
const summaryTotalPaxEl = document.getElementById("summaryTotalPax");
const summaryTotalNightsEl = document.getElementById("summaryTotalNights");
const summaryTotalRoomsEl = document.getElementById("summaryTotalRooms");
const hotelCostEl = document.getElementById("hotelCost");
const landCostEl = document.getElementById("landCost");
const landChildCostEl =
  document.getElementById("landChildCost");
const landChildBreakdownEl =
  document.getElementById("landChildBreakdown");
const transferCostEl = document.getElementById("transferCost");
const grandTotalEl = document.getElementById("grandTotal");


const previewBox = document.getElementById("previewBox");

let landChildAge = "";
/* ======================================
   MULTI OPTION SYSTEM
====================================== */

let quoteOptions = [];

let currentOption = 0;
/* ==========================================
   OPTION MANAGEMENT
========================================== */

function getCurrentQuoteData() {

  return {

    adults: adultsEl.value,
    rooms: roomsEl.value,

    childWithBed: childWithBedEl.value,
    childWithoutBed: childWithoutBedEl.value,
    childWithoutBedAge: childWithoutBedAgeEl.value,

    travelDate: travelDateEl.value,
    country: countryEl.value,

    // ===== LAND SERVICES SAVE =====
    landServices: getLandServicesData(),

    segments: [...segmentsContainer.querySelectorAll(".city-segment")].map(seg => ({

      city: seg.querySelector(".segment-city")?.value || "",
      mealPlan: seg.querySelector(".segment-meal-plan")?.value || "",
      hotel: seg.querySelector(".segment-hotel")?.value || "",
      roomType: seg.querySelector(".segment-room-type")?.value || "",
      checkIn: seg.querySelector(".segment-checkin")?.value || "",
      checkOut: seg.querySelector(".segment-checkout")?.value || "",
      nights: seg.querySelector(".segment-nights")?.value || "1"

    }))

  };

}
function restoreQuoteData(data) {

  if (!data) return;

  segmentCounter = 0;

  adultsEl.value = data.adults || 0;
  roomsEl.value = data.rooms || 1;

  childWithBedEl.value = data.childWithBed || 0;
  childWithoutBedEl.value = data.childWithoutBed || 0;
  childWithoutBedAgeEl.value = data.childWithoutBedAge || "";

  travelDateEl.value = data.travelDate || "";
  countryEl.value = data.country || "";

  segmentsContainer.innerHTML = "";

  data.segments.forEach(seg => {

    createSegment(seg);

  });

  // Restore saved land services
  window.restoredLandServices = data.landServices || [];

  calculateQuote();

}
function saveCurrentOption() {

  quoteOptions[currentOption].data = getCurrentQuoteData();

}
function switchOption(index) {

  // Current option save
  saveCurrentOption();

  // Current preview bhi save
  buildPreview();

  currentOption = index;

  // Active tab
  document.querySelectorAll(".option-tab").forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });

  // Restore selected option
  restoreQuoteData(quoteOptions[index].data);

  // Preview refresh
  buildPreview();

}
function renderOptionTabs() {

  optionTabs.innerHTML = "";

  quoteOptions.forEach((option, index) => {

    const btn = document.createElement("button");

    btn.className = `option-tab ${index === currentOption ? "active" : ""}`;

    btn.innerText = option.title;

    btn.onclick = () => switchOption(index);

    optionTabs.appendChild(btn);

  });

}
function addNewOption() {

  // Current option save
  saveCurrentOption();

  buildPreview();

  const clone = structuredClone(quoteOptions[currentOption].data);

  quoteOptions.push({

    id: quoteOptions.length + 1,

    title: `Option ${quoteOptions.length + 1}`,

    data: clone

  });

  currentOption = quoteOptions.length - 1;

  renderOptionTabs();

  restoreQuoteData(quoteOptions[currentOption].data);

  buildPreview();

}
/* =====================================
   AUTO EXTRA PERSON CALCULATION
===================================== */

function updateExtraPerson() {

  const adults = Number(adultsEl.value) || 0;

  const rooms = Number(roomsEl.value) || 1;

  const allowedAdults = rooms * 2;

  const extraPersons = Math.max(0, adults - allowedAdults);

  // sirf tab update karo jab value change ho
  if (Number(childWithBedEl.value) !== extraPersons) {

    childWithBedEl.value = extraPersons;

    // calculate everything again
    calculateQuote();

  }

}
adultsEl.addEventListener("input", updateExtraPerson);

roomsEl.addEventListener("input", updateExtraPerson);
updateExtraPerson();
/* ===========================
   Universal Arrival Date
=========================== */

if (travelDateEl) {

  travelDateEl.addEventListener("change", function () {

    const firstCheckIn = document.querySelector(".segment-checkin");

    if (!firstCheckIn) return;

    firstCheckIn.value = this.value;

    firstCheckIn.dispatchEvent(new Event("change", {
      bubbles: true
    }));

  });

}
/* ACTION BUTTONS */

// const generatePdfBtn = document.getElementById("generatePdfBtn");
// const generateWordBtn = document.getElementById("generateWordBtn");
// const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");
// const shareEmailBtn = document.getElementById("shareEmailBtn");

/* =========================================================
   MODAL
========================================================= */

const quoteActionModal = document.getElementById("quoteActionModal");

const closeQuoteModalBtn = document.getElementById("closeQuoteModal");

const cancelQuoteActionBtn = document.getElementById("cancelQuoteAction");

const confirmQuoteActionBtn = document.getElementById("confirmQuoteAction");

const quoteModalTitleEl = document.getElementById("quoteModalTitle");

const quoteModalSubtextEl = document.getElementById("quoteModalSubtext");

const quoteModalPreviewEl = document.getElementById("quoteModalPreview");

/* =========================================================
   STATE
========================================================= */
let masterData = null;
let allHotels = [];
let currentCountryHotels = [];

let currentHotelCost = 0;
let currentTransferCost = 0;
let currentGrandTotal = 0;
let lastSavedQuote = null;
let currentLandCost = 0;
/* ===========================
   CHILD AGE HISTORY
=========================== */

let cnbAgeHistory = [];
let cwbAgeHistory = [];

let segmentCounter = 0;
let currentModalAction = null;

function updateChildHistory(history, count, age) {

  // Child increase
  if (count > history.length) {

    history.push(age);

  }

  // Child decrease
  else if (count < history.length) {

    history.splice(count);

  }

}
/* =========================================================
   CHILD AGE / CHARGE RULES
========================================================= */
function getChildChargeConfig() {

  const cwb = Number(childWithBedEl?.value || 0);
  const lca = Number(landChildEl?.value || 0);

  return {
    cwbAge: childWithBedAgeEl?.value || "4-10",
    cnbAge: childWithoutBedAgeEl?.value || "4-10",

    // Child With Bed + Land Child
    cwbCount: cwb + lca,

    cnbCount: Number(childWithoutBedEl?.value || 0)
  };

}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  generateQuoteNo();

  await loadCountryData(countryEl?.value || "Vietnam");
  await loadHotelsFromDB(countryEl?.value || "Vietnam");

  bindTopLevelEvents();

  if (segmentsContainer && !segmentsContainer.children.length) {
    createSegment();
  }

  calculateQuote();

  quoteOptions.push({
    id: 1,
    title: "Option 1",
    data: getCurrentQuoteData()   // <-- pehla option turant save ho jayega
  });
  if (addOptionBtn) {

    addOptionBtn.addEventListener("click", addNewOption);

  }
  renderOptionTabs();
  quoteOptions[0].data = getCurrentQuoteData();

  addOptionBtn.addEventListener("click", addNewOption);
});

/* =========================================================
   EVENT BINDING
========================================================= */
function bindTopLevelEvents() {
  countryEl?.addEventListener("change", async () => {
    await loadCountryData(countryEl.value);
    await loadHotelsFromDB(countryEl.value);

    const segmentEls = [...document.querySelectorAll(".city-segment")];
    if (!segmentEls.length) {
      createSegment();
    } else {
      segmentEls.forEach(seg => hydrateSegment(seg));
    }

    calculateQuote();
  });

  adultsEl?.addEventListener("input", calculateQuote);
  childWithBedEl?.addEventListener("input", calculateQuote);
  childWithoutBedEl?.addEventListener("input", () => {

    const count = Number(childWithoutBedEl.value || 0);

    updateChildHistory(
      cnbAgeHistory,
      count,
      childWithoutBedAgeEl.value
    );

    // Naya child add hua to age dobara select karni padegi
    if (count > cnbAgeHistory.length - 1) {
      childWithoutBedAgeEl.value = "";
    }

    calculateQuote();

  });
  childWithoutBedAgeEl?.addEventListener("change", () => {

    if (cnbAgeHistory.length > 0) {

      cnbAgeHistory[cnbAgeHistory.length - 1] =
        childWithoutBedAgeEl.value;

    }

    console.log("CNB History :", cnbAgeHistory);

    calculateQuote();

  });
  childWithoutBedAgeEl?.addEventListener("change", calculateQuote);

  landChildEl?.addEventListener("input", () => {

    const count = Number(landChildEl.value || 0);

    updateChildHistory(
      cwbAgeHistory,
      count,
      landChildAgeEl.value
    );

    // New child add hua to age dobara select karni padegi
    if (count > cwbAgeHistory.length - 1) {

      landChildAgeEl.value = "";

    }

    calculateQuote();
    buildPreview();   // <-- add this

  });

  landChildAgeEl?.addEventListener("change", () => {

    if (cwbAgeHistory.length > 0) {

      cwbAgeHistory[cwbAgeHistory.length - 1] =
        landChildAgeEl.value;

    }

    console.log("LCA History :", cwbAgeHistory);

    document.querySelectorAll(".land-service").forEach(select => {

      if (select.value) {

        select.dispatchEvent(new Event("change"));

      }

    });

    calculateQuote();
    buildPreview();

  });

  travelDateEl?.addEventListener("change", buildPreview);

  pickupVehicleEl?.addEventListener("change", calculateQuote);
  dropVehicleEl?.addEventListener("change", calculateQuote);

  addSegmentBtn?.addEventListener("click", () => {
    createSegment();
    calculateQuote();
  });

  calculateBtn?.addEventListener("click", calculateQuote);
  previewBtn?.addEventListener("click", buildPreview);

  resetBtn?.addEventListener("click", async () => {
    await resetForm();
  });

  saveQuoteBtn?.addEventListener("click", saveQuote);

  // =============================
  // LAND PART
  // =============================

  const addLandPartBtn = document.getElementById("addLandPartBtn");
  const landPartContainer = document.getElementById("landPartContainer");

  let landPartInitialized = false;

  addLandPartBtn?.addEventListener("click", () => {

    if (!landPartInitialized) {

      createLandPartUI();

      landPartInitialized = true;

    }

    landPartContainer.style.display = "block";

  });
  function createLandPartUI() {

    landPartContainer.innerHTML = `

        <div class="card land-card">

            <div class="card-header">

                <div class="card-header-icon purple">
                    <i class="fa-solid fa-map-location-dot"></i>
                </div>

                <div>

                    <h3>Land Package</h3>

                    <p>Select sightseeing, transfers and meals.</p>

                </div>

            </div>

            <div class="land-layout">
            <div id="landDaysContainer" class="land-grid"></div>


</div>

        </div>

    `;
    renderLandDays();
  }
  // generatePdfBtn?.addEventListener("click", handlePdfClick);
  // generateWordBtn?.addEventListener("click", handleWordClick);
  // shareWhatsappBtn?.addEventListener("click", handleWhatsappClick);
  // shareEmailBtn?.addEventListener("click", handleEmailClick);
  document.addEventListener("click", function (e) {

    if (e.target.closest("#previewPdfBtn")) {
      handlePreviewPdfClick();
    }

    if (e.target.closest("#previewWordBtn")) {
      handleWordClick();
    }

    if (e.target.closest("#previewWhatsappBtn")) {
      handleWhatsappClick();
    }

    if (e.target.closest("#previewEmailBtn")) {
      handleEmailClick();
    }

  });
  closeQuoteModalBtn?.addEventListener("click", closeQuoteModal);
  cancelQuoteActionBtn?.addEventListener("click", closeQuoteModal);

  quoteActionModal?.addEventListener("click", (e) => {
    if (e.target === quoteActionModal) closeQuoteModal();
  });
}

/* =========================================================
   QUOTE NO
========================================================= */
function generateQuoteNo() {
  const random = Math.floor(10000 + Math.random() * 90000);
  if (quoteNoEl) quoteNoEl.textContent = `TLN${random}`;
}

/* =========================================================
   LOAD MASTER DATA
========================================================= */
async function loadCountryData(country) {
  try {
    const res = await fetch(`${API_BASE}/master/${encodeURIComponent(country)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load country data");
    }

    masterData = data;
    populateVehicles();
  } catch (err) {
    console.log("LOAD COUNTRY DATA ERROR:", err);
    masterData = null;
    populateVehicles();
  }
}

/* =========================================================
   LOAD HOTELS
========================================================= */
async function loadHotelsFromDB(country) {
  try {
    let res = await fetch(`${HOTEL_API}?destination=${encodeURIComponent(country)}`);
    let data = await res.json();

    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      res = await fetch(HOTEL_API);
      data = await res.json();
    }

    let hotels = [];
    if (Array.isArray(data)) {
      hotels = data;
    } else if (data && Array.isArray(data.hotels)) {
      hotels = data.hotels;
    }

    const selectedCountry = String(country || "").trim().toLowerCase();

    allHotels = hotels.map(h => ({
      ...h,
      _id: h._id || h.id || "",
      destination: String(h.destination || "").trim(),
      city: String(h.city || "").trim(),
      hotelName: String(h.hotelName || "").trim(),
      category: String(h.category || "").trim(),
      roomType: String(h.roomType || "").trim(),
      mealPlan: String(h.mealPlan || "CP").trim(),
      displayName: String(h.displayName || h.hotelName || "").trim()
    }));

    currentCountryHotels = allHotels.filter(h => {
      const dest = String(h.destination || "").trim().toLowerCase();
      return dest === selectedCountry;
    });

    if (!currentCountryHotels.length && allHotels.length) {
      console.warn("No destination-matched hotels found. Falling back to all hotels.");
      currentCountryHotels = [...allHotels];
    }

    console.log("ALL HOTELS:", allHotels);
    console.log("CURRENT COUNTRY HOTELS:", currentCountryHotels);
  } catch (err) {
    console.log("LOAD HOTELS ERROR:", err);
    allHotels = [];
    currentCountryHotels = [];
  }
}

/* =========================================================
   VEHICLES
========================================================= */
function populateVehicles() {
  if (!pickupVehicleEl || !dropVehicleEl) return;

  pickupVehicleEl.innerHTML = `<option value="">Select Pickup Vehicle</option>`;
  dropVehicleEl.innerHTML = `<option value="">Select Drop Vehicle</option>`;

  if (!masterData?.vehicles?.length) return;

  masterData.vehicles.forEach(vehicle => {
    const text = `${vehicle.name} (${formatCurrency(vehicle.price || 0)})`;

    const pickupOpt = document.createElement("option");
    pickupOpt.value = vehicle.id;
    pickupOpt.textContent = text;
    pickupVehicleEl.appendChild(pickupOpt);

    const dropOpt = document.createElement("option");
    dropOpt.value = vehicle.id;
    dropOpt.textContent = text;
    dropVehicleEl.appendChild(dropOpt);
  });
}

/* =========================================================
   SEGMENT TEMPLATE
========================================================= */
function createSegment(segmentData = null) {
  if (!segmentsContainer) return;

  segmentCounter += 1;

  const segment = document.createElement("div");
  segment.className = "city-segment";
  segment.dataset.segmentId = segmentCounter;

  segment.innerHTML = `
    <div class="segment-head">
      <div class="segment-title-wrap">
        <div class="segment-badge">${segmentCounter}</div>
<div class="segment-title-content">
  <div>
    <h4>City Segment ${segmentCounter}</h4>
    <p>Select city, hotel, room type and number of nights for this stay.</p>
  </div>

  <div class="segment-date-range">
    <div class="segment-date-box">
      <label>Check In</label>
      <input type="date" class="segment-checkin">
    </div>

    <div class="segment-date-box">
      <label>Check Out</label>
      <input type="date" class="segment-checkout">
    </div>
  </div>
</div>
      </div>
      <button type="button" class="segment-remove-btn">
        <i class="fa-solid fa-trash"></i> Remove
      </button>
    </div>

    <div class="segment-fields-grid compact">
      <div class="field">
        <label>City</label>
        <div class="input-wrap">
          <i class="fa-solid fa-location-dot"></i>
          <select class="segment-city"></select>
        </div>
      </div>

      <div class="field">
        <label>Meal Plan</label>
        <div class="input-wrap">
          <i class="fa-solid fa-utensils"></i>
          <select class="segment-meal-plan">
            <option value="CP" selected>CP</option>
            <option value="MAP">MAP</option>
            <option value="AP">AP</option>
          </select>
        </div>
      </div>

      <div class="field field-span-2">
        <label>Hotel</label>
        <div class="input-wrap">
          <i class="fa-solid fa-building"></i>
          <select class="segment-hotel"></select>
        </div>
      </div>

      <div class="field">
        <label>Room Type</label>
        <div class="input-wrap">
          <i class="fa-solid fa-door-open"></i>
          <select class="segment-room-type"></select>
        </div>
      </div>

      <div class="field">
        <label>Nights</label>
        <div class="input-wrap">
          <i class="fa-solid fa-moon"></i>
          <input type="number" class="segment-nights" min="1" value="1" />
        </div>
      </div>
    </div>

  `;

  segmentsContainer.appendChild(segment);
  if (segmentData) {
    segment.restoreData = segmentData;
  }
  hydrateSegment(segment);
  // Restore previous values if data exists

  const removeBtn = segment.querySelector(".segment-remove-btn");
  removeBtn?.addEventListener("click", () => {
    const allSegments = document.querySelectorAll(".city-segment");
    if (allSegments.length <= 1) {
      alert("At least one city segment is required.");
      return;
    }

    segment.remove();
    renumberSegments();
    calculateQuote();
  });

  return segment;
}

/* =========================================================
   HYDRATE SEGMENT
========================================================= */
function hydrateSegment(segmentEl) {
  const citySelect = segmentEl.querySelector(".segment-city");
  const hotelSelect = segmentEl.querySelector(".segment-hotel");
  const roomTypeSelect = segmentEl.querySelector(".segment-room-type");
  const mealPlanSelect = segmentEl.querySelector(".segment-meal-plan");
  const nightsInput = segmentEl.querySelector(".segment-nights");
  const checkInInput = segmentEl.querySelector(".segment-checkin");
  const checkOutInput = segmentEl.querySelector(".segment-checkout");

  populateSegmentCities(citySelect);

  if (!citySelect.value && citySelect.options.length > 0) {
    const firstValid = [...citySelect.options].find(o => o.value);
    if (firstValid) citySelect.value = firstValid.value;
  }

  populateSegmentHotels(segmentEl);
  populateSegmentRoomTypes(segmentEl);

  citySelect?.addEventListener("change", () => {
    populateSegmentHotels(segmentEl);
    populateSegmentRoomTypes(segmentEl);

    calculateQuote();
    renderLandDays();
  });

  hotelSelect?.addEventListener("change", () => {
    populateSegmentRoomTypes(segmentEl);

    calculateQuote();
    renderLandDays();
  });

  roomTypeSelect?.addEventListener("change", () => {
    calculateQuote();
    renderLandDays();
  });
  mealPlanSelect?.addEventListener("change", () => {
    calculateQuote();
    renderLandDays();
  });

  // First segment ke check-in change hone par dates recalculate
  checkInInput?.addEventListener("change", () => {
    updateSegmentDates();

    calculateQuote();
    renderLandDays();
  });

  // Nights change hone par checkout bhi recalculate
  nightsInput?.addEventListener("input", () => {
    updateSegmentDates();

    calculateQuote();
    renderLandDays();
  });
  /* =========================
   Restore Saved Option
========================= */

  if (segmentEl.restoreData) {

    const d = segmentEl.restoreData;

    citySelect.value = d.city || "";

    populateSegmentHotels(segmentEl);

    hotelSelect.value = d.hotel || "";

    populateSegmentRoomTypes(segmentEl);

    roomTypeSelect.value = d.roomType || "";

    mealPlanSelect.value = d.mealPlan || "CP";

    nightsInput.value = d.nights || 1;


    checkInInput.value = d.checkIn || "";

    checkOutInput.value = d.checkOut || "";

    calculateQuote();

  }
}

/* =========================================================
   SEGMENT POPULATORS
========================================================= */
function getCountryCities() {
  const cities = [
    ...new Set(
      currentCountryHotels
        .map(h => String(h.city || "").trim())
        .filter(Boolean)
    )
  ];

  return cities.sort((a, b) => a.localeCompare(b));
}

function populateSegmentCities(citySelect) {
  if (!citySelect) return;

  const prev = citySelect.value || "";
  const cities = getCountryCities();

  citySelect.innerHTML = `<option value="">Select City</option>`;

  cities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });

  if (cities.includes(prev)) {
    citySelect.value = prev;
  } else if (cities.length) {
    citySelect.value = cities[0];
  }
}

function populateSegmentHotels(segmentEl) {
  const citySelect = segmentEl.querySelector(".segment-city");
  const hotelSelect = segmentEl.querySelector(".segment-hotel");

  if (!citySelect || !hotelSelect) return;

  const selectedCity = String(citySelect.value || "").trim().toLowerCase();
  const prevHotelName = hotelSelect.value || "";

  let hotels = [...currentCountryHotels];

  if (selectedCity) {
    hotels = hotels.filter(
      h => String(h.city || "").trim().toLowerCase() === selectedCity
    );
  }

  // unique hotel names only
  const uniqueHotelsMap = new Map();
  hotels.forEach(h => {
    const hotelName = String(h.hotelName || "").trim();
    if (!hotelName) return;

    if (!uniqueHotelsMap.has(hotelName)) {
      uniqueHotelsMap.set(hotelName, h);
    }
  });

  const uniqueHotels = [...uniqueHotelsMap.values()].sort((a, b) =>
    String(a.hotelName || "").localeCompare(String(b.hotelName || ""))
  );

  hotelSelect.innerHTML = `<option value="">Select Hotel</option>`;

  uniqueHotels.forEach(hotel => {

    const opt = document.createElement("option");

    opt.value = hotel.hotelName;

    opt.textContent =
      `${hotel.displayName || hotel.hotelName} (${hotel.category || "Hotel"})`;

    // ye baad me preview ke kaam aayega
    opt.dataset.category = hotel.category || "";

    hotelSelect.appendChild(opt);

  });

  if (uniqueHotels.some(h => h.hotelName === prevHotelName)) {
    hotelSelect.value = prevHotelName;
  } else if (uniqueHotels.length) {
    hotelSelect.value = uniqueHotels[0].hotelName;
  }
}

function populateSegmentRoomTypes(segmentEl) {
  const citySelect = segmentEl.querySelector(".segment-city");
  const hotelSelect = segmentEl.querySelector(".segment-hotel");
  const roomTypeSelect = segmentEl.querySelector(".segment-room-type");

  if (!citySelect || !hotelSelect || !roomTypeSelect) return;

  const city = String(citySelect.value || "").trim().toLowerCase();
  const hotelName = String(hotelSelect.value || "").trim().toLowerCase();
  const prevRoomType = roomTypeSelect.value || "";

  roomTypeSelect.innerHTML = `<option value="">Select Room Type</option>`;

  if (!hotelName) return;

  const matchingRows = currentCountryHotels.filter(h =>
    String(h.city || "").trim().toLowerCase() === city &&
    String(h.hotelName || "").trim().toLowerCase() === hotelName
  );

  const uniqueRoomTypes = [
    ...new Set(
      matchingRows
        .map(h => String(h.roomType || "").trim())
        .filter(Boolean)
    )
  ];

  uniqueRoomTypes.forEach(roomType => {
    const opt = document.createElement("option");
    opt.value = roomType;
    opt.textContent = roomType;
    roomTypeSelect.appendChild(opt);
  });

  if (uniqueRoomTypes.includes(prevRoomType)) {
    roomTypeSelect.value = prevRoomType;
  } else if (uniqueRoomTypes.length) {
    roomTypeSelect.value = uniqueRoomTypes[0];
  }
}

/* =========================================================
   HELPERS FOR HOTEL PRICING
========================================================= */
function getPerNightRate(hotel) {
  const r2 = Number(hotel?.rate2D1N);
  const r3 = Number(hotel?.rate3D2N);

  if (!Number.isNaN(r2) && r2 > 0) return r2;
  if (!Number.isNaN(r3) && r3 > 0) return r3 / 2;

  return null;
}

function getHotelRateForNights(hotel, nights) {
  const n = Math.max(1, Number(nights || 0));
  const perNight = getPerNightRate(hotel);

  if (perNight === null) return 0;
  return perNight * n;
}

function getHotelChildNoBedRate(hotel) {
  const n = Number(hotel?.childNoBed);
  return !Number.isNaN(n) ? n : 0;
}

function getHotelExtraBedRate(hotel) {
  const val = hotel?.extraBed ?? 0;
  const n = Number(val);
  return !Number.isNaN(n) ? n : 0;
}

/* =========================================================
   GET MATCHED HOTEL ROW
========================================================= */
function getSelectedHotelRow(segmentEl) {
  const city = (segmentEl.querySelector(".segment-city")?.value || "").trim().toLowerCase();
  const hotelName = (segmentEl.querySelector(".segment-hotel")?.value || "").trim().toLowerCase();
  const roomType = (segmentEl.querySelector(".segment-room-type")?.value || "").trim().toLowerCase();
  const mealPlan = (segmentEl.querySelector(".segment-meal-plan")?.value || "CP").trim().toLowerCase();

  if (!hotelName) return null;

  // 1) exact city + hotel + room + meal
  let row = currentCountryHotels.find(h =>
    String(h.city || "").trim().toLowerCase() === city &&
    String(h.hotelName || "").trim().toLowerCase() === hotelName &&
    String(h.roomType || "").trim().toLowerCase() === roomType &&
    String(h.mealPlan || "CP").trim().toLowerCase() === mealPlan
  );
  if (row) return row;

  // 2) city + hotel + room
  row = currentCountryHotels.find(h =>
    String(h.city || "").trim().toLowerCase() === city &&
    String(h.hotelName || "").trim().toLowerCase() === hotelName &&
    String(h.roomType || "").trim().toLowerCase() === roomType
  );
  if (row) return row;

  // 3) city + hotel
  row = currentCountryHotels.find(h =>
    String(h.city || "").trim().toLowerCase() === city &&
    String(h.hotelName || "").trim().toLowerCase() === hotelName
  );

  console.log({
    city,
    hotelName,
    roomType,
    mealPlan,
    selectedHotel: row
  });
  return row || null;
}

/* =========================================================
   SEGMENT COST
========================================================= */
function calculateSegmentCost(segmentEl) {
  const hotelSelect = segmentEl.querySelector(".segment-hotel");
  const nightsInput = segmentEl.querySelector(".segment-nights");

  const baseCostEl = segmentEl.querySelector(".segment-base-cost");
  const childWithBedCostEl = segmentEl.querySelector(".segment-child-with-bed-cost");
  const childWithoutBedCostEl = segmentEl.querySelector(".segment-child-without-bed-cost");
  const totalNightsEl = segmentEl.querySelector(".segment-total-nights");
  const totalCostEl = segmentEl.querySelector(".segment-total-cost");

  const selectedHotel = getSelectedHotelRow(segmentEl);
  console.log("SELECTED HOTEL :", selectedHotel);
  console.log("EXTRA BED :", selectedHotel?.extraBed);
  console.log("CHILD NO BED :", selectedHotel?.childNoBed);
  console.log("CHILD CONFIG :", getChildChargeConfig());
  const nights = Math.max(1, Number(nightsInput?.value || 1));
  const rooms = 1;

  let baseHotelCost = 0;
  let childWithBedCharges = 0;
  let childWithoutBedCharges = 0;
  let rateUnavailable = false;

  let landChildNoBedRate = 0;
  let landChildWithBedRate = 0;

  if (selectedHotel) {
    const perNight = getPerNightRate(selectedHotel);

    if (perNight === null) {

      rateUnavailable = true;

    } else {

      // Room Cost
      baseHotelCost =
        (perNight * nights * rooms) / 2;

    }

    const childConfig = getChildChargeConfig();
    const extraBedRate = getHotelExtraBedRate(selectedHotel);
    const childNoBedRate = getHotelChildNoBedRate(selectedHotel);
    // Land service ka total per person
    const landPerPerson = calculateLandCost();

    // Child Without Bed (Land)
    landChildNoBedRate = 0;

    cnbAgeHistory.forEach(age => {

      if (age === "0-3") return;

      let percent = 1;

      if (age === "4-6") percent = 0.5;
      else if (age === "7-9") percent = 0.8;

      landChildNoBedRate += landPerPerson * percent;

    });

    // Child With Bed LCA (Land)
    landChildWithBedRate = 0;

    cwbAgeHistory.forEach(age => {

      let percent = 1;

      if (age === "4-6") percent = 0.5;
      else if (age === "7-9") percent = 0.8;

      landChildWithBedRate += landPerPerson * percent;

    });

    // Child With Bed
    if (childConfig.cwbCount > 0) {
      childWithBedCharges = extraBedRate * childConfig.cwbCount * nights;
    }

    // Child Without Bed
    if (childConfig.cnbAge === "0-3") {

      childWithoutBedCharges = 0;

    } else {

      childWithoutBedCharges =
        childNoBedRate *
        childConfig.cnbCount *
        nights;

    }
  }

  const childCharges = childWithBedCharges + childWithoutBedCharges;
  const segmentTotal = baseHotelCost + childCharges;

  if (baseCostEl) {
    baseCostEl.textContent = rateUnavailable ? "Rate N/A" : formatCurrency(baseHotelCost);
    baseCostEl.classList.toggle("rate-unavailable", rateUnavailable);
  }

  if (childWithBedCostEl) {
    childWithBedCostEl.textContent = formatCurrency(childWithBedCharges);
  }

  if (childWithoutBedCostEl) {
    childWithoutBedCostEl.textContent = formatCurrency(childWithoutBedCharges);
  }

  if (totalNightsEl) totalNightsEl.textContent = String(nights || 0);
  if (totalCostEl) totalCostEl.textContent = rateUnavailable ? "Rate N/A" : formatCurrency(segmentTotal);

  return {
    city: segmentEl.querySelector(".segment-city")?.value || "",
    mealPlan: segmentEl.querySelector(".segment-meal-plan")?.value || "CP",
    hotelId: selectedHotel?._id || selectedHotel?.id || "",
    hotelName: selectedHotel?.hotelName || "",
    hotelCategory: selectedHotel?.category || "",
    roomType: segmentEl.querySelector(".segment-room-type")?.value || "",
    nights,
    baseHotelCost,
    childWithBedCharges,
    childWithoutBedCharges,
    childCharges,
    landChildNoBedRate,
    landChildWithBedRate,
    total: segmentTotal,
    rateUnavailable
  };
}
/* ===========================
   CHILD AGE HISTORY HELPERS
=========================== */

function updateAgeHistory(history, count, currentAge) {

  // Child badh gaya
  if (count > history.length) {

    history.push(currentAge || "");

  }

  // Child kam hua
  else if (count < history.length) {

    history.splice(count);

  }

}
function resetAgeDropdown(select) {

  select.value = "";
}
/* =========================================================
   CALCULATE QUOTE
========================================================= */
function calculateQuote() {
  const adults = Number(adultsEl?.value || 0);
  const childWithBed = Number(childWithBedEl?.value || 0);
  const childWithoutBed = Number(childWithoutBedEl?.value || 0);
  const landChild = Number(landChildEl?.value || 0);

  const totalPax =
    adults +
    childWithoutBed +
    landChild;

  if (totalPaxInputEl) totalPaxInputEl.value = totalPax;
  if (summaryTotalPaxEl) summaryTotalPaxEl.textContent = totalPax;

  const segmentEls = [...document.querySelectorAll(".city-segment")];

  let totalHotelCost = 0;
  let totalSegmentNights = 0;
  let totalRooms = 0;

  segmentEls.forEach(segmentEl => {

    const segmentData = calculateSegmentCost(segmentEl);

    totalHotelCost += segmentData.total;

    totalSegmentNights += Number(segmentData.nights || 0);

    totalRooms = Number(roomsEl?.value || 1);

  });

  let transferCost = 0;
  let landCost = 0;
  let landChildCost = 0;
  if (masterData?.vehicles?.length) {
    if (pickupVehicleEl?.value) {
      const pickupVehicle = masterData.vehicles.find(v => String(v.id) === String(pickupVehicleEl.value));
      if (pickupVehicle) transferCost += Number(pickupVehicle.price || 0);
    }

    if (dropVehicleEl?.value) {
      const dropVehicle = masterData.vehicles.find(v => String(v.id) === String(dropVehicleEl.value));
      if (dropVehicle) transferCost += Number(dropVehicle.price || 0);
    }
  }
  // Land Cost
  if (typeof calculateLandCost === "function") {

    landCost = calculateLandCost();

  }
  const landChildData = calculateLandChildCost();

  landChildCost = landChildData.total;
  const grandTotal = totalHotelCost + transferCost + landCost + landChildCost;

  currentHotelCost = totalHotelCost;
  currentTransferCost = transferCost;
  currentGrandTotal = grandTotal;
  currentLandCost = landCost;

  if (summaryTotalNightsEl) summaryTotalNightsEl.textContent = totalSegmentNights;
  if (summaryTotalRoomsEl) summaryTotalRoomsEl.textContent = totalRooms;
  if (hotelCostEl) hotelCostEl.textContent = formatCurrency(totalHotelCost);
  if (transferCostEl) transferCostEl.textContent = formatCurrency(transferCost);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  updateSegmentDates();
  if (quoteOptions[currentOption]) {

    quoteOptions[currentOption].data = getCurrentQuoteData();

  }
  if (landCostEl) {
    landCostEl.textContent = formatCurrency(currentLandCost);
  }
  if (landChildCostEl) {

    landChildCostEl.textContent =
      formatCurrency(landChildData.total);

  }

  if (landChildBreakdownEl) {

    landChildBreakdownEl.textContent =
      landChildData.breakdown.join(" + ") +
      " = " +
      formatCurrency(landChildData.total);

  }
  buildPreview();
  // renderLandDays();
}


/* Update segment*/


function updateSegmentDates() {

  const segments = [...document.querySelectorAll(".city-segment")];

  let previousCheckout = null;

  segments.forEach((segment, index) => {

    const checkIn = segment.querySelector(".segment-checkin");
    const checkOut = segment.querySelector(".segment-checkout");
    const nights = Math.max(1, Number(segment.querySelector(".segment-nights")?.value || 1));

    if (!checkIn || !checkOut) return;

    // FIRST SEGMENT
    if (index === 0) {

      checkIn.disabled = false;

      if (!checkIn.value) {
        previousCheckout = null;
        return;
      }

    } else {

      if (previousCheckout) {
        checkIn.value = previousCheckout;
      }

      checkIn.disabled = true;
    }

    const inDate = new Date(checkIn.value);

    if (isNaN(inDate.getTime())) {
      previousCheckout = null;
      return;
    }

    const outDate = new Date(inDate);

    // Checkout = Checkin + Nights
    outDate.setDate(outDate.getDate() + nights);

    checkOut.value = outDate.toISOString().split("T")[0];
    checkOut.disabled = true;

    previousCheckout = checkOut.value;
  });

}
/* =========================================================
   GET SEGMENTS DATA
========================================================= */
function getAllSegmentsData() {
  const adults = Number(adultsEl?.value || 0);
  const childWithBed = Number(childWithBedEl?.value || 0);
  const childWithoutBed = Number(childWithoutBedEl?.value || 0);
  const totalPax = adults + childWithBed + childWithoutBed;

  const segmentEls = [...document.querySelectorAll(".city-segment")];

  return segmentEls.map((segmentEl, idx) => {
    const data = calculateSegmentCost(segmentEl);
    return {
      segmentNo: idx + 1,
      ...data
    };
  });
}

/* =========================================================
   BUILD PREVIEW
========================================================= */
function buildPreview() {

  if (!previewBox) return;


  const quoteNo = quoteNoEl?.textContent || "-";
  const country = countryEl?.value || "-";
  const travelDate = travelDateEl?.value || "-";

  const adults = Number(adultsEl?.value || 0);
  const childWithBed = Number(childWithBedEl?.value || 0);
  const childWithoutBed = Number(childWithoutBedEl?.value || 0);
  const landChild = Number(landChildEl?.value || 0);

  console.log("childWithBed =", childWithBed);
  console.log("landChild =", landChild);
  const totalPax = adults + childWithBed + childWithoutBed;

  const cwbAge = childWithBedAgeEl?.value || "-";
  const cnbAge =
    cnbAgeHistory.length
      ? cnbAgeHistory
        .map((age, index) => `Child ${index + 1}: ${age}`)
        .join(", ")
      : "-";

  const pickupText =
    pickupVehicleEl?.selectedOptions?.[0]?.textContent ||
    "Select Pickup Vehicle";

  const dropText =
    dropVehicleEl?.selectedOptions?.[0]?.textContent ||
    "Select Drop Vehicle";

  const segments = getAllSegmentsData();

  let totalPerPerson = 0;
  let totalExtraPerson = 0;
  let totalChildNoBed = 0;
  let totalLandExtraPerson = 0;
  let totalLandChildNoBed = 0;
  let whatsappNotes = "";

  segments.forEach(seg => {

    totalPerPerson += Number(seg.baseHotelCost || 0);

    totalExtraPerson += Number(seg.childWithBedCharges || 0);

    totalChildNoBed += Number(seg.childWithoutBedCharges || 0);

  });
  const landChildData = calculateLandChildCost();

  totalLandExtraPerson = landChildData.cwbTotal;

  totalLandChildNoBed = landChildData.cnbTotal;
  const hotelExtraRate =
    childWithBed > 0
      ? totalExtraPerson / childWithBed
      : 0;

  const landExtraRate =
    landChild > 0
      ? totalLandExtraPerson / landChild
      : 0;
  /* ===========================
     ACCOMMODATION
  ============================ */

  let accommodationHtml = `
        <div class="preview-accommodation">
            <h3>ACCOMMODATION</h3>
    `;

  const checkInInputs = document.querySelectorAll(".segment-checkin");
  const checkOutInputs = document.querySelectorAll(".segment-checkout");

  segments.forEach((seg, index) => {

    const checkIn = checkInInputs[index]?.value || "";
    const checkOut = checkOutInputs[index]?.value || "";

    const dateText =
      checkIn && checkOut
        ? `(${formatDate(checkIn)} - ${formatDate(checkOut)})`
        : "";

    accommodationHtml += `
            <div class="preview-accommodation-item">

                <div class="preview-night-city">
                    <strong>${seg.nights}nt</strong>
                    ${dateText}
                    <strong>${seg.city}</strong>
                </div>

                <div class="preview-hotel-name">
                    ${seg.hotelName || "-"}
                    ${seg.hotelCategory ? ` (${seg.hotelCategory})` : ""}
                </div>

                <div class="preview-room-type">
                    ${seg.roomType || "-"}
                </div>

                <div class="preview-meal-plan">
                    Meal Plan : ${seg.mealPlan || "-"}
                </div>

            </div>
        `;
  });

  accommodationHtml += `</div>`;
  let quotationAccommodation = "";

  segments.forEach((seg, index) => {

    const checkIn = checkInInputs[index]?.value || "";
    const checkOut = checkOutInputs[index]?.value || "";

    let dateLine = "";

    if (checkIn && checkOut) {

      dateLine = `(${formatDate(checkIn)}-${formatDate(checkOut)})`;

    }

    quotationAccommodation += `

<div class="quotation-row">

    <div class="quotation-city">

        <strong>${seg.nights}nt</strong>
        ${dateLine}
        <strong>${seg.city}</strong>
        -
        <strong>
        ${seg.hotelName || "-"}
        ${seg.hotelCategory ? ` (${seg.hotelCategory})` : ""}
        </strong>
        ${seg.roomType ? " / " + seg.roomType : ""}

    </div>

</div>

`;

  });
  let itineraryHtml = "";

  const landServices = getLandServicesData();

  if (landServices.length > 0) {

    itineraryHtml = `

<div class="quotation-section-title">
    <strong>DAY WISE BRIEF ITINERARY</strong>
</div>

<div class="quotation-package">

`;

    const groupedDays = {};

    landServices.forEach(service => {

      if (!groupedDays[service.day]) {
        groupedDays[service.day] = [];
      }

      groupedDays[service.day].push(service.service);

    });

    const firstDate =
      document.querySelector(".segment-checkin")?.value;

    Object.keys(groupedDays).forEach(day => {

      let currentDate = "";

      if (firstDate) {

        const d = new Date(firstDate);

        d.setDate(d.getDate() + (Number(day) - 1));

        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();

        currentDate = `${dd}-${mm}-${yyyy}`;

      }

      itineraryHtml += `

<div class="package-row">

    <span>
        <strong>DAY ${day} (${currentDate}):</strong>
    </span>

    <span class="package-value">
        ${groupedDays[day].join(" + ")}
    </span>

</div>

`;

    });

    itineraryHtml += `

</div>

`;

  }
  const optionTitle = quoteOptions[currentOption]?.title || "Option 1";
  const previewHtml = `

<div class="quotation-document">

    <!-- OPTION -->
    <div class="quotation-title">
        <h2>${optionTitle.toUpperCase()}</h2>
    </div>

    <!-- ACCOMMODATION -->
<div class="quotation-section-title">
    <strong>ACCOMMODATION</strong>
</div>

    <div class="quotation-accommodation">

        ${quotationAccommodation}

    </div>

<!-- PACKAGE -->
<div class="quotation-section-title">
    <strong>PACKAGE COST</strong>
</div>

<div class="quotation-package">

    <div class="package-row">
        <span>Price Per Person:</span>

        <span class="package-value">
            <strong>
                ${formatCurrency(totalPerPerson)} Per Pax
            </strong>
        </span>
    </div>

    <div class="package-row">
        <span>Extra Person:</span>

        <span class="package-value">
            <strong>
${(childWithBed > 0 || landChild > 0)
      ? `${formatCurrency(hotelExtraRate)}
 + ${formatCurrency(landExtraRate)}
 = ${formatCurrency(hotelExtraRate + landExtraRate)} Per Person`
      : "N/A"}
            </strong>
        </span>
    </div>

    <div class="package-row">
        <span>
            Child No Bed (1m - 1m40) (${cnbAge}):
        </span>

        <span class="package-value">
            <strong>
                ${childWithoutBed > 0
      ? `${formatCurrency(totalChildNoBed / childWithoutBed)}
 + ${formatCurrency(totalLandChildNoBed / childWithoutBed)}
 = ${formatCurrency(
        (totalChildNoBed + totalLandChildNoBed) / childWithoutBed
      )} Per Person`
      : "N/A"}
            </strong>
        </span>
    </div>

    <div class="package-row">
        <span>Compulsory Tip:</span>

        <span class="package-value">
            <strong>USD 3 Per Person / Day</strong>
        </span>
    </div>

    <div class="package-row">
        <span>E-Visa:</span>

        <span class="package-value">
            <strong>₹ 2,900 Per Person(05-06 working days)</strong>
        </span>
    </div>

</div>
${itineraryHtml}


</div>

`;
  const whatsappText = [];

  whatsappText.push(optionTitle.toUpperCase());
  whatsappText.push("");
  whatsappText.push("ACCOMMODATION");

  segments.forEach((seg, index) => {

    const checkIn = checkInInputs[index]?.value || "";
    const checkOut = checkOutInputs[index]?.value || "";

    let dateLine = "";

    if (checkIn && checkOut) {
      dateLine = `(${formatDate(checkIn)}-${formatDate(checkOut)}) `;
    }

    let line = `${seg.nights}nt ${dateLine}${seg.city} - ${seg.hotelName}`;

    if (seg.hotelCategory) {
      line += ` (${seg.hotelCategory})`;
    }

    if (seg.roomType) {
      line += ` / ${seg.roomType}`;
    }

    whatsappText.push(line);

  });

  whatsappText.push("");
  whatsappText.push("PACKAGE COST");

  whatsappText.push(
    `Price Per Person: ${formatCurrency(totalPerPerson)} Per Pax`
  );

  whatsappText.push(
    `Extra Person: ${childWithBed > 0
      ? formatCurrency(totalExtraPerson / childWithBed)
      : "N/A"
    } Per Person`
  );

  whatsappText.push(
    `Child No Bed (1m - 1m40) (${cnbAge}): ${formatCurrency(totalChildNoBed)} Per Person`
  );

  whatsappText.push("Compulsory Tip: USD 3 Per Person / Day");
  whatsappText.push("E-Visa: ₹2,900 Per Person");


  // ==========================
  // DAY WISE BRIEF ITINERARY
  // ==========================
  const selectedCountry = (countryEl?.value || "").toLowerCase();

  if (selectedCountry === "vietnam") {

    whatsappNotes = `
Notes:

- BANA HILLS : Wax Museum entrance fee (USD 5/pax),  Wine Cellar entrance fee (USD 5/pax for Silver ticket, including 1 glass of wine, or cocktail, or fruit juice), coin games at Fantasy Park are not included in the entrance ticket, joining them will be at your own accounT""
- Meals as indicated in Brief itinerary only: B = Breakfast ; L = Lunch ; D = Dinner
- Indian Dinner are served at Indian restaurant only (Outside Hotel)
- SIC Tour Stand Local Food Only
-Note: SIC sightseeing have, fix Pickup points, Guest need to reach at the given point on time by their own.

SERVICES INCLUDED
● A/C airport transfer on Pvt Suv 7s & Tours as mentioned in Itinerary
● Accommodation double/ twin sharing room
● English speaking local tour guides
● Meals without drinks as indicated: B = Breakfast ; L = Lunch ; D = Dinner (Indian Dinner served at Indian restaurant / Not at the hotel guest staying)
● All sightseeing fees as program
● 02 Water bottles on each day at the hotel.

PAYMENT TERM:
· A 50% deposit is required upon confirmation of the booking.
·100% pre-payment must be made 7 days prior arrival.
------------------------------------------------------
● Fast Track Immigration(Arrivals)
(Rates subject to change by Immigration authorities)
✈️ Da Nang (DAD): $19 per person
✈️ Tan Son Nhat – Ho Chi Minh City (SGN):
• Line 2,3 – $25 per person
• Line 1 – $45 per person

✈️ Noi Bai – Hanoi (HAN): $20 per person
✈️ Phu Quoc (PQC): $19 per person
------------------------------------------------------
SERVICES EXCLUDED
● Visa approval and visa stamp fee
● International air ticket and domestic flights.
● Late check-out fee and early check in
● Other meals not mentioned in programs
● Drinks, personal expenses and others…
● Bank Fees: 40$ Per transaction  / any mode of payment
● 3$ Per Person per day Compulsory Tips for tour guide and driver""

IMP Notes :
- Local restaurants and Indian restaurants in Vietnam are very basic. Some restaurants might not have air conditioner
- Language is a big Hurdle, Driver will not understand english, Few Guides May have issues with fluent English

Luggage:
- Taxi/CAB in Vietnam has no Top luggage carrier / Hence luggage need to be Less as per Vehicle
- If luggage are more and unable to fit in a given Vehicle, Surcharge will be applicable for Separate Vehicle Or Need to upgrade vehicle with additional cost.

Suggested Apps:
- Grab App for : Food, Taxi
- Google Translator

Cruise Notes:
*Halong Bay Cruise* has limited water. They generally give 1 Glass of water during lunch and dinner. For other times you will require to buy from them which will cost around USD 2 per Bottle (Approx).
Halong Bay Cruise doesn't have Indian food onboard.

Points to be Noted:
- Please keep the soft copy and hard copy of the tour documents with you.
- Please carry light clothes, Sun glasses, Rain coats, Ponchos, and umbrellas.
- For NRI Pax need to carry OCI or multiple visa Copy with you.
- Travel Insurance is recommended.
- Carry Universal Adapter.
- Always keep the Business card of the Hotel with you.
- Please don’t carry any valuable ornaments with you.
- Tap water is not safe in Vietnam.
- In Vietnam at the airport you can do Money Exchange & buy a SIM Card.
- Mini Bar is not included in the tour cost.
- Check-in time is at 2 PM & Check-out time is at 12 PM.
-Timing is very important as the sightseeing is time based.
- Coach is not on Disposal & will be from a point to point basis. Deviation is not possible and we will stick to the itinerary and inclusions mentioned in the package.
- No Alcohol / Food consumption is allowed in the Vehicle/bus"
`;

  }

  let whatsappItinerary = "";
  if (landServices.length > 0) {

    whatsappText.push("");
    whatsappText.push("DAY WISE BRIEF ITINERARY");

    const groupedDays = {};

    landServices.forEach(service => {

      if (!groupedDays[service.day]) {
        groupedDays[service.day] = [];
      }

      groupedDays[service.day].push(service.service);

    });

    const firstDate =
      document.querySelector(".segment-checkin")?.value;

    Object.keys(groupedDays).forEach(day => {

      let currentDate = "";

      if (firstDate) {

        const d = new Date(firstDate);

        d.setDate(d.getDate() + (Number(day) - 1));

        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();

        currentDate = `${dd}-${mm}-${yyyy}`;

      }

      whatsappItinerary += `DAY ${day} (${currentDate}) : ${groupedDays[day].join(" + ")}\n`;

    });

  }
  if (
    currentOption === Object.keys(quoteOptions).length - 1 &&
    whatsappItinerary
  ) {

    whatsappText.push("");
    whatsappText.push("DAY WISE BRIEF ITINERARY");
    whatsappText.push(whatsappItinerary.trim());

  }
  if (
    currentOption === Object.keys(quoteOptions).length - 1 &&
    whatsappNotes
  ) {
    whatsappText.push("");
    whatsappText.push(whatsappNotes.trim());
  }

  window.latestWhatsappText = whatsappText.join("\n");
  previewBox.innerHTML = previewHtml;
  if (quoteOptions[currentOption]) {

    quoteOptions[currentOption].data.previewHtml = previewHtml;

  }

  /* Save same HTML globally */
  window.latestPreviewHtml = previewHtml;

}
function buildPreviewFinal(data = null) {

  if (!previewBox) return;
  if (data) {
    restoreQuoteData(data);
  }

  const segments = getAllSegmentsData();

  let totalPerPerson = 0;
  let totalExtraPerson = 0;
  let totalChildNoBed = 0;
  let totalLandExtraPerson = 0;
  let totalLandChildNoBed = 0;

  segments.forEach(seg => {
    totalPerPerson += Number(seg.baseHotelCost || 0);
    totalExtraPerson += Number(seg.childWithBedCharges || 0);
    totalChildNoBed += Number(seg.childWithoutBedCharges || 0);
    totalLandExtraPerson += Number(seg.landChildWithBedRate || 0);
    totalLandChildNoBed += Number(seg.landChildNoBedRate || 0);
  });

  const childWithBed = Number(childWithBedEl?.value || 0);
  const childWithoutBed = Number(childWithoutBedEl?.value || 0);
  const landChild = Number(landChildEl?.value || 0);

  const hotelExtraRate =
    childWithBed > 0
      ? totalExtraPerson / childWithBed
      : 0;

  const landExtraRate =
    landChild > 0
      ? totalLandExtraPerson / landChild
      : 0;
  const cnbAgeText =
    cnbAgeHistory.length
      ? cnbAgeHistory
        .map((age, i) => `Child ${i + 1}: ${age}`)
        .join(", ")
      : "-";

  const optionTitle =
    quoteOptions[currentOption]?.title || "Option 1";

  let quotationAccommodation = "";

  segments.forEach(seg => {

    quotationAccommodation += `

<div class="quotation-row">
  <div class="quotation-city">
    <strong>${seg.nights}nt</strong>
    <strong>${seg.city}</strong>
    -
    <strong>
      ${seg.hotelName}
      ${seg.hotelCategory ? `(${seg.hotelCategory})` : ""}
    </strong>
    ${seg.roomType ? " / " + seg.roomType : ""}
  </div>
</div>

`;

  });
  let itineraryHtml = "";
  let notesHtml = "";

  const landServices = data?.landServices || getLandServicesData();
  let whatsappItinerary = "";
  let whatsappNotes = "";

  if (landServices.length > 0) {

    itineraryHtml = `

<div class="quotation-section-title">
    <strong>DAY WISE BRIEF ITINERARY</strong>
</div>

<div class="quotation-package">

`;

    const groupedDays = {};

    landServices.forEach(service => {

      if (!groupedDays[service.day]) {
        groupedDays[service.day] = [];
      }

      groupedDays[service.day].push(service.service);

    });

    const firstDate =
      data?.segments?.[0]?.checkIn ||
      document.querySelector(".segment-checkin")?.value;

    Object.keys(groupedDays).forEach(day => {

      let currentDate = "";

      if (firstDate) {

        const d = new Date(firstDate);

        d.setDate(d.getDate() + (Number(day) - 1));

        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();

        currentDate = `${dd}-${mm}-${yyyy}`;

      }

      itineraryHtml += `
      

<div class="package-row">

    <span>
        <strong>DAY ${day} (${currentDate}):</strong>
    </span>

    <span class="package-value">
        ${groupedDays[day].join(" + ")}
    </span>

</div>

`;
      whatsappItinerary += `DAY ${day} (${currentDate}) : ${groupedDays[day].join(" + ")}\n`;

    });

    itineraryHtml += `

</div>

`;

  }
  const selectedCountry = (countryEl?.value || "").toLowerCase();

  if (selectedCountry === "vietnam") {

    notesHtml = `
    
    
    <div class="quotation-section-title">
    <strong>NOTES</strong>
</div>
<pre class="quotation-notes">
- BANA HILLS : Wax Museum entrance fee (USD 5/pax),  Wine Cellar entrance fee (USD 5/pax for Silver ticket, including 1 glass of wine, or cocktail, or fruit juice), coin games at Fantasy Park are not included in the entrance ticket, joining them will be at your own accounT""
- Meals as indicated in Brief itinerary only: B = Breakfast ; L = Lunch ; D = Dinner
- Indian Dinner are served at Indian restaurant only (Outside Hotel)
- SIC Tour Stand Local Food Only
-Note: SIC sightseeing have, fix Pickup points, Guest need to reach at the given point on time by their own.

SERVICES INCLUDED
● A/C airport transfer on Pvt Suv 7s & Tours as mentioned in Itinerary
● Accommodation double/ twin sharing room
● English speaking local tour guides
● Meals without drinks as indicated: B = Breakfast ; L = Lunch ; D = Dinner (Indian Dinner served at Indian restaurant / Not at the hotel guest staying)
● All sightseeing fees as program
● 02 Water bottles on each day at the hotel.

PAYMENT TERM:
· A 50% deposit is required upon confirmation of the booking.
·100% pre-payment must be made 7 days prior arrival.
------------------------------------------------------
● Fast Track Immigration(Arrivals)
(Rates subject to change by Immigration authorities)
✈️ Da Nang (DAD): $19 per person
✈️ Tan Son Nhat – Ho Chi Minh City (SGN):
• Line 2,3 – $25 per person
• Line 1 – $45 per person

✈️ Noi Bai – Hanoi (HAN): $20 per person
✈️ Phu Quoc (PQC): $19 per person
------------------------------------------------------
SERVICES EXCLUDED
● Visa approval and visa stamp fee
● International air ticket and domestic flights.
● Late check-out fee and early check in
● Other meals not mentioned in programs
● Drinks, personal expenses and others…
● Bank Fees: 40$ Per transaction  / any mode of payment
● 3$ Per Person per day Compulsory Tips for tour guide and driver""

IMP Notes :
- Local restaurants and Indian restaurants in Vietnam are very basic. Some restaurants might not have air conditioner
- Language is a big Hurdle, Driver will not understand english, Few Guides May have issues with fluent English

Luggage:
- Taxi/CAB in Vietnam has no Top luggage carrier / Hence luggage need to be Less as per Vehicle
- If luggage are more and unable to fit in a given Vehicle, Surcharge will be applicable for Separate Vehicle Or Need to upgrade vehicle with additional cost.

Suggested Apps:
- Grab App for : Food, Taxi
- Google Translator

Cruise Notes:
*Halong Bay Cruise* has limited water. They generally give 1 Glass of water during lunch and dinner. For other times you will require to buy from them which will cost around USD 2 per Bottle (Approx).
Halong Bay Cruise doesn't have Indian food onboard.

Points to be Noted:
- Please keep the soft copy and hard copy of the tour documents with you.
- Please carry light clothes, Sun glasses, Rain coats, Ponchos, and umbrellas.
- For NRI Pax need to carry OCI or multiple visa Copy with you.
- Travel Insurance is recommended.
- Carry Universal Adapter.
- Always keep the Business card of the Hotel with you.
- Please don’t carry any valuable ornaments with you.
- Tap water is not safe in Vietnam.
- In Vietnam at the airport you can do Money Exchange & buy a SIM Card.
- Mini Bar is not included in the tour cost.
- Check-in time is at 2 PM & Check-out time is at 12 PM.
-Timing is very important as the sightseeing is time based.
- Coach is not on Disposal & will be from a point to point basis. Deviation is not possible and we will stick to the itinerary and inclusions mentioned in the package.
- No Alcohol / Food consumption is allowed in the Vehicle/bus"

`;

  }
  if (selectedCountry === "vietnam") {

    whatsappNotes = `

Notes:

- BANA HILLS : Wax Museum entrance fee (USD 5/pax),  Wine Cellar entrance fee (USD 5/pax for Silver ticket, including 1 glass of wine, or cocktail, or fruit juice), coin games at Fantasy Park are not included in the entrance ticket, joining them will be at your own accounT""
- Meals as indicated in Brief itinerary only: B = Breakfast ; L = Lunch ; D = Dinner
- Indian Dinner are served at Indian restaurant only (Outside Hotel)
- SIC Tour Stand Local Food Only
-Note: SIC sightseeing have, fix Pickup points, Guest need to reach at the given point on time by their own.

SERVICES INCLUDED
● A/C airport transfer on Pvt Suv 7s & Tours as mentioned in Itinerary
● Accommodation double/ twin sharing room
● English speaking local tour guides
● Meals without drinks as indicated: B = Breakfast ; L = Lunch ; D = Dinner (Indian Dinner served at Indian restaurant / Not at the hotel guest staying)
● All sightseeing fees as program
● 02 Water bottles on each day at the hotel.

PAYMENT TERM:
· A 50% deposit is required upon confirmation of the booking.
·100% pre-payment must be made 7 days prior arrival.
------------------------------------------------------
● Fast Track Immigration(Arrivals)
(Rates subject to change by Immigration authorities)
✈️ Da Nang (DAD): $19 per person
✈️ Tan Son Nhat – Ho Chi Minh City (SGN):
• Line 2,3 – $25 per person
• Line 1 – $45 per person

✈️ Noi Bai – Hanoi (HAN): $20 per person
✈️ Phu Quoc (PQC): $19 per person
------------------------------------------------------
SERVICES EXCLUDED
● Visa approval and visa stamp fee
● International air ticket and domestic flights.
● Late check-out fee and early check in
● Other meals not mentioned in programs
● Drinks, personal expenses and others…
● Bank Fees: 40$ Per transaction  / any mode of payment
● 3$ Per Person per day Compulsory Tips for tour guide and driver""

IMP Notes :
- Local restaurants and Indian restaurants in Vietnam are very basic. Some restaurants might not have air conditioner
- Language is a big Hurdle, Driver will not understand english, Few Guides May have issues with fluent English

Luggage:
- Taxi/CAB in Vietnam has no Top luggage carrier / Hence luggage need to be Less as per Vehicle
- If luggage are more and unable to fit in a given Vehicle, Surcharge will be applicable for Separate Vehicle Or Need to upgrade vehicle with additional cost.

Suggested Apps:
- Grab App for : Food, Taxi
- Google Translator

Cruise Notes:
*Halong Bay Cruise* has limited water. They generally give 1 Glass of water during lunch and dinner. For other times you will require to buy from them which will cost around USD 2 per Bottle (Approx).
Halong Bay Cruise doesn't have Indian food onboard.

Points to be Noted:
- Please keep the soft copy and hard copy of the tour documents with you.
- Please carry light clothes, Sun glasses, Rain coats, Ponchos, and umbrellas.
- For NRI Pax need to carry OCI or multiple visa Copy with you.
- Travel Insurance is recommended.
- Carry Universal Adapter.
- Always keep the Business card of the Hotel with you.
- Please don’t carry any valuable ornaments with you.
- Tap water is not safe in Vietnam.
- In Vietnam at the airport you can do Money Exchange & buy a SIM Card.
- Mini Bar is not included in the tour cost.
- Check-in time is at 2 PM & Check-out time is at 12 PM.
-Timing is very important as the sightseeing is time based.
- Coach is not on Disposal & will be from a point to point basis. Deviation is not possible and we will stick to the itinerary and inclusions mentioned in the package.
- No Alcohol / Food consumption is allowed in the Vehicle/bus"

`;

  }

  const finalHtml = `

<div class="quotation-document">

<div class="quotation-title">
<h2>${optionTitle.toUpperCase()}</h2>
</div>

<div class="quotation-section-title">
<strong>ACCOMMODATION</strong>
</div>

<div class="quotation-accommodation">
${quotationAccommodation}
</div>

<div class="quotation-section-title">
<strong>PACKAGE COST</strong>
</div>

<div class="quotation-package">

<div class="package-row">
<span>Price Per Person:</span>
<span class="package-value">
<strong>${formatCurrency(totalPerPerson)} Per Pax</strong>
</span>
</div>

<div class="package-row">
<span>Extra Person:</span>
<span class="package-value">
<strong>
${(childWithBed > 0 || landChild > 0)
      ? `${formatCurrency(hotelExtraRate + landExtraRate)} Per Person`
      : "N/A"}
</strong>
</span>
</div>

<div class="package-row">
<span>
Child No Bed (${cnbAgeText}):
</span>

<span class="package-value">
<strong>
${childWithoutBed
      ? formatCurrency(
        (totalChildNoBed +
          totalLandChildNoBed) /
        childWithoutBed
      ) + " Per Person"
      : "N/A"
    }
</strong>
</span>
</div>

<div class="package-row">
<span>Compulsory Tip:</span>
<span class="package-value">
<strong>USD 3 Per Person / Day</strong>
</span>
</div>

<div class="package-row">
<span>E-Visa:</span>
<span class="package-value">
<strong>₹2,900 Per Person</strong>
</span>
</div>

</div>


</div>

`;

  let html = finalHtml;
  if (currentOption === Object.keys(quoteOptions).length - 1) {
    html += itineraryHtml;
    html += notesHtml;
  }

  previewBox.innerHTML = html;
  window.latestPreviewHtml = html;

}
function formatDate(dateStr) {

  if (!dateStr) return "";

  const d = new Date(dateStr);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${d.getDate()}${months[d.getMonth()]}`;
}
function openPreviewModal() {

  saveCurrentOption();

  const activeOption = currentOption;

  let finalHtml = "";

  for (let i = 0; i < quoteOptions.length; i++) {

    const optionData = quoteOptions[i].data;

    if (!optionData) continue;

    currentOption = i;

    // Only modal uses final preview
    buildPreviewFinal(optionData);

    finalHtml += window.latestPreviewHtml;

    if (i < quoteOptions.length - 1) {
      finalHtml += `
      <div style="
        margin:35px 0;
        border-top:3px dashed #d8d8d8;
      "></div>
      `;
    }

  }

  currentOption = activeOption;

  // Restore normal preview
  buildPreview(quoteOptions[activeOption].data);

  quoteModalTitleEl.textContent = "Quotation Preview";
  quoteModalSubtextEl.textContent = "Review quotation before saving.";
  quoteModalPreviewEl.innerHTML = finalHtml;

  confirmQuoteActionBtn.style.display = "none";
  quoteActionModal.classList.add("active");

}

/* =========================================================
   SAVE QUOTE
========================================================= */
async function saveQuote() {
  try {
    const adults = Number(adultsEl?.value || 0);
    const childWithBed = Number(childWithBedEl?.value || 0);
    const childWithoutBed = Number(childWithoutBedEl?.value || 0);
    const totalPax = adults + childWithBed + childWithoutBed;

    const selectedPickup = masterData?.vehicles?.find(v => String(v.id) === String(pickupVehicleEl?.value));
    const selectedDrop = masterData?.vehicles?.find(v => String(v.id) === String(dropVehicleEl?.value));

    const segments = getAllSegmentsData();

    const payload = {
      quoteNo: quoteNoEl?.textContent || "",
      country: countryEl?.value || "",
      travelDate: travelDateEl?.value || "",

      adults,
      childWithBed,
      childWithoutBed,
      childWithBedAge: childWithBedAgeEl?.value || "",
      childWithoutBedAge: childWithoutBedAgeEl?.value || "",
      totalPax,

      segments,

      pickupVehicleId: pickupVehicleEl?.value || "",
      pickupVehicleName: selectedPickup ? selectedPickup.name : "",

      dropVehicleId: dropVehicleEl?.value || "",
      dropVehicleName: selectedDrop ? selectedDrop.name : "",

      hotelCost: currentHotelCost,
      transferCost: currentTransferCost,
      grandTotal: currentGrandTotal
    };

    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to save quote");
    }

    lastSavedQuote = payload;
    alert("Quote saved successfully!");

    buildPreview();
  } catch (error) {
    console.log("SAVE QUOTE ERROR:", error);
    alert("Error saving quote: " + error.message);
  }
}

/* =========================================================
   RESET
========================================================= */
async function resetForm() {
  if (travelDateEl) travelDateEl.value = "";
  if (adultsEl) adultsEl.value = 2;
  if (childWithBedEl) childWithBedEl.value = 0;
  if (childWithoutBedEl) childWithoutBedEl.value = 0;
  if (childWithBedAgeEl) childWithBedAgeEl.value = "4-10";
  if (childWithoutBedAgeEl) childWithoutBedAgeEl.value = "4-10";

  if (countryEl) countryEl.value = "Vietnam";

  await loadCountryData(countryEl.value);
  await loadHotelsFromDB(countryEl.value);

  if (pickupVehicleEl) pickupVehicleEl.value = "";
  if (dropVehicleEl) dropVehicleEl.value = "";

  currentHotelCost = 0;
  currentTransferCost = 0;
  currentGrandTotal = 0;
  lastSavedQuote = null;


  if (segmentsContainer) {
    segmentsContainer.innerHTML = "";
    segmentCounter = 0;
    createSegment();
  }

  calculateQuote();
}

/* =========================================================
   RENUMBER SEGMENTS
========================================================= */
function renumberSegments() {
  const segments = [...document.querySelectorAll(".city-segment")];
  segmentCounter = segments.length;

  segments.forEach((segment, index) => {
    const badge = segment.querySelector(".segment-badge");
    const title = segment.querySelector(".segment-title-wrap h4");
    if (badge) badge.textContent = index + 1;
    if (title) title.textContent = `City Segment ${index + 1}`;
  });
}

/* =========================================================
   MODAL HELPERS
========================================================= */
function openQuoteModal({
  title = "Quote Action",
  subtext = "Preview and confirm your action.",
  previewHtml = "",
  confirmText = "Continue",
  onConfirm = null
}) {
  if (!quoteActionModal) return;

  quoteModalTitleEl.textContent = title;
  quoteModalSubtextEl.textContent = subtext;
  quoteModalPreviewEl.innerHTML = previewHtml;
  confirmQuoteActionBtn.textContent = confirmText;

  currentModalAction = onConfirm;
  quoteActionModal.classList.add("active");

  confirmQuoteActionBtn.onclick = () => {
    if (typeof currentModalAction === "function") currentModalAction();
  };
}

function closeQuoteModal() {
  if (!quoteActionModal) return;
  quoteActionModal.classList.remove("active");
  currentModalAction = null;
}

/* =========================================================
   ACTIONS
========================================================= */
function getPopupPreviewHtml() {
  const segments = getAllSegmentsData();

  const segmentLines = segments.map(seg => `
    <div style="margin-bottom:8px;padding:8px 10px;border:1px solid #e5ecff;border-radius:10px;">
      <strong>Segment ${seg.segmentNo}:</strong> ${seg.city || "-"}<br>
      Hotel: ${seg.hotelName || "-"}<br>
      Nights: ${seg.nights || 0} | Rooms: ${seg.rooms || 0}<br>
      Total: ${seg.rateUnavailable ? "Rate N/A" : formatCurrency(seg.total || 0)}
    </div>
  `).join("");

  return `
    <div><strong>Quote No:</strong> ${quoteNoEl?.textContent || "-"}</div>
    <div><strong>Country:</strong> ${countryEl?.value || "-"}</div>
    <div><strong>Travel Date:</strong> ${travelDateEl?.value || "-"}</div>
    <div><strong>Total Pax:</strong> ${totalPaxInputEl?.value || 0}</div>
    <div><strong>Grand Total:</strong> ${formatCurrency(currentGrandTotal)}</div>
    <hr style="margin:12px 0;border:none;border-top:1px solid #e8eeff;">
    ${segmentLines}
  `;
}

async function handlePreviewPdfClick() {

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
        <html>
        <head>

            <title>${quoteNoEl?.textContent || "Quotation"}</title>

            <link rel="stylesheet" href="assets/css/create-quote.css">
            <link rel="stylesheet" href="assets/css/land-package.css">

            <style>

                body{
                    margin:0;
                    padding:20px;
                    background:#fff;
                }

                .preview-actions{
                    display:none !important;
                }

                @page{
                    size:A4;
                    margin:10mm;
                }

            </style>

        </head>

        <body>

            ${quoteModalPreviewEl.innerHTML}

        </body>

        </html>
    `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {

    printWindow.print();

    printWindow.close();

  }, 500);

}

async function handleWordClick() {

  const content = `
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body{
                font-family: Arial, sans-serif;
                margin:20px;
            }

            .preview-actions{
                display:none !important;
            }
        </style>
    </head>

    <body>

        ${quoteModalPreviewEl.innerHTML}

    </body>

    </html>
    `;

  const converted = window.htmlDocx.asBlob(content);

  const url = URL.createObjectURL(converted);

  const a = document.createElement("a");

  a.href = url;

  a.download = `${quoteNoEl?.textContent || "Quotation"}.docx`;

  a.click();

  URL.revokeObjectURL(url);

}

function handleWhatsappClick() {

  if (!lastSavedQuote) {
    alert("Please save quote first.");
    return;
  }

  const phone = prompt("Enter WhatsApp Number with Country Code");

  if (!phone) return;

  const text = buildWhatsappMessage();

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  window.location.href = url;

}

async function handleEmailClick() {

  console.log("EMAIL BUTTON CLICKED");

  if (!lastSavedQuote) {
    alert("Please save quote first.");
    return;
  }

  const to = prompt("Enter Recipient Email");

  if (!to) return;

  try {

    console.log("Before Fetch");
    console.log(CONFIG.API_BASE);

    const response = await fetch(`${CONFIG.API_BASE}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to,
        subject: `Travel Quote - ${quoteNoEl?.textContent || ""}`,
        html: getQuotationHTML(false)
      })
    });

    console.log("After Fetch");
    console.log(response);

    console.log("STATUS:", response.status);

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    if (data.success) {
      alert("✅ Quote Email Sent Successfully.");
    } else {
      alert(data.message || "Email Sending Failed");
    }

  } catch (err) {

    console.error("FETCH ERROR:", err);

  }

}
function getPreviewEmailText() {

  let body = "";

  quoteOptions.forEach((option, index) => {

    if (!option.data || !option.data.previewHtml) return;

    const temp = document.createElement("div");

    temp.innerHTML = option.data.previewHtml;

    body += temp.innerText.trim();

    if (index !== quoteOptions.length - 1) {

      body +=
        "\n\n--------------------------------------------\n\n";

    }

  });

  return body;

}

/* =========================================================
   MESSAGE BUILDERS
========================================================= */
function buildWhatsappMessage() {

  let finalMessage = "";

  const activeOption = currentOption;

  for (let i = 0; i < quoteOptions.length; i++) {

    currentOption = i;

    if (!quoteOptions[i].data) continue;

    restoreQuoteData(quoteOptions[i].data);

    buildPreview();

    finalMessage += window.latestWhatsappText;

    if (i < quoteOptions.length - 1) {
      finalMessage += "\n\n--------------------------------\n\n";
    }
  }

  currentOption = activeOption;
  restoreQuoteData(quoteOptions[activeOption].data);
  buildPreview();

  return finalMessage;

}

function buildEmailMessage() {
  const segments = getAllSegmentsData();

  const segmentText = segments.map(seg => {
    return `Segment ${seg.segmentNo}: ${seg.city}
Hotel: ${seg.hotelName}
Room Type: ${seg.roomType}
Meal Plan: ${seg.mealPlan}
Nights: ${seg.nights}
Segment Total: ${seg.rateUnavailable ? "Rate N/A" : formatCurrency(seg.total)}`;
  }).join("\n\n");

  return `
Dear Guest,

Please find your travel quotation details below.

Quote No: ${quoteNoEl?.textContent || "-"}
Country: ${countryEl?.value || "-"}
Travel Date: ${travelDateEl?.value || "-"}

Passengers:
Adults: ${adultsEl?.value || 0}
Child With Bed: ${childWithBedEl?.value || 0} (${childWithBedAgeEl?.value || "-"})
Child Without Bed: ${childWithoutBedEl?.value || 0} (${childWithoutBedAgeEl?.value || "-"})

${segmentText}

Hotel Cost: ${formatCurrency(currentHotelCost)}
Transfer Cost: ${formatCurrency(currentTransferCost)}
Grand Total: ${formatCurrency(currentGrandTotal)}

Regards,
TravLog
  `.trim();
}

/* =========================================================
   HELPERS
========================================================= */
function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString("en-IN")}`;
}

document.addEventListener("click", function (e) {

  // PRINT
  if (e.target.closest("#previewPrintBtn")) {

    const w = window.open("", "_blank");

    w.document.write(`
            <html>

            <head>

                <title>Quotation</title>

                <link rel="stylesheet"
                href="assets/css/create-quote.css">

            </head>

            <body>

                ${getQuotationHTML(false)}

            </body>

            </html>
        `);

    w.document.close();

    setTimeout(() => {

      w.print();

    }, 300);

  }

});
function getQuotationHTML(includeButtons = true) {

  let html = "";

  quoteOptions.forEach((option, index) => {

    if (!option.data || !option.data.previewHtml) return;

    html += `
        <div class="quotation-print">

            <div class="quotation-logo-header">

                <div class="quotation-company">

                    <div class="quotation-company-text">

                        <h2>TravLog</h2>

                        <p>B2B Travel Partner</p>

                        <small>Trusted Destination Management Company</small>

                    </div>

                </div>

            </div>

            ${option.data.previewHtml}

        </div>
        `;

    if (index !== quoteOptions.length - 1) {

      html += `
                <div style="
                    page-break-after:always;
                    margin:40px 0;
                "></div>
            `;

    }

  });

  if (!includeButtons) return html;

  return `
        ${html}

        <div class="preview-actions no-print">

            <button id="previewPrintBtn"
            class="preview-action-btn preview-print">

                <i class="fa-solid fa-print"></i>
                Print

            </button>

            <button id="previewPdfBtn"
            class="preview-action-btn preview-pdf">

                <i class="fa-solid fa-file-pdf"></i>
                PDF

            </button>

            <button id="previewWordBtn"
            class="preview-action-btn preview-word">

                <i class="fa-solid fa-file-word"></i>
                Word

            </button>

            <button id="previewWhatsappBtn"
            class="preview-action-btn preview-whatsapp">

                <i class="fa-brands fa-whatsapp"></i>
                WhatsApp

            </button>

            <button id="previewEmailBtn"
            class="preview-action-btn preview-email">

                <i class="fa-solid fa-envelope"></i>
                Email

            </button>

        </div>
    `;
}
document.addEventListener("click", function (e) {

  if (e.target.closest("#previewBtn")) {

    openPreviewModal();

  }

});
function getCurrentSegments() {

  const segments = [];

  document.querySelectorAll(".city-segment").forEach(seg => {

    segments.push({

      city:
        seg.querySelector(".segment-city")?.value || "",

      nights:
        Number(seg.querySelector(".segment-nights")?.value || 1),

      hotel:
        seg.querySelector(".segment-hotel")?.value || "",

      room:
        seg.querySelector(".segment-room-type")?.value || ""

    });

  });

  return segments;

}

let landServicesCache = {};

async function fetchLandServices(city) {

  if (landServicesCache[city]) {
    return landServicesCache[city];
  }

  try {

    const res = await fetch(
      `${CONFIG.API_BASE}/land-services?city=${encodeURIComponent(city)}`
    );

    const data = await res.json();

    landServicesCache[city] = data;

    return data;

  } catch (err) {

    console.error("Land Service Fetch Error", err);

    return null;

  }

}
async function populateLandServices(card, city) {

  const data = await fetchLandServices(city);
  console.log("CITY =>", city);
  console.log("CARD =>", card);
  console.log("SELECTS =>", card.querySelectorAll(".land-service").length);

  console.log("DATA =>", data);

  if (!data) return;

  const selects = card.querySelectorAll(".land-service");

  const services = [
    ...(data.transfer || []),
    ...(data.privateTours || []),
    ...(data.sicTours || []),
    ...(data.localServices || []),
    ...(data.meals || [])
  ];
  services.forEach(service => {

    if (service.price && !service.rates) {

      service.rates = {
        1: service.price,
        2: service.price,
        3: service.price,
        4: service.price,
        5: service.price,
        6: service.price,
        7: service.price,
        8: service.price,
        9: service.price,
        10: service.price,
        11: service.price,
        12: service.price,
        13: service.price,
        14: service.price
      };

    }

  });

  selects.forEach(select => {

    select.innerHTML = `<option value="">Select Service</option>`;

    services.forEach(service => {

      const option = document.createElement("option");

      option.value = service.name;
      option.textContent = service.name;

      option.dataset.category = service.category || "";
      option.dataset.service = JSON.stringify(service);

      select.appendChild(option);

    });

  });
  // =========================
  // Restore Selected Services
  // =========================

  const savedServices =
    quoteOptions[currentOption]?.data?.landServices || [];

  card.querySelectorAll(".land-day-box").forEach(dayBox => {

    const day = Number(
      dayBox.querySelector(".land-day-title")
        ?.textContent
        .replace("Day", "")
        .trim()
    );

    const servicesOfDay =
      savedServices.filter(x => x.day === day);

    if (!servicesOfDay.length) return;

    const list = dayBox.querySelector(".land-service-list");

    list.innerHTML = "";

    servicesOfDay.forEach(service => {

      const row = document.createElement("div");

      row.className = "selected-service";

      row.innerHTML = `

<div class="service-left">
${service.service}
</div>

<div class="service-right">
$${service.rate}
</div>

<button type="button" class="remove-service">
<i class="fa-solid fa-trash"></i>
</button>

`;

      list.appendChild(row);

    });

  });

}
function renderLandDays() {
  console.trace("renderLandDays Called");

  const container = document.getElementById("landDaysContainer");
  if (!container) return;

  const segments = getCurrentSegments();

  let html = `<div class="land-grid">`;

  let globalDay = 1;

  segments.forEach(segment => {

    html += createCityCard(segment, globalDay);

    globalDay += segment.nights + 1;

  });

  html += `</div>`;

  container.innerHTML = html;

  initializeLandEvents();

  document.querySelectorAll(".land-city-card").forEach(card => {

    const city = card.querySelector(".land-city-header h4")
      .childNodes[0]
      .textContent
      .trim();

    populateLandServices(card, city);
    if (window.restoredLandServices?.length) {

      setTimeout(() => {

        restoreLandServices(window.restoredLandServices);

        window.restoredLandServices = [];

      }, 300);

    }

  });

}

function createCityCard(segment, startDay) {

  let html = `
<div class="land-city-card">

    <div class="land-city-header">

        <h4>
            ${segment.city}
            <small>(${segment.nights}N / ${segment.nights + 1}D)</small>
        </h4>

    </div>

    <div class="land-city-body">
`;

  let day = startDay;

  for (let i = 0; i <= segment.nights; i++) {

    html += `

<div class="land-day-box" data-day="${day}">

    <div class="land-day-header">

        <div class="land-day-title">
            Day ${day}
        </div>

        <input
            type="text"
            class="land-rate"
            value="0"
            readonly>

    </div>

    <div class="land-service-row">

        <select class="land-service">

            <option value="">
                Select Service
            </option>

        </select>

        <button
            type="button"
            class="land-add-btn">

            +

        </button>

    </div>

    <div class="land-service-list">

        <div class="empty-service">
            No Service Added
        </div>

    </div>

</div>

`;

    day++;

  }

  html += `

    <div class="land-city-total">

        <span>Total :</span>

        <strong>$0</strong>

    </div>

    </div>

</div>
`;

  return html;

}
function initializeLandEvents() {

  // Get current passenger count
  function getSelectedPax() {

    const adults = Number(adultsEl?.value || 0);

    const cnb = Number(childWithoutBedEl?.value || 0);

    const landChild = Number(landChildEl?.value || 0);

    const totalPax = adults + cnb + landChild;

    return String(totalPax);

  }

  // ===========================
  // SERVICE CHANGE
  // ===========================

  document.querySelectorAll(".land-service").forEach(select => {

    select.onchange = function () {

      const option = this.options[this.selectedIndex];

      if (!option.dataset.service) {

        rateBox.value = 0;

        currentLandCost = calculateLandCost();

        const grandTotal =
          currentHotelCost +
          currentTransferCost +
          currentLandCost;

        if (landCostEl)
          landCostEl.textContent = formatCurrency(currentLandCost);

        if (grandTotalEl)
          grandTotalEl.textContent = formatCurrency(grandTotal);

        currentGrandTotal = grandTotal;

        return;

      }

      const service = JSON.parse(option.dataset.service);
      console.log(service);

      const dayBox = this.closest(".land-day-box");

      const rateBox = dayBox.querySelector(".land-rate");

      const pax = Number(getSelectedPax());

      let rate = 0;

      // New Format
      if (service.adult !== undefined || service.child !== undefined) {

        const adults = Number(adultsEl.value || 0);
        const children =
          Number(childWithBedEl.value || 0) +
          Number(childWithoutBedEl.value || 0);
        const landChildAge = landChildAgeEl?.value || "4-6";

        let childMultiplier = 0.5;

        if (landChildAge === "7-9") {

          childMultiplier = 0.8;

        }

        if (landChildAge === "10+") {

          childMultiplier = 1;

        }

        const adultRate = Number(service.adult || 0);

        rate =
          (adults * adultRate) +
          (children * adultRate * childMultiplier);
      }

      // Old Format
      else if (service.price !== undefined) {

        rate = Number(service.price);

      }

      else if (service.rates) {

        rate = Number(service.rates[pax] || 0);

      }

      rateBox.value = rate;
      currentLandCost = calculateLandCost();

      const grandTotal = currentHotelCost + currentTransferCost + currentLandCost;

      if (landCostEl) {
        landCostEl.textContent = formatCurrency(currentLandCost);
      }

      if (grandTotalEl) {
        grandTotalEl.textContent = formatCurrency(grandTotal);
      }

      currentGrandTotal = grandTotal;
      // calculateQuote();

      // Sirf rate update hoga, preview nahi
      currentLandCost = calculateLandCost();

    };

  });
  // ===========================
  // ADD BUTTON
  // ===========================

  document.querySelectorAll(".land-add-btn").forEach(btn => {

    btn.onclick = function () {

      const dayBox = this.closest(".land-day-box");

      const card = this.closest(".land-city-card");

      const serviceSelect = dayBox.querySelector(".land-service");

      const rateBox = dayBox.querySelector(".land-rate");

      const list = dayBox.querySelector(".land-service-list");

      const totalBox = card.querySelector(".land-city-total strong");

      if (!serviceSelect.value) {

        alert("Please Select Service");

        return;

      }

      if (list.querySelector(".empty-service")) {

        list.innerHTML = "";

      }
      list.style.maxHeight = "41px";

      const serviceName =
        serviceSelect.options[
          serviceSelect.selectedIndex
        ].text;

      const price =
        parseFloat(rateBox.value) || 0;

      const row = document.createElement("div");

      row.className = "selected-service";

      row.innerHTML = `

<div class="service-left">

${serviceName}

</div>

<div class="service-right">

$${price}

</div>

<button
type="button"
class="remove-service">

<i class="fa-solid fa-trash"></i>

</button>

`;

      list.appendChild(row);
      // Preview update only after service is actually added
      buildPreview();

      // REMOVE BUTTON

      row.querySelector(".remove-service").onclick = function () {

        row.remove();

        let grand = 0;

        card.querySelectorAll(".service-right").forEach(x => {

          grand += parseFloat(
            x.textContent.replace("$", "")
          ) || 0;

        });

        totalBox.innerHTML = "$" + grand;

        if (list.children.length === 0) {

          list.innerHTML = `
<div class="empty-service">
No Service Added
</div>
`;

        }
        list.style.maxHeight = "";
        currentLandCost = calculateLandCost();
        calculateQuote();
        // Refresh preview after deleting service
        buildPreview();

      };

      // UPDATE TOTAL

      let grand = 0;

      card.querySelectorAll(".service-right").forEach(x => {

        grand += parseFloat(
          x.textContent.replace("$", "")
        ) || 0;

      });

      totalBox.innerHTML = "$" + grand;
      currentLandCost = calculateLandCost();
      calculateQuote();

    };

  });

}
function calculateLandCost() {

  let total = 0;

  document
    .querySelectorAll(".selected-service .service-right")
    .forEach(item => {

      total += parseFloat(
        item.textContent.replace("$", "")
      ) || 0;

    });

  currentLandCost = total;

  return total;

}
function calculateLandChildCost() {

  const landCost = calculateLandCost();

  let total = 0;
  let cnbTotal = 0;
  let cwbTotal = 0;
  const breakdown = [];

  // Child Without Bed
  cnbAgeHistory.forEach(age => {

    let percent = 1;

    if (age === "0-3") {
      percent = 0;
    } else if (age === "4-6") {
      percent = 0.5;
    } else if (age === "7-9") {
      percent = 0.8;
    }

    const value = landCost * percent;

    breakdown.push(formatCurrency(value));

    total += value;
    cnbTotal += value;

  });

  // Child With Bed (LCA)
  cwbAgeHistory.forEach(age => {

    let percent = 1;

    if (age === "4-6") {
      percent = 0.5;
    } else if (age === "7-9") {
      percent = 0.8;
    } else if (age === "10+") {
      percent = 1;
    }

    const value = landCost * percent;

    breakdown.push(formatCurrency(value));

    total += value;
    cwbTotal += value;


  });

  return {
    total,
    cnbTotal,
    cwbTotal,
    breakdown
  };

}
function getLandServicesData() {

  const services = [];

  document.querySelectorAll(".land-day-box").forEach(dayBox => {

    const dayTitle = dayBox.querySelector(".land-day-title");

    const day = Number(
      dayTitle?.textContent.replace("Day", "").trim()
    ) || 0;

    // NEW
    const city =
      dayBox.closest(".land-city-card")
        ?.querySelector(".land-city-header h4")
        ?.childNodes[0]
        ?.textContent
        ?.trim() || "";

    dayBox.querySelectorAll(".selected-service").forEach(row => {

      const serviceLeft = row.querySelector(".service-left");

      if (!serviceLeft) return;

      services.push({

        city,          // NEW
        day,

        service: serviceLeft.textContent.trim(),

        rate: Number(
          row.querySelector(".service-right")
            .textContent
            .replace("$", "")
        ) || 0

      });

    });

  });

  return services;

}
function restoreLandServices(savedServices) {

  if (!savedServices?.length) return;

  document.querySelectorAll(".land-day-box").forEach(dayBox => {

    const day = Number(
      dayBox.querySelector(".land-day-title")
        ?.textContent.replace("Day", "")
        .trim()
    );

    const list = dayBox.querySelector(".land-service-list");

    const totalBox = dayBox
      .closest(".land-city-card")
      .querySelector(".land-city-total strong");

    savedServices
      .filter(x => x.day === day)
      .forEach(service => {

        if (list.querySelector(".empty-service")) {
          list.innerHTML = "";
        }

        const row = document.createElement("div");

        row.className = "selected-service";

        row.innerHTML = `
<div class="service-left">
${service.service}
</div>

<div class="service-right">
$${service.rate}
</div>

<button
type="button"
class="remove-service">

<i class="fa-solid fa-trash"></i>

</button>
`;

        list.appendChild(row);

        row.querySelector(".remove-service").onclick = function () {

          row.remove();

          currentLandCost = calculateLandCost();

          calculateQuote();

        };

      });

    let total = 0;

    dayBox
      .closest(".land-city-card")
      .querySelectorAll(".service-right")
      .forEach(x => {

        total += Number(
          x.textContent.replace("$", "")
        );

      });

    totalBox.innerHTML = "$" + total;

  });

  calculateQuote();

}
