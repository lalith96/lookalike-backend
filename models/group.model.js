const mongoose =require('mongoose');

const groupSchema=new mongoose.Schema(
    {
        groupName:String,
        groupDescription:String,
        groupImage:String
    },
    {
        timestamps:true
    }
)

const groupModel=mongoose.model("groups",groupSchema);

module.exports=groupModel;