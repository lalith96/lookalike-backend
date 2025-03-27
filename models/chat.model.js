const mongoose =require('mongoose');

const chatSchema=new mongoose.Schema(
    {
        members:Array,
        groupId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"groups"
        }
    },
    {
        timestamps:true
    }
)

const chatModel=mongoose.model("chats",chatSchema);

module.exports=chatModel;