const API = CONFIG.API_BASE + "/quote-data";

let allQuotes = [];

const quotesTableBody = document.getElementById("quotesTableBody");
const totalQuotesEl = document.getElementById("totalQuotes");
const totalRevenueEl = document.getElementById("totalRevenue");
const lastQuoteNoEl = document.getElementById("lastQuoteNo");
const searchInput = document.getElementById("searchInput");
const selectAllQuotes = document.getElementById("selectAllQuotes");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

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
  if (q.city || q.cityName) {
    return q.city || q.cityName;
  }

  if (Array.isArray(q.segments) && q.segments.length) {
    return q.segments
      .map(s => s.city)
      .filter(Boolean)
      .join(", ");
  }

  return "-";
}

function getHotelName(q) {

  // Root level hotel
  if (q.hotelName && typeof q.hotelName === "string") {
    return q.hotelName;
  }

  // Nested hotel object
  if (q.hotel && typeof q.hotel === "object") {
    return q.hotel.name || q.hotel.hotelName || "-";
  }

  // Segment hotel details
  if (Array.isArray(q.segments) && q.segments.length) {

    return q.segments
      .map(s => {

        const hotelName =
          s.hotelName ||
          s.hotel ||
          s.name ||
          "";

        const category =
          s.hotelCategory ||
          s.category ||
          s.roomCategory ||
          "";

        const roomType =
          s.roomType ||
          "";

        let text = hotelName;

        if (category) {
          text += ` (${category})`;
        }

        if (roomType) {
          text += ` / ${roomType}`;
        }

        return text.trim();

      })
      .filter(Boolean)
      .join(", ");
  }

  return "-";
}

function getRooms(q) {

  // Root level - only use if actually greater than 0
  if (Number(q.rooms) > 0) {
    return Number(q.rooms);
  }

  if (Number(q.numberOfRooms) > 0) {
    return Number(q.numberOfRooms);
  }

  // Check segments
  if (Array.isArray(q.segments) && q.segments.length) {

    const segmentRooms = q.segments.reduce((total, s) => {

      const roomCount =
        Number(s.rooms) ||
        Number(s.roomCount) ||
        Number(s.numberOfRooms) ||
        Number(s.noOfRooms) ||
        0;

      return total + roomCount;

    }, 0);

    if (segmentRooms > 0) {
      return segmentRooms;
    }
  }

  return 0;
}

function getMealPlan(q) {
  if (q.mealPlan) return q.mealPlan;
  if (q.meal) return q.meal;

  if (Array.isArray(q.segments) && q.segments.length) {
    return q.segments
      .map(s => s.mealPlan)
      .filter(Boolean)
      .join(", ");
  }

  return "-";
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
        <td colspan="12" class="emptyRow">Loading quotes...</td>
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
        <td colspan="12" class="emptyRow">Failed to load quotes</td>
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

function getQuoteCurrencySymbol(country) {
  const currencyMap = {
    India: "₹",
    Vietnam: "$",
    Thailand: "฿",
    Indonesia: "Rp",
    Malaysia: "RM",
    Singapore: "S$",
    UAE: "AED",
    Dubai: "AED"
  };

  return currencyMap[country] || "$";
}

function formatSavedQuoteTotal(amount, country) {
  const symbol = getQuoteCurrencySymbol(country);
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
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
        <td colspan="12" class="emptyRow">No saved quotes found</td>
      </tr>
    `;

    if (selectAllQuotes) {
      selectAllQuotes.checked = false;
      selectAllQuotes.indeterminate = false;
    }

    if (deleteSelectedBtn) {
      deleteSelectedBtn.style.display = "none";
    }

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
    const grandTotal = formatSavedQuoteTotal(getGrandTotal(q), country);
    const createdAt = formatCreatedDate(q.createdAt);

    return `
      <tr>
        <td>
          <input 
            type="checkbox" 
            class="quoteCheckbox" 
            data-id="${q._id}"
          >
        </td>

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
  <div class="quote-actions">

    <button class="viewQuoteBtn" data-id="${q._id}">
      <i class="fa-solid fa-eye"></i> View
    </button>

    <button class="deleteQuoteBtn" data-id="${q._id}">
      <i class="fa-solid fa-trash"></i> Delete
    </button>
    <button class="confirmQuoteBtn ${q.confirmed ? "confirmed" : ""}" 
        data-id="${q._id}"
        title="${q.confirmed ? "Booking Confirmed" : "Mark as Confirmed"}">

  <i class="fa-solid ${q.confirmed ? "fa-circle-check" : "fa-circle"}"></i>
  ${q.confirmed ? "Confirmed" : "Confirm"}

</button>

  </div>
</td>
      </tr>
    `;
  }).join("");

  attachDeleteEvents();
  attachSelectionEvents();
  attachViewEvents();
  attachConfirmEvents();
}

function attachConfirmEvents() {

  const confirmButtons =
    document.querySelectorAll(".confirmQuoteBtn");

  confirmButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const quoteId = btn.dataset.id;

      try {

        const response = await fetch(
          `${API_BASE_URL}/quotes/${quoteId}/confirm`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update quote status");
        }

        await loadQuotes();

      } catch (error) {

        console.error("CONFIRM QUOTE ERROR:", error);

        alert("Unable to update booking status.");

      }

    });

  });

}

/* ================================
   DELETE QUOTE
================================ */
function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".deleteQuoteBtn");

  deleteButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const quoteId = btn.dataset.id;

      const confirmDelete = confirm(
        "Are you sure you want to delete this quote?"
      );

      if (!confirmDelete) return;

      try {
        btn.disabled = true;
        btn.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i> Deleting...
        `;

        const res = await fetch(`${API}/delete-quote/${quoteId}`, {
          method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to delete quote");
        }

        loadQuotes();

      } catch (error) {
        console.error("Delete Quote Error:", error);

        alert(error.message || "Failed to delete quote");

        btn.disabled = false;
        btn.innerHTML = `
          <i class="fa-solid fa-trash"></i> Delete
        `;
      }
    });
  });
}

function attachViewEvents() {

  const viewButtons = document.querySelectorAll(".viewQuoteBtn");

  viewButtons.forEach(btn => {

    btn.addEventListener("click", () => {

      const quoteId = btn.dataset.id;

      const quote = allQuotes.find(
        q => String(q._id) === String(quoteId)
      );

      if (!quote) {
        alert("Quote data not found.");
        return;
      }

      console.log("VIEW QUOTE:", quote);

      openSavedQuotePreview(quote);

    });

  });

}

/* =========================================================
   CONFIRM QUOTE
========================================================= */

function attachConfirmEvents() {

  const confirmButtons = document.querySelectorAll(".confirmQuoteBtn");

  confirmButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const quoteId = btn.dataset.id;

      if (!quoteId) {
        alert("Quote ID not found.");
        return;
      }

      const confirmBooking = confirm(
        "Are you sure you want to confirm this booking?"
      );

      if (!confirmBooking) return;

      try {

        const response = await fetch(
          `http://localhost:5000/api/quote-data/confirm/${quoteId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to confirm quote.");
        }

        alert("Booking confirmed successfully.");

        // Reload quotes so confirmed status is saved and displayed
        loadQuotes();

      } catch (error) {

        console.error("CONFIRM QUOTE ERROR:", error);

        alert(
          error.message || "Failed to confirm booking."
        );

      }

    });

  });

}
function openSavedQuotePreview(quote) {
  const currencySymbol =
    String(quote.country || "").toLowerCase() === "india"
      ? "₹"
      : "$";

  const segments = Array.isArray(quote.segments)
    ? quote.segments
    : [];

  const segmentHTML = segments.map((segment, index) => {

    const hotelName =
      segment.hotelName ||
      segment.hotel ||
      "-";

    const roomType =
      segment.roomType ||
      "-";

    const city =
      segment.city ||
      "-";

    const mealPlan =
      segment.mealPlan ||
      "-";

    const nights =
      segment.nights ||
      "1";

    const checkIn =
      segment.checkIn ||
      "";

    const checkOut =
      segment.checkOut ||
      "";

    return `
      <div class="saved-preview-segment">

        <h3>Accommodation</h3>

        <h4>OPTION ${index + 1}</h4>

        <div class="saved-preview-hotel">
          ${hotelName}
        </div>

        <div class="saved-preview-room">
          ${roomType}
        </div>

        <div class="saved-preview-details">

          <div>
            <strong>City</strong>
            <span>${city}</span>
          </div>

          <div>
            <strong>Meal Plan</strong>
            <span>${mealPlan}</span>
          </div>

          <div>
            <strong>Nights</strong>
            <span>${nights}</span>
          </div>

          ${checkIn
        ? `
                <div>
                  <strong>Check In</strong>
                  <span>${checkIn}</span>
                </div>
              `
        : ""
      }

          ${checkOut
        ? `
                <div>
                  <strong>Check Out</strong>
                  <span>${checkOut}</span>
                </div>
              `
        : ""
      }

        </div>

      </div>
    `;

  }).join("");


  const previewWindow = window.open(
    "",
    "_blank",
    "width=900,height=900"
  );

  if (!previewWindow) {
    alert("Please allow pop-ups for this website.");
    return;
  }


  previewWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>${quote.quoteNo || "Quotation"}</title>

      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      >

      <style>

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 40px;
          background: #f3f4f6;
          font-family: Poppins, Arial, sans-serif;
          color: #263653;
        }

        .preview-page {
          max-width: 850px;
          margin: auto;
          background: white;
          padding: 45px;
          min-height: 1100px;
          box-shadow: 0 5px 25px rgba(0,0,0,0.12);
        }

        .preview-header {
          border-bottom: 2px solid #263653;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .preview-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
        }

        .quote-number {
          margin-top: 8px;
          font-size: 14px;
          color: #666;
        }

        .trip-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 35px;
        }

        .info-box {
          background: #f5f7fb;
          padding: 15px;
          border-radius: 8px;
        }

        .info-box small {
          display: block;
          color: #777;
          margin-bottom: 5px;
        }

        .info-box strong {
          font-size: 15px;
        }

        .saved-preview-segment {
          border: 1px solid #dfe3eb;
          padding: 25px;
          margin-bottom: 25px;
        }

        .saved-preview-segment h3 {
          margin: 0 0 12px;
          font-size: 20px;
          text-transform: uppercase;
        }

        .saved-preview-segment h4 {
          margin: 0 0 10px;
          font-size: 16px;
          text-transform: uppercase;
        }

        .saved-preview-hotel {
          font-size: 17px;
          font-weight: 700;
        }

        .saved-preview-room {
          margin-top: 5px;
          font-size: 14px;
          color: #555;
        }

        .saved-preview-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 20px;
        }

        .saved-preview-details div {
          background: #f7f8fa;
          padding: 12px;
          border-radius: 6px;
        }

        .saved-preview-details strong {
          display: block;
          font-size: 12px;
          color: #777;
          margin-bottom: 4px;
        }

        .saved-preview-details span {
          font-size: 14px;
          font-weight: 600;
        }

        .total-box {
          margin-top: 35px;
          padding: 20px;
          background: #263653;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
        }

        .total-box span {
          font-size: 18px;
          font-weight: 600;
        }

        .total-box strong {
          font-size: 25px;
        }

        @media print {

          body {
            padding: 0;
            background: white;
          }

          .preview-page {
            box-shadow: none;
            max-width: none;
          }

        }

      </style>

    </head>

    <body>

      <div class="preview-page">

        <div class="preview-header">

          <h1>TRAVEL QUOTATION</h1>

          <div class="quote-number">
            Quote No: ${quote.quoteNo || "-"}
          </div>

        </div>


        <div class="trip-info">

          <div class="info-box">
            <small>Country</small>
            <strong>${quote.country || "-"}</strong>
          </div>

          <div class="info-box">
            <small>Travel Date</small>
            <strong>${quote.travelDate || "-"}</strong>
          </div>

          <div class="info-box">
            <small>Passengers</small>
            <strong>${quote.adults || 0}</strong>
          </div>

        </div>


        ${segmentHTML}


        <div class="total-box">

          <span>Total Package Cost</span>

<strong>
  ${currencySymbol}${Number(quote.grandTotal || 0).toLocaleString("en-IN")}
</strong>

        </div>

      </div>

    </body>

    </html>

  `);

  previewWindow.document.close();

}
/* ================================
   MULTI SELECT / BULK DELETE
================================ */
function attachSelectionEvents() {

  const checkboxes =
    document.querySelectorAll(".quoteCheckbox");

  checkboxes.forEach(checkbox => {

    checkbox.addEventListener("change", updateSelectionState);

  });

  updateSelectionState();
}


function updateSelectionState() {

  const checkboxes =
    Array.from(document.querySelectorAll(".quoteCheckbox"));

  const checkedBoxes =
    checkboxes.filter(checkbox => checkbox.checked);

  const selectedCount =
    checkedBoxes.length;

  /* Delete Selected button */

  if (deleteSelectedBtn) {

    if (selectedCount > 0) {

      deleteSelectedBtn.style.display = "inline-flex";

      deleteSelectedBtn.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Delete Selected (${selectedCount})
      `;

    } else {

      deleteSelectedBtn.style.display = "none";

    }
  }

  /* Select All checkbox */

  if (selectAllQuotes) {

    if (checkboxes.length === 0) {

      selectAllQuotes.checked = false;
      selectAllQuotes.indeterminate = false;

    } else {

      selectAllQuotes.checked =
        selectedCount === checkboxes.length;

      selectAllQuotes.indeterminate =
        selectedCount > 0 &&
        selectedCount < checkboxes.length;

    }
  }
}
/* ================================
   SELECT ALL
================================ */
if (selectAllQuotes) {

  selectAllQuotes.addEventListener("change", () => {

    const checkboxes =
      document.querySelectorAll(".quoteCheckbox");

    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllQuotes.checked;
    });

    updateSelectionState();

  });

}
/* ================================
   DELETE SELECTED QUOTES
================================ */
if (deleteSelectedBtn) {

  deleteSelectedBtn.addEventListener("click", async () => {

    const selectedCheckboxes =
      Array.from(
        document.querySelectorAll(".quoteCheckbox:checked")
      );

    const selectedIds =
      selectedCheckboxes
        .map(checkbox => checkbox.dataset.id)
        .filter(Boolean);

    if (!selectedIds.length) {
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete ${selectedIds.length} selected quote(s)?`
    );

    if (!confirmDelete) {
      return;
    }

    try {

      deleteSelectedBtn.disabled = true;

      deleteSelectedBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Deleting ${selectedIds.length}...
      `;

      const deleteRequests =
        selectedIds.map(id =>
          fetch(`${API}/delete-quote/${id}`, {
            method: "DELETE"
          })
        );

      const responses =
        await Promise.all(deleteRequests);

      const results =
        await Promise.all(
          responses.map(response => response.json())
        );

      const failed =
        results.filter(data => !data.success);

      if (failed.length > 0) {

        throw new Error(
          `${failed.length} quote(s) could not be deleted.`
        );

      }

      alert(
        `${selectedIds.length} quote(s) deleted successfully.`
      );

      loadQuotes();

    } catch (error) {

      console.error(
        "Bulk Delete Error:",
        error
      );

      alert(
        error.message ||
        "Failed to delete selected quotes."
      );

      deleteSelectedBtn.disabled = false;

      updateSelectionState();

    }

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