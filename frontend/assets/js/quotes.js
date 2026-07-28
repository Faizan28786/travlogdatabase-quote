const API = CONFIG.API_BASE + "/quote-data";

let allQuotes = [];

const quotesTableBody = document.getElementById("quotesTableBody");
const totalQuotesEl = document.getElementById("totalQuotes");
const totalRevenueEl = document.getElementById("totalRevenue");
const lastQuoteNoEl = document.getElementById("lastQuoteNo");
const searchInput = document.getElementById("searchInput");

/* ================================
   FORMATTERS
================================ */
function formatCurrency(value) {
  const num = Number(value || 0);
  return "$" + num.toLocaleString("en-IN");
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatCreatedDate(dateString) {
  if (!dateString) return "-";

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ================================
   SAFE FIELD HELPERS
================================ */
function getCountry(q) {
  return q.country || q.destination || "-";
}

function getCity(q) {
  return q.city || q.cityName || "-";
}

function getHotelName(q) {
  // Case 1: direct hotelName string
  if (q.hotelName && typeof q.hotelName === "string") return q.hotelName;

  // Case 2: nested hotel object
  if (q.hotel && typeof q.hotel === "object") {
    return q.hotel.name || q.hotel.hotelName || "-";
  }

  // Case 3: hotelName object
  if (q.hotelName && typeof q.hotelName === "object") {
    return q.hotelName.name || q.hotelName.hotelName || "-";
  }

  return "-";
}

function getRooms(q) {
  return q.rooms || q.numberOfRooms || 0;
}

function getMealPlan(q) {
  return q.mealPlan || q.meal || "-";
}

function getGrandTotal(q) {
  return Number(q.grandTotal || q.totalAmount || 0);
}

function getTotalPax(q) {
  if (q.totalPax) return Number(q.totalPax);

  const adults = Number(q.adults || 0);
  const childWithBed = Number(q.childWithBed || 0);
  const childWithoutBed = Number(q.childWithoutBed || 0);

  return adults + childWithBed + childWithoutBed;
}

/* ================================
   FETCH QUOTES
================================ */
async function loadQuotes() {
  try {
    quotesTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="emptyRow">Loading quotes...</td>
      </tr>
    `;

    const res = await fetch(`${API}/all`)
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch quotes");
    }

    allQuotes = Array.isArray(data.quotes) ? data.quotes : [];

    // latest first
    allQuotes.sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    renderStats(allQuotes);
    renderQuotes(allQuotes);

  } catch (error) {
    console.error("Load Quotes Error:", error);
    quotesTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="emptyRow">Failed to load quotes</td>
      </tr>
    `;
  }
}

/* ================================
   RENDER STATS
================================ */
function renderStats(quotes) {
  totalQuotesEl.textContent = quotes.length;

  const totalRevenue = quotes.reduce((sum, q) => {
    return sum + getGrandTotal(q);
  }, 0);

  totalRevenueEl.textContent = formatCurrency(totalRevenue);
  lastQuoteNoEl.textContent = quotes.length ? (quotes[0].quoteNo || "-") : "-";
}

/* ================================
   RENDER TABLE
   IMPORTANT:
   HTML table me CITY ke liye extra <th> hona chahiye
================================ */
function renderQuotes(quotes) {
  if (!quotes.length) {
    quotesTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="emptyRow">No saved quotes found</td>
      </tr>
    `;
    return;
  }

  quotesTableBody.innerHTML = quotes.map(q => {
    const quoteNo = q.quoteNo || "-";
    const country = getCountry(q);
    const city = getCity(q);
    const travelDate = formatDate(q.travelDate);
    const totalPax = getTotalPax(q);
    const rooms = getRooms(q);
    const mealPlan = getMealPlan(q);
    const hotelName = getHotelName(q);
    const grandTotal = formatCurrency(getGrandTotal(q));
    const createdAt = formatCreatedDate(q.createdAt);

    return `
      <tr>
        <td>
          <span class="quote-pill">
            <i class="fa-solid fa-file-lines"></i>
            ${quoteNo}
          </span>
        </td>
        <td>${country}</td>
        <td>${city}</td>
        <td>${travelDate}</td>
        <td>${totalPax}</td>
        <td>${rooms}</td>
        <td>${mealPlan}</td>
        <td>${hotelName}</td>
        <td class="amount">${grandTotal}</td>
        <td>${createdAt}</td>
        <td>
          <button class="deleteQuoteBtn" data-id="${q._id}">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");

  attachDeleteEvents();
}

/* ================================
   DELETE QUOTE
================================ */
function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".deleteQuoteBtn");

  deleteButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const quoteId = btn.dataset.id;
      const confirmDelete = confirm("Are you sure you want to delete this quote?");
      if (!confirmDelete) return;

      try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

        const res = await fetch(`${API}/delete-quote/${quoteId}`, {
          method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to delete quote");
        }

        alert("Quote deleted successfully");
        loadQuotes();

      } catch (error) {
        console.error("Delete Quote Error:", error);
        alert(error.message || "Failed to delete quote");

        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
      }
    });
  });
}

/* ================================
   SEARCH FILTER
================================ */
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();

    if (!value) {
      renderQuotes(allQuotes);
      renderStats(allQuotes);
      return;
    }

    const filtered = allQuotes.filter(q => {
      const quoteNo = (q.quoteNo || "").toLowerCase();
      const country = String(getCountry(q)).toLowerCase();
      const city = String(getCity(q)).toLowerCase();
      const hotelName = String(getHotelName(q)).toLowerCase();
      const mealPlan = String(getMealPlan(q)).toLowerCase();

      return (
        quoteNo.includes(value) ||
        country.includes(value) ||
        city.includes(value) ||
        hotelName.includes(value) ||
        mealPlan.includes(value)
      );
    });

    renderQuotes(filtered);
    renderStats(filtered);
  });
}

/* ================================
   INIT
================================ */
loadQuotes();