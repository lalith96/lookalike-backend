const express=require('express');

const messageRouter=express.Router();
const messageModel=require('../models/message.model');
const logger=require('../middleware/winstonlogger.middleware')


//create Message
//loggedinuser opens chat and sends teh message then we will create the message
messageRouter.post('/createMessage',async(req,res)=>{
    
    logger.info(`Create Message Chats API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });

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
        logger.verbose(`Create Message Chats API Response ${messageReponse}`)
        res.status(200).send({"success":true,"message":"Message saved successfully","response":messageReponse});
    }catch(err){
        console.log(err);
        logger.error(`Create Message Chats API Error ${err}`)
        res.status(500).send({"success":false,"message":"Error While creating message","errorMsg":err});
    }
})


//getMessages 
//when sender opens any chatId all the messages previous one should come 

messageRouter.get('/getMessages',async(req,res)=>{
    logger.info(`Get Message Chats API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });
    console.log("getMessages")
    const {chatId}=req.query;

    try{
        const messagesList=await messageModel.find({chatId});
        logger.verbose(`Get Message Chats API Response ${messagesList}`)
        res.status(200).send({"success":true,"message":"Message Retrieved successfully","response":messagesList});
    }catch(err){
        console.log(err);
        logger.error(`Get Message Chats API Error ${err}`)
        res.status(500).send({"success":false,"message":"Error While retrieving message","errorMsg":err});
    }
})

module.exports=messageRouter;