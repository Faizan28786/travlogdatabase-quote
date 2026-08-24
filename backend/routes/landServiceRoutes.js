const express = require("express");

const router = express.Router();

const {
    getLandServices,
    createLandService,
    updateLandService,
    deleteLandService
} = require("../controllers/landServiceController");

// Existing fetching — DON'T CHANGE
router.get("/", getLandServices);

// Add
router.post("/", createLandService);

// Update
router.put("/:id", updateLandService);

// Delete
router.delete("/:id", deleteLandService);

module.exports = router;