const express=require('express');
const {ObjectId}=require('mongodb');
const mongoose = require("mongoose");

const profileModel=require('../models/profile_model');
const userModel=require('../models/user_model');
const postModel=require('../models/posts_model');
const alertModel=require('../models/alerts_model');
const logger=require('../middleware/winstonlogger.middleware')
const alertRouter=express.Router();

alertRouter.post('/acceptrejectRequest',async(req,res)=>{
    logger.info(`acceptrejectRequest  Alerts API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });
    const session = await mongoose.startSession();
    const {alertId,senderId,receiverId,status}=req.body;

    //status is accepted then in sender profileid increase following count and in receiver increase followers count

    //getalertId record
    try{
        session.startTransaction();
        if(status=='accepted'){
            //update alert message .
            const update = {
                $set: {
                  "senderMsg.msg": "You are now unfollowing ",
                  "receiverMsg.msg": "Started Following you Follow Back from your profile"
                }
              };
    
            const alertRes=await alertModel.findOneAndUpdate({_id:alertId},update,{session});

            //update sender following count.
            const sendProfileId=await profileModel.findByIdAndUpdate({_id:senderId},{
                $push:{following:new ObjectId(receiverId)},
                $inc: {followingCount: 1}
            },{session});

            //update receivers followers count
            const receiverProfileId=await profileModel.findByIdAndUpdate({_id:receiverId},{
                $push:{followers:new ObjectId(senderId)},
                $inc: {followersCount: 1}
            },{session});
            await session.commitTransaction();
            logger.verbose(`acceptrejectRequest Accepted Alerts API Response ${alertRes}`)
            res.status(200).send({'success':true,"message":'Request Accepted and Updated Profiles',"result":alertRes});
        }else{
            const alertRes=await alertModel.findOneAndDelete({_id:alertId},{session});
            await session.commitTransaction();
            logger.verbose(`acceptrejectRequest Rejected Alerts API Response ${alertRes}`)
            res.status(200).send({'success':true,"message":'Request Deleted Successfully',"result":alertRes});
        }
    }catch(err){
        await session.abortTransaction();
        logger.error(`acceptrejectRequest  Alerts API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Updating Profiles or Alerts',"errorMsg":err.message});
    }finally{
        session.endSession();
    }

});


alertRouter.post('/followBackRequest' ,async(req,res)=>{
    logger.info(`followBackRequest  Alerts API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });

    const {alertId,senderId,receiverId}=req.body;
    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        const update = {
            $set: {
            "senderMsg.msg": "Both are follwing Each Other",
            "receiverMsg.msg": "Both are follwing Each Other"
            }
        };

        const alertRes=await alertModel.findOneAndUpdate({_id:alertId},update,{session});

        //update sender following count.
        const sendProfileId=await profileModel.findByIdAndUpdate({_id:senderId},{
            $push:{followers:new ObjectId(receiverId)},
            $inc: {followersCount: 1}
        },{session});

        //update receivers followers count
        const receiverProfileId=await profileModel.findByIdAndUpdate({_id:receiverId},{
            $push:{following:new ObjectId(senderId)},
            $inc: {followingCount: 1}
        },{session});
        await session.commitTransaction();
        session.endSession();
        logger.verbose(`followBackRequest  Alerts API Response ${alertRes}`)
        res.status(200).send({'success':true,"message":'Request Accepted and Updated Profiles',"result":alertRes});

    }catch(err){
        await session.abortTransaction();
        logger.error(`followBackRequest  Alerts API Error ${err}`);
        res.status(500).send({'success':false,"message":'Error Updating Profiles or Alerts',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
});

alertRouter.get('/',async(req,res)=>{
    logger.info(`Get Alerts Alert API  ${req.method} ${req.url}`, {
        body: req.body, headers: req.headers,
    });
    const {profileId}=req;

    try{
        const senderData=await alertModel.find({sender:profileId});
        const receiverData=await alertModel.find({receiver:profileId});

        const result={
            sender:senderData,
            receiver:receiverData
        }
        logger.verbose(`GetAlerts Alerts API Response ${result}`)
        res.status(200).send({'success':true,"message":'Profiles Retrived Successfullt',"result":result});
    }catch(err){
        console.log(err);
        logger.error(`GetAlerts Alerts API Error ${err}`);
        res.status(500).send({'success':false,"message":'Error Retrieving Alerts',"errorMsg":err.message})
    }
})

module.exports=alertRouter;