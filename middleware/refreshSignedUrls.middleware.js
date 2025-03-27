require('dotenv').config();
const mongoose = require('mongoose');

const postModel=require('../models/posts_model');
const {renewSignedUrl}=require('./s3operations.middleware')


const refreshSignedUrls=async()=>{
    console.log("refreshSignedUrls")
    const session = await mongoose.startSession();
    
    let now = new Date();
    const expirationThreshold = new Date(now.getTime()+5*60*1000).getTime();
    now=now.getTime();
    console.log(now+" "+expirationThreshold)
    try{
        session.startTransaction();
        const expiringRecords = await postModel.find({expiresAt: { $lt: expirationThreshold, $gt: now }});
        if(expiringRecords.length>0){
            await renewSignedUrl(expiringRecords)
        }
        await session.commitTransaction();
    }catch(err){
        console.log(err);
        await session.abortTransaction();
    }finally{
        session.endSession();
    }
}

module.exports=refreshSignedUrls;