const express = require("express");
const router = express.Router();

const { userModel } = require("../models/user_model");
const { infoModel } = require("../models/info_model");

router.post("/", async (req, res) => {
  console.log("signup req");
  console.log(req.body);
  let info = await infoModel.findOne({});
  let id = (info.totalusers = info.totalusers + 1);
  let userdata = ({
    id,
    email,
    number,
    name: fullname,
    username,
    password,
  } = req.body);
  const user_model = new userModel(userdata);
  const result = await user_model.save();
  info.save();
  res.send(result);
});

router.post("/checkuser", async (req, res) => {
  console.log(req.body);
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    res.send("userFound");
  } else {
    res.send("success");
  }
});

router.post("/checkusername", async (req, res) => {
  console.log(req.body);
  const user = await userModel.findOne({ username: req.body.username });
  if (user) {
    res.send("username already exist. Please try with different username");
  } else {
    res.send("success");
  }
});

module.exports = router;
