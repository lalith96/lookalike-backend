const express=require('express');

const messageRouter=express.Router();
const messageModel=require('../models/message.model');

//create Message
//loggedinuser opens chat and sends teh message then we will create the message
messageRouter.post('/createMessage',async(req,res)=>{
    const {chatId,senderId,message}=req.body;
    // console.log("createMessages")
    

    try{
        const saveMessage={
            chatId,
            senderId,
            message
        }
        const messageReponse=new messageModel(saveMessage);
        await messageReponse.save();
        res.status(200).send({"success":true,"message":"Message saved successfully","response":messageReponse});
    }catch(err){
        console.log(err);
        res.status(500).send({"success":false,"message":"Error While creating message","errorMsg":err});
    }
})


//getMessages 
//when sender opens any chatId all the messages previous one should come 

messageRouter.get('/getMessages',async(req,res)=>{

    console.log("getMessages")
    const {chatId}=req.query;

    try{
        const messagesList=await messageModel.find({chatId});
        res.status(200).send({"success":true,"message":"Message Retrieved successfully","response":messagesList});
    }catch(err){
        console.log(err);
        res.status(500).send({"success":false,"message":"Error While retrieving message","errorMsg":err});
    }
})

module.exports=messageRouter;