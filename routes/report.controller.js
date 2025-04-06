const express=require('express');
const mongoose = require("mongoose");
require("dotenv").config();

const profileModel=require('../models/profile_model');
const logger=require('../middleware/winstonlogger.middleware')
const reportRouter=express.Router();
const reportModel=require('../models/report.model')
const {updateObj}=require('../utils/profileUtils')
const {sendReportEmail}= require("../utils/sendemail");


reportRouter.post('/addReportOptions',async(req,res)=>{
    try{
        const optionsArray=req.body.options;
        let updatedReportOptions=await reportModel.findOneAndUpdate({},{$push:{options:optionsArray}},{new:true});
        if(!updatedReportOptions){
            updatedReportOptions=new reportModel({options:optionsArray});
            await updatedReportOptions.save(); 
        }
        console.log(updatedReportOptions);
        res.status(200).send({"success":true,"message":"Report Options Retrieved successfully","response":updatedReportOptions});
    }catch(err){
        console.log(err);
        res.status(500).send({"success":false,"message":"Error While Updating report Options","errorMsg":err.message})
    }
})

reportRouter.get('/getReportOptions',async(req,res)=>{
    try{
        const reportList=await reportModel.find();
        console.log(reportList);
        res.status(200).send({"success":true,"message":"Report Options Retrieved successfully","response":reportList});
    }catch(err){
        console.log(err);
        res.status(500).send({"success":false,"message":"Error While retrieving report Options","errorMsg":err.message})
    }
});

reportRouter.post('/reportUser',async(req,res)=>{
    const {reportedUserName,reason,reportProfileId}=req.body;
    const companyEmail=process.env.COMPANY_MAIL_ID;
    const {profileId,username}=req;
    const session = await mongoose.startSession();
       
        try{
            //decrease followers and following count by 1  if they are following and then send reportemail
            session.startTransaction(); 
            let profileResult=await profileModel.findById({_id:profileId});
            let targetProfileResult=await profileModel.findOne({_id:reportProfileId});
    
            let blockingProfileUpdates=updateObj(profileResult,reportProfileId);
            blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedProfiles:reportProfileId}};
            let result=await profileModel.findByIdAndUpdate({_id:profileId},blockingProfileUpdates,{new:true,session});
            logger.verbose(`Block Profiles API Updated profileId Response ${result}`)
            
    
            blockingProfileUpdates=updateObj(targetProfileResult,profileId);
            blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedByProfiles:profileId}};
            result=await profileModel.findByIdAndUpdate({_id:reportProfileId},blockingProfileUpdates,{new:true,session});
            logger.verbose(`Block Profiles API Updated reportProfileId Response ${result}`)

            sendReportEmail(reason,reportedUserName,reportProfileId,username,profileId,companyEmail);
            await session.commitTransaction();
            res.status(200).send({'success':true,"message":'Reported Successfully'});
        }catch(err){
            console.log(err);
            logger.error(`Block Profile  API Error ${err}`)
            await session.abortTransaction();
            res.status(500).send({'success':false,"message":'Error while Reporting',"errorMsg":err.message});
        }finally{
            session.endSession();
        }
})

module.exports=reportRouter;