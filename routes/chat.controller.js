const express=require('express');

const chatRouter=express.Router();
const chatModel=require('../models/chat.model');
const onlineUserModel=require('../models/onlineuser.model')
const logger=require('../middleware/winstonlogger.middleware')

//createChat when someone clicked on 
chatRouter.post('/createChat',async(req,res)=>{
     logger.info(`createChat  Chats API  ${req.method} ${req.url}`, {
              body: req.body, headers: req.headers,
          });
    const {firstId,secondId}=req.body;

    try{
        let chatResponse=await chatModel.findOne({members:{$all:[firstId,secondId]}});
        if(!chatResponse){
            const chatReq={
                members:[firstId,secondId]
            }
            chatResponse=new chatModel(chatReq);
            await chatResponse.save();
        }
        logger.verbose(`createChat  Chats API Response ${chatResponse}`)
        res.status(200).send({"success":true,"message":"Chat created successfully","response":chatResponse});
    }catch(err){
        console.log(err);
        logger.error(`createChat  Chats API  Error ${err}`)
        res.status(500).send({"success":false,"message":"Error While creating chat","errorMsg":err.message});
    }
})

//getusrchats -- when chats is clicked all existing chats which all ae there

chatRouter.get('/getChats',async(req,res)=>{
    logger.info(`GetChats Chats API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });
    const {profileId}=req;

    try{
        const chats=await chatModel.find({members:{$in:[profileId]}}).populate('members').populate('groupId');
        // console.log(chats)
        logger.verbose(`chats Chats API Response ${chats}`)
        res.status(200).send({"success":true,"message":"Chats Fetched successfully","response":chats});
    }catch(err){
        console.log(err);
        logger.error(`GetChats  Chats API  Error ${err}`)
        res.status(500).send({"success":false,"message":"Error Getting Chats for user","errorMsg":err.message})
    }   
    
})

module.exports=chatRouter;