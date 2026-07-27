const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "quote export route working"
  });
});

module.exports = router;