const express = require("express");
const router = express.Router();

const {
    sendQuoteEmail
} = require("../controllers/emailController");

router.post("/send", sendQuoteEmail);

module.exports = router;