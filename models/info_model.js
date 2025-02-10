const mongoose=require('mongoose');

const infoSchema =new mongoose.Schema(
  {
    totalusers: Number,
  },
  { collection: "info" }
);

const infoModel = mongoose.model("info", infoSchema);

module.exports=infoModel;
