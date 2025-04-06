const mongoose =require('mongoose');

const reportSchema=new mongoose.Schema(
    {
       options:Array
    }
)

const reportModel=mongoose.model("report",reportSchema);

module.exports=reportModel;