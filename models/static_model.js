const mongoose = require("mongoose");

const staticSchema =new  mongoose.Schema(
  {
    splash: Object,
  },
  {
    collection: "staticdata",
  }
);

const staticModel = mongoose.model("staticdata", staticSchema);

module.exports = staticModel;
