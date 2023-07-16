const express = require("express");
const asyncHandler = require("express-async-handler");
const router = new express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.send("This is query router")
  })
);

module.exports = router;
