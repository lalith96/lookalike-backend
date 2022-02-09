const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  id: Number,
  email: String,
  number: Number,
  fullname: String,
  username: String,
  password: String,
});

const userModel = mongoose.model("users", userSchema);

exports.userModel = userModel;
