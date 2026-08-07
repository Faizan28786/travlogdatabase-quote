document.addEventListener("DOMContentLoaded", () => {

  const DASHBOARD_API = CONFIG.API_BASE + "/quote-data";

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    console.error("User JSON Parse Error:", err);
  }

  // Authentication Check
  if (!token || !user) {
    console.warn("Session Expired. Redirecting to Login...");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
    return;
  }

  console.log("✅ Logged In User:", user);
  console.log("🔑 Token Found:", token);

  // ===== Remaining Dashboard Code Starts Here =====

  // USER INFO
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const avatarEl = document.getElementById("avatar");
  const welcomeName = document.getElementById("welcomeName");

  if (welcomeName) {
    welcomeName.textContent = user.name || "TravLog Admin";
  }

  if (userNameEl) userNameEl.innerHTML = user.name || "User";
  if (userRoleEl) userRoleEl.innerHTML = (user.role || "staff").toUpperCase();
  if (avatarEl) avatarEl.innerHTML = (user.name || "U").charAt(0).toUpperCase();

  // DATE
  const today = new Date();
  const todayDateEl = document.getElementById("todayDate");

  if (todayDateEl) {
    todayDateEl.innerHTML = today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "./login.html";
    });
  }

  // ROLE PERMISSION
  if (user.role === "staff") {
    const staffMenu = document.getElementById("staffMenu");
    const reportMenu = document.getElementById("reportMenu");
    const settingMenu = document.getElementById("settingMenu");

    if (staffMenu) staffMenu.style.display = "none";
    if (reportMenu) reportMenu.style.display = "none";
    if (settingMenu) settingMenu.style.display = "none";
  }

  // COUNTS
  const quoteCountEl = document.getElementById("quoteCount");
  const staffCountEl = document.getElementById("staffCount");

  if (quoteCountEl) quoteCountEl.innerHTML = 0;
  if (staffCountEl) staffCountEl.innerHTML = 0;

  loadHotels();
  loadRecentQuotes();
  updateTodayActivity();

  async function loadHotels() {

    try {

      const hotelRes = await fetch(`${CONFIG.API_BASE}/hotels?destination=Vietnam`);
      const landRes = await fetch(`${CONFIG.API_BASE}/master-data/land-services`);

      const hotelJson = await hotelRes.json();
      const landJson = await landRes.json();

      console.log(hotelJson);

      let hotelCount = 0;

      if (hotelJson.success && hotelJson.hotels) {
        hotelCount = hotelJson.hotels.length;
      }

      const landCount =
        landJson.success && landJson.data
          ? landJson.data.length
          : 0;

      document.getElementById("hotelCount").innerHTML =
        hotelCount + landCount;

    }

    catch (err) {

      console.log(err);

    }

  }

  async function loadRecentQuotes() {
    const quoteTable = document.getElementById("quoteTable");
    const quoteCount = document.getElementById("quoteCount");

    if (!quoteTable) return;

    try {
      const res = await fetch(`${DASHBOARD_API}/all`);
      const data = await res.json();

      console.log("RECENT QUOTES RESPONSE:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch quotes");
      }

      const quotes = data.quotes || [];

      if (quoteCount) {
        quoteCount.textContent = quotes.length;
      }

      if (!quotes.length) {
        quoteTable.innerHTML = `
          <tr>
            <td colspan="5">No Quotations Yet</td>
          </tr>
        `;
        return;
      }

      quoteTable.innerHTML = quotes.slice(0, 6).map(q => `
        <tr>
          <td>${q.quoteNo || "-"}</td>
          <td>${q.clientName || "-"}</td>
          <td>${q.country || "-"}</td>
          <td>$${Number(q.grandTotal || 0).toLocaleString("en-IN")}</td>
          <td>Saved</td>
        </tr>
      `).join("");

    } catch (error) {
      console.error("Dashboard recent quotes error:", error);

      quoteTable.innerHTML = `
        <tr>
          <td colspan="5">Failed to load quotations</td>
        </tr>
      `;
    }
  }
  function updateTodayActivity() {

    const quoteCreated = document.querySelector(".activity-item:nth-child(1) p");
    const pdfGenerated = document.querySelector(".activity-item:nth-child(2) p");
    const whatsappSent = document.querySelector(".activity-item:nth-child(3) p");
    const lastLogin = document.getElementById("lastLogin");

    const today = new Date().toLocaleDateString("en-IN");

    const savedToday = JSON.parse(localStorage.getItem("todayActivity")) || {
      date: today,
      quotes: 0,
      pdf: 0,
      whatsapp: 0
    };

    if (savedToday.date !== today) {
      savedToday.date = today;
      savedToday.quotes = 0;
      savedToday.pdf = 0;
      savedToday.whatsapp = 0;

      localStorage.setItem(
        "todayActivity",
        JSON.stringify(savedToday)
      );
    }

    if (quoteCreated) {
      quoteCreated.textContent =
        savedToday.quotes + " quotations created today";
    }

    if (pdfGenerated) {
      pdfGenerated.textContent =
        savedToday.pdf + " PDFs generated";
    }

    if (whatsappSent) {
      whatsappSent.textContent =
        savedToday.whatsapp + " WhatsApp sent";
    }

    if (lastLogin) {
      lastLogin.textContent =
        new Date().toLocaleString("en-IN");
    }

  }
});