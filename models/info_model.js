const mongoose = require("mongoose");

const infoSchema = mongoose.Schema(
  {
    totalusers: Number,
  },
  { collection: "info" }
);

const infoModel = mongoose.model("info", infoSchema);

exports.infoModel = infoModel;
