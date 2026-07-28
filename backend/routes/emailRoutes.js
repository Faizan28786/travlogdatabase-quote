const express = require("express");
const router = express.Router();

const {
    sendQuoteEmail
} = require("../controllers/emailController");

router.post("/send", sendQuoteEmail);
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Email Route Working"
    });
});
module.exports = router;