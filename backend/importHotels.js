const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const mongoose = require("mongoose");

const Hotel = require("./models/Hotel");
const hotels = require("./data/hotels");

console.log("URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    family: 4
})
.then(async () => {

    console.log("🔄 Importing Hotels...");

    await Hotel.deleteMany({});
    await Hotel.insertMany(hotels);

    console.log("✅ Hotels Imported Successfully");

    process.exit();

})
.catch(err => {
    console.log("❌ Error:", err);
});