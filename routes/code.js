const express = require("express");
const router = express.Router();

const { otpModel } = require("../models/otp_model");
const { sendMail } = require("../utils/sendemail");

router.post("/getcode", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const date = new Date();
  let randnum =
    (date.getMinutes() + 1) *
    (date.getSeconds() + 1) *
    (Math.random() * 100000);
  randnum = randnum.toString().slice(0, 6);
  otpobj = await otpModel.findOne({ email });
  if (otpobj) {
    otpobj.otp = randnum;
    otpobj.time = date.getTime() + 600000;
    const result = await otpobj.save();
  } else {
    let newotp = {
      email,
      otp: randnum,
      time: date.getTime() + 600000,
    };
    const otpObj = new otpModel(newotp);
    await otpObj.save();
  }
  sendMail(randnum, email);
  res.send(randnum);
});

router.post("/verifycode", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const result = await otpModel.findOne({ email });
  if (result) {
    let cur_time = new Date().getTime();
    if (cur_time <= result.time) {
      if (result.otp === req.body.otp) {
        result.time = 0;
        result.save();
        res.status(200).send("success");
      } else {
        res.status(200).send("You entered wrong code. Please try again.");
      }
    } else {
      res.status(200).send({ status: "Your otp expired. Please try again" });
    }
  } else {
    res.status(200).send({ status: "No otps found" });
  }
});

module.exports = router;
