const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const User = require("./models/User");

const staffUsers = [
    {
        name: "Naznin Trip",
        email: "tln@travlog.com",
        password: "TLN@2026#N7"
    },
    {
        name: "Sejil",
        email: "tls@travlog.com",
        password: "TLS@2026#S8"
    },
    {
        name: "Gagan",
        email: "tlg@travlog.com",
        password: "TLG@2026#G9"
    }
];

async function createStaffUsers() {
    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected");

        for (const staff of staffUsers) {

            const existingUser = await User.findOne({
                email: staff.email
            });

            if (existingUser) {
                console.log(`Already exists: ${staff.email}`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                staff.password,
                10
            );

            await User.create({
                name: staff.name,
                email: staff.email,
                password: hashedPassword,
                role: "staff",
                company: "TravLog",
                active: true
            });

            console.log(`Created: ${staff.email}`);
        }

        console.log("Staff users setup completed.");

    } catch (error) {

        console.error("ERROR:", error);

    } finally {

        await mongoose.disconnect();

        console.log("MongoDB Disconnected");

    }
}

createStaffUsers();