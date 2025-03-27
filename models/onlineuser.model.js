const mongoose =require('mongoose');

const onlineUserSchema=new mongoose.Schema(
    {
        loginProfileId:String,
        socket:String
    }
)

const onlineUserModel=mongoose.model("onlineUsers",onlineUserSchema);

module.exports=onlineUserModel;