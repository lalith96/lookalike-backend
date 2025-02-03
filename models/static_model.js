const mongoose = require("mongoose");

const staticSchema = mongoose.Schema(
  {
    splash: Object,
    walkthrough: [Object],
  },
  {
    collection: "staticdata",
  }
);

const staticModel = mongoose.model("staticdata", staticSchema);

exports.staticModel = staticModel;
