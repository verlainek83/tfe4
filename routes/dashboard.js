const express = require("express");

const router = express.Router();

// Display the dashboard page
router.get("/", (req, res, next) => {
  res.render("dashboard");
});


module.exports = router;