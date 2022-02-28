const express = require("express");
const router = express.Router();

const { userModel } = require("../models/user_model");

router.post("/", async (req, res) => {
  console.log("inside login api");
  console.log(req.body);
  const userData = await userModel.findOne({
    $or: [{ email: req.body.email }, { number: req.body.number }],
  });
  if (userData.password === req.body.password) {
    res.send(userData);
  } else {
    res.status(400).send("Wrong password! Please try again");
  }
});

module.exports = router;
