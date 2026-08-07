const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

// =============================
// LOAD ENV
// =============================
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

console.log("================================");
console.log("ENV FILE PATH :", path.join(__dirname, ".env"));
console.log("PORT :", process.env.PORT);
console.log("MONGODB_URI :", process.env.MONGODB_URI);
console.log("================================");

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const landServiceRoutes = require("./routes/landServiceRoutes");
const quoteDataRoutes = require("./routes/quotedata");
const quoteExportRoutes = require("./routes/quoteExportRoutes");
const emailRoutes = require("./routes/emailRoutes");
const masterDataRoutes = require("./routes/masterDataRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =============================
// MIDDLEWARE
// =============================
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());

// =============================
// STATIC FRONTEND
// =============================
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    index: false
  })
);
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));

// =============================
// ROOT
// =============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// =============================
// ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/land-services", landServiceRoutes);
app.use("/api/quote-data", quoteDataRoutes);
app.use("/api/quote-export", quoteExportRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/master-data", masterDataRoutes);

// =============================
// 404
// =============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

// =============================
// START SERVER
// =============================
async function startServer() {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {

      console.log("================================");
      console.log(`🚀 Server Running : http://localhost:${PORT}`);
      console.log("================================");

    });

  } catch (err) {

    console.error("❌ MongoDB ERROR");
    console.error(err);

  }

}

startServer();