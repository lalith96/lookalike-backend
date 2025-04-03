const express=require('express');

const groupRouter=express.Router();
const groupModel=require('../models/group.model');
const chatModel=require('../models/chat.model')
const logger=require('../middleware/winstonlogger.middleware')


groupRouter.post('/createGroup',async(req,res)=>{
    logger.info(`Create Group Chats API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });
    const {firstId,secondId,groupName,groupDescription,groupImage}=req.body;
    try{
        //create group first 
        const groupResponse=new groupModel({groupName,groupDescription,groupImage});
        await groupResponse.save();   

        //  //createchat
        const groupId=groupResponse._id;
        const members=[...secondId];
        members.push(firstId);
        const chatResponse=new chatModel({members,groupId});
        await chatResponse.save();   
        logger.verbose(`Create group Chats API Response ${chatResponse}`)
        res.status(200).send({"success":true,"message":"Group created successfully","response":chatResponse});
    }catch(err){
        console.log(err);
        logger.error(`Create Groups Chats API Error ${err}`)
        res.status(500).send({"success":false,"message":"Error While creating chat","errorMsg":err.message});
    }
})

module.exports=groupRouter; 