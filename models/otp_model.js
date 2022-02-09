const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: String,
  otp: String,
  time: Number,
});

const otpModel = mongoose.model("otps", otpSchema);

exports.otpModel = otpModel;
