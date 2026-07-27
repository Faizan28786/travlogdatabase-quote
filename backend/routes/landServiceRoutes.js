const express = require("express");
const router = express.Router();

const { getLandServices } = require("../controllers/landServiceController");

router.get("/", getLandServices);

module.exports = router;