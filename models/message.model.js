const mongoose =require('mongoose');

const messageSchema=new mongoose.Schema(
    {
        chatId:String,
        senderId:String,
        message:String
    },
    {
        timestamps:true
    }
)

const messageModel=mongoose.model("messages",messageSchema);

module.exports=messageModel;