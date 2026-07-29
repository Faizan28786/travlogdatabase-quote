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
const transferCostEl = document.getElementById("transferCost");
const grandTotalEl = document.getElementById("grandTotal");

const previewBox = document.getElementById("previewBox");
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

    segments: [...segmentsContainer.querySelectorAll(".city-segment")].map(seg => ({

      city: seg.querySelector(".segment-city")?.value || "",

      mealPlan: seg.querySelector(".segment-meal-plan")?.value || "",

      hotel: seg.querySelector(".segment-hotel")?.value || "",

      roomType: seg.querySelector(".segment-room-type")?.value || "",

      checkIn: seg.querySelector(".segment-checkin")?.value || "",

      checkOut: seg.querySelector(".segment-checkout")?.value || "",

      nights: seg.querySelector(".segment-nights")?.value || "1",


    }))

  };

}
function restoreQuoteData(data) {

  if (!data) return;
  segmentCounter = 0;   // <<<<< YE ADD KARO

  adultsEl.value = data.adults;
  roomsEl.value = data.rooms;
  childWithBedEl.value = data.childWithBed;
  childWithoutBedEl.value = data.childWithoutBed;
  childWithoutBedAgeEl.value = data.childWithoutBedAge;

  travelDateEl.value = data.travelDate;
  countryEl.value = data.country;
  segmentCounter = 0;
  segmentsContainer.innerHTML = "";

  data.segments.forEach(seg => {

    createSegment(seg);

  });

  calculateQuote();
  renderLandDays();
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

let segmentCounter = 0;
let currentModalAction = null;

/* =========================================================
   CHILD AGE / CHARGE RULES
========================================================= */
function getChildChargeConfig() {
  return {
    cwbAge: childWithBedAgeEl?.value || "4-10",
    cnbAge: childWithoutBedAgeEl?.value || "4-10",
    cwbCount: Number(childWithBedEl?.value || 0),
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
  childWithoutBedEl?.addEventListener("input", calculateQuote);
  childWithBedAgeEl?.addEventListener("change", calculateQuote);
  childWithoutBedAgeEl?.addEventListener("change", calculateQuote);

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
  if (segmentData) {

    segment.querySelector(".segment-city").value =
      segmentData.city || "";

    segment.querySelector(".segment-meal-plan").value =
      segmentData.mealPlan || "CP";

    segment.querySelector(".segment-checkin").value =
      segmentData.checkIn || "";

    segment.querySelector(".segment-checkout").value =
      segmentData.checkOut || "";

    segment.querySelector(".segment-nights").value =
      segmentData.nights || 1;


    // Hotel & Room load hone ke baad set karenge
    setTimeout(() => {

      segment.querySelector(".segment-hotel").value =
        segmentData.hotel || "";

      // room list reload
      segment.querySelector(".segment-hotel")
        .dispatchEvent(new Event("change"));

      setTimeout(() => {

        segment.querySelector(".segment-room-type").value =
          segmentData.roomType || "";

      }, 150);

    }, 150);

  }

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
    total: segmentTotal,
    rateUnavailable
  };
}

/* =========================================================
   CALCULATE QUOTE
========================================================= */
function calculateQuote() {
  const adults = Number(adultsEl?.value || 0);
  const childWithBed = Number(childWithBedEl?.value || 0);
  const childWithoutBed = Number(childWithoutBedEl?.value || 0);
  const totalPax = adults + childWithBed + childWithoutBed;

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

  const grandTotal = totalHotelCost + transferCost;

  currentHotelCost = totalHotelCost;
  currentTransferCost = transferCost;
  currentGrandTotal = grandTotal;

  if (summaryTotalNightsEl) summaryTotalNightsEl.textContent = totalSegmentNights;
  if (summaryTotalRoomsEl) summaryTotalRoomsEl.textContent = totalRooms;
  if (hotelCostEl) hotelCostEl.textContent = formatCurrency(totalHotelCost);
  if (transferCostEl) transferCostEl.textContent = formatCurrency(transferCost);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  updateSegmentDates();
  if (quoteOptions[currentOption]) {

    quoteOptions[currentOption].data = getCurrentQuoteData();

  }
  buildPreview();
  renderLandDays();
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
  const totalPax = adults + childWithBed + childWithoutBed;

  const cwbAge = childWithBedAgeEl?.value || "-";
  const cnbAge = childWithoutBedAgeEl?.value || "-";

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

  segments.forEach(seg => {

    totalPerPerson += Number(seg.baseHotelCost || 0);

    totalExtraPerson += Number(seg.childWithBedCharges || 0);

    totalChildNoBed += Number(seg.childWithoutBedCharges || 0);

  });
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
                ${childWithBed > 0
      ? `${formatCurrency(totalExtraPerson / childWithBed)} Per Person`
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
                ${formatCurrency(totalChildNoBed)} Per Person
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
            <strong>₹ 2,850 Per Person</strong>
        </span>
    </div>

</div>

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
  whatsappText.push("E-Visa: ₹2,850 Per Person");

  window.latestWhatsappText = whatsappText.join("\n");

  previewBox.innerHTML = previewHtml;
  if (quoteOptions[currentOption]) {

    quoteOptions[currentOption].data.previewHtml = previewHtml;

  }

  /* Save same HTML globally */
  window.latestPreviewHtml = previewHtml;
  // function getQuotationHTML(includeButtons = true) {

  //   const quotation = previewBox.innerHTML;

  //   if (!includeButtons) {
  //     return quotation;
  //   }

  //   return `
  //       ${quotation}

  //       <div class="preview-actions no-print">

  //           <button id="previewPrintBtn"
  //           class="preview-action-btn preview-print">

  //               <i class="fa-solid fa-print"></i>
  //               Print

  //           </button>

  //           <button id="previewPdfBtn"
  //           class="preview-action-btn preview-pdf">

  //               <i class="fa-solid fa-file-pdf"></i>
  //               PDF

  //           </button>

  //           <button id="previewWordBtn"
  //           class="preview-action-btn preview-word">

  //               <i class="fa-solid fa-file-word"></i>
  //               Word

  //           </button>

  //           <button id="previewWhatsappBtn"
  //           class="preview-action-btn preview-whatsapp">

  //               <i class="fa-brands fa-whatsapp"></i>
  //               WhatsApp

  //           </button>

  //           <button id="previewEmailBtn"
  //           class="preview-action-btn preview-email">

  //               <i class="fa-solid fa-envelope"></i>
  //               Email

  //           </button>

  //       </div>
  //   `;
  // }
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

  // Current option save
  saveCurrentOption();

  // Remember current tab
  const activeOption = currentOption;

  // Clear modal html
  let finalHtml = "";

  // Build preview of every option
  for (let i = 0; i < quoteOptions.length; i++) {

    currentOption = i;

    if (quoteOptions[i].data) {

      restoreQuoteData(quoteOptions[i].data);

      buildPreview();

      finalHtml += previewBox.innerHTML;

      // Divider except last option
      if (i < quoteOptions.length - 1) {
        finalHtml += `
          <div style="
            margin:35px 0;
            border-top:3px dashed #d8d8d8;
          "></div>
        `;
      }

    }

  }

  // Restore current editing option
  currentOption = activeOption;

  restoreQuoteData(quoteOptions[activeOption].data);

  buildPreview();

  quoteModalTitleEl.textContent = "Quotation Preview";

  quoteModalSubtextEl.textContent =
    "Review quotation before saving.";

  quoteModalPreviewEl.innerHTML = finalHtml;

  confirmQuoteActionBtn.style.display = "none";

  quoteActionModal.classList.add("active");

}
// function buildPreviewHTML() {

//     const segments = [...document.querySelectorAll(".city-segment")];

//     let html = "";

//     html += `
//         <div class="preview-header">

//             <h2>TravLog</h2>

//             <h3>Quotation</h3>

//             <hr>

//             <table class="preview-table">

//                 <tr>
//                     <td><strong>Quote No</strong></td>
//                     <td>${quoteNoEl.textContent}</td>
//                 </tr>

//                 <tr>
//                     <td><strong>Country</strong></td>
//                     <td>${countryEl.value}</td>
//                 </tr>

//                 <tr>
//                     <td><strong>Travel Date</strong></td>
//                     <td>${travelDateEl.value || "-"}</td>
//                 </tr>

//                 <tr>
//                     <td><strong>Total Pax</strong></td>
//                     <td>${totalPaxInputEl.value}</td>
//                 </tr>

//             </table>

//         </div>

//         <br>

//         <h3>Hotels</h3>
//     `;

//     segments.forEach((seg,index)=>{

//         html += `

//         <div class="preview-segment">

//             <h4>City ${index+1}</h4>

//             <table class="preview-table">

//                 <tr>
//                     <td>City</td>
//                     <td>${seg.querySelector(".segment-city").value}</td>
//                 </tr>

//                 <tr>
//                     <td>Hotel</td>
//                     <td>${seg.querySelector(".segment-hotel").selectedOptions[0].text}</td>
//                 </tr>

//                 <tr>
//                     <td>Room</td>
//                     <td>${seg.querySelector(".segment-room-type").value}</td>
//                 </tr>

//                 <tr>
//                     <td>Nights</td>
//                     <td>${seg.querySelector(".segment-nights").value}</td>
//                 </tr>

//             </table>

//         </div>

//         `;
//     });

//     html += `

//     <br>

//     <h3>Pricing</h3>

//     <table class="preview-table">

//         <tr>
//             <td>Hotel Cost</td>
//             <td>${hotelCostEl.textContent}</td>
//         </tr>

//         <tr>
//             <td>Transfer Cost</td>
//             <td>${transferCostEl.textContent}</td>
//         </tr>

//         <tr class="grand-row">
//             <td><strong>Grand Total</strong></td>
//             <td><strong>${grandTotalEl.textContent}</strong></td>
//         </tr>

//     </table>
//     `;

//     return html;

// }
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
// function renderLandDays() {

//   const container = document.getElementById("landDaysContainer");
//   if (!container) return;

//   const segments = getCurrentSegments();
//   let html = "";
//   let globalDay = 1;
//   html += `<div class="land-grid">`;

//   segments.forEach(segment => {

//     const city = segment.city;

//     const nights = segment.nights;

//     html += `

//         <div class="land-city-card">

//             <div class="land-city-header">
//                 <h4>${city}</h4>
//                 <span>${nights} Night / ${nights + 1} Days</span>
//             </div>

//             <div class="land-city-body">

//         `;

//     for (let d = 1; d <= nights + 1; d++) {

//       html += `

//             <div class="land-day-box">

//                 <div class="land-day-title">
//                     Day ${globalDay}
//                 </div>

// <div class="field">
//     <select class="land-service service-select">
//         <option value="">Select Service</option>
//     </select>
// </div>

// <div class="field">
//     <input
//         type="text"
//         class="land-rate"
//         placeholder="Rate"
//         readonly>
// </div>

// <div class="field">
//     <textarea
//         class="land-description"
//         placeholder="Selected Service"
//         readonly></textarea>
// </div>

//             </div>

//             `;

//       globalDay++;

//     }

//     html += `

//             </div>


//         </div>

//         `;

//   });
//   html += `</div>`;

//   container.innerHTML = html;

// }
let landServicesCache = {};

async function fetchLandServices(city) {

  if (landServicesCache[city]) {
    return landServicesCache[city];
  }

  try {

    const res = await fetch(
      `http://localhost:5000/api/land-services?city=${encodeURIComponent(city)}`
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

}
function renderLandDays() {

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

  });

}
// function renderLandCities() {

//   const container = document.getElementById("landDaysContainer");
//   if (!container) return;

//   const segments = getCurrentSegments();

//   let html = `<div class="land-grid">`;

//   let globalDay = 1;

//   segments.forEach(segment => {

//     html += createCityCard(segment, globalDay);

//     globalDay += segment.nights + 1;

//   });

//   html += `</div>`;

//   container.innerHTML = html;
//   initializeLandEvents();
//   document.querySelectorAll(".land-city-card").forEach(card => {

//     const city = card.querySelector(".land-city-header h4")
//       .childNodes[0]
//       .textContent
//       .trim();

//     populateLandServices(card, city);

//   });

// }

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

<div class="land-day-box">

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

    // CHANGE THIS ID if your passenger field is different
    const pax =
      document.getElementById("adults")?.value || 2;

    return String(pax);

  }

  // ===========================
  // SERVICE CHANGE
  // ===========================

  document.querySelectorAll(".land-service").forEach(select => {

    select.onchange = function () {

      const option = this.options[this.selectedIndex];

      if (!option.dataset.service) return;

      const service = JSON.parse(option.dataset.service);

      const dayBox = this.closest(".land-day-box");

      const rateBox = dayBox.querySelector(".land-rate");

      const pax = getSelectedPax();

      let rate = 0;

      if (service.price) {

        rate = service.price;

      }

      else if (service.rates) {

        rate = service.rates[pax] || 0;

      }

      rateBox.value = rate;

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

      };

      // UPDATE TOTAL

      let grand = 0;

      card.querySelectorAll(".service-right").forEach(x => {

        grand += parseFloat(
          x.textContent.replace("$", "")
        ) || 0;

      });

      totalBox.innerHTML = "$" + grand;

    };

  });

}

