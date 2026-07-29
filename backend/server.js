const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const landServiceRoutes = require("./routes/landServiceRoutes");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const quoteDataRoutes = require("./routes/quotedata");
const quoteExportRoutes = require("./routes/quoteExportRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */
/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5501"
    ],
    credentials: true
  })
);

app.use(cookieParser());

app.use(
  express.static(path.join(__dirname, "../frontend"), {
    index: false,
  })
);
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));
app.use("/api/land-services", landServiceRoutes);

/* =========================================================
   ROOT
========================================================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

/* =========================================================
   ROUTES
========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/quote-data", quoteDataRoutes);
app.use("/api/quote-export", quoteExportRoutes);
app.use("/api/email", emailRoutes);

/* =========================================================
   404
========================================================= */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* =========================================================
   SERVER START
========================================================= */
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
}

startServer();