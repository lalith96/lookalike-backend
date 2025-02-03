const express = require("express");
const router = express.Router();

router.get("/:screen", async (req, res) => {
  const screen = req.params["screen"];
  const { staticModel } = require("../models/static_model");
  const result = await staticModel.findOne({});
  res.send(result[screen]);
});

module.exports = router;
