const express=require('express');
const {ObjectId}=require('mongodb');
const mongoose = require("mongoose");

const profileModel=require('../models/profile_model');
const userModel=require('../models/user_model');
const alertModel=require('../models/alerts_model');
const upload=require('../middleware/fileUploadS3.middleware')
const {s3update}=require('../middleware/s3operations.middleware');
const logger=require('../middleware/winstonlogger.middleware')


const profileRouter = express.Router();

profileRouter.post("/editName",async (req,res)=>{
    logger.info(`Edit Name Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    }); 
    const userId=req.userID;
    const newName=req.body.name;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{fullname:newName},{new:true}).select("-password"); 
        logger.verbose(`Edit Name Profiles API Response ${userData}`)
        res.status(200).send({'success':true,"message":'name updated successfully',"result":userData})
    }catch(err){
        console.log(err);
        logger.error(`Edit Name Update Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Updating name',"errorMsg":err.message});
    }
});

profileRouter.post("/editUserName",async (req,res)=>{
    logger.info(`Edit UserName Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    }); 
    const profileId=req.profileId;
    const newUserName=req.body.username;
    try{
        const profileResp=await profileModel.findOneAndUpdate({_id:profileId},{username:newUserName},{new:true}).populate({path:'user',select:['-password']}); 
        logger.verbose(`Edit UserName Profiles API Updated Response ${profileResp}`)
        res.status(200).send({'success':true,"message":'username updated successfully',"result":profileResp})
    }catch(err){
        console.log(err);
        logger.error(`Edit UserName Update Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Updating username',"errorMsg":err.message});
    }
});


profileRouter.post("/editBio",async (req,res)=>{
    logger.info(`Edit Bio Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    }); 
    const bio=req.body.bio;
    const profileId=req.profileId;
    try{
        const profileData=await profileModel.findOneAndUpdate({_id:profileId},{bio:bio},{new:true}).populate({path:'user',select:['-password']}); 
        logger.verbose(`Edit Bio Profiles API Updated Response ${profileData}`)
        res.status(200).send({'success':true,"message":'Bio updated successfully',"result":profileData})
    }catch(err){
        console.log(err);
        logger.error(`Edit Bio Update Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Updating Bio',"errorMsg":err.message});
    }
});


profileRouter.post("/updateImage",upload.array('image'),(req,res,next)=>s3update(req,res,next),async (req,res)=>{
    logger.info(`Update Image Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    }); 
    const profileId=req.profileId;
    const {profileImg,expiresAt,profileImageUrl}=req;
    try{
        const profileData=await profileModel.findOneAndUpdate({_id:profileId},{profileImg,expiresAt,profileImageUrl},{new:true}).populate({path:'user',select:['-password']});  
        logger.verbose(`Update Image Profiles API Updated Response ${profileData}`)
        res.status(200).send({'success':true,"message":'ProfileImage updated successfully',"result":profileData})
    }catch(err){
        console.log(err);
        logger.error(`Update Image Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Updating ProfileImage',"errorMsg":err.message});
    }
});


profileRouter.post('/openProfile',async(req,res)=>{
    logger.info(`Open Profile  Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    });
    const {userID,profileId}=req;

    const targetProfileId=req.body.targetProfileId;


    //check targetprofileid is present in following array of profileid if following , send posts array .
    try{
        const resultObj=await profileModel.findOne({_id:targetProfileId,blockedByProfiles:{ $nin: [profileId] }}).populate([{path:'user',select:['-password']},{path:'posts'}]); 
        logger.verbose(`Open Profile Profiles API Updated Response ${resultObj}`)
        console.log(resultObj);
        if(resultObj){
            const following=resultObj.following;
            const result = resultObj.toObject();
            if(following && following.includes(profileId)){
                result.isFollowing="Y";
            }else{
                result['isFollowing']="N";
            }
            console.log(result)
            logger.verbose(`Open Profile Profiles API Updated Response with adding isfollowing ${resultObj}`)
            res.status(200).send({'success':true,"message":'Open Profile API successful',"result":result});
       }else{
        res.status(500).send({'success':false,"message":'Cannot open profile'});
       }
    }catch(err){
        console.log(err);
        logger.error(`Open Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error Opening profile',"errorMsg":err.message});
    }
   
});


profileRouter.post('/sendRequest',async(req,res)=>{
    logger.info(`Send Request Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    });
    const {userID,profileId,username}=req;
    const {targetProfileId,targetUserName}=req.body;

    console.log(profileId)

    try{
    //insert in alerts table 
        const senderMsg={
            msg:"Request Sent to",
            profileId:new ObjectId(targetProfileId),
            username:targetUserName
        }

        const receiverMsg={
            msg:"Received Follow Request By",
            profileId:new ObjectId(profileId),
            username:username
        }

        
        const alertMsg={
            sender:new ObjectId(profileId),
            receiver:new ObjectId(targetProfileId),
            senderMsg,
            receiverMsg
        }

        console.log(alertMsg)

        const alertData = new alertModel(alertMsg);
        const result = await alertData.save();
        logger.verbose(`Send Request API Updated Response ${result}`)
        res.status(200).send({'success':true,"message":'Request Sent',"result":result});
  }catch(err){
    console.log(err);
    logger.error(`Send Request API Error ${err}`)
    res.status(500).send({'success':false,"message":'Error while Sending Request',"errorMsg":err.message});
  }
})



profileRouter.post('/unFollowRequest',async(req,res)=>{
    logger.info(`Unfollow Request Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    });
    const {profileId}=req;
    const {targetProfileId}=req.body;
    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        //from sender  who is  unfollowing decrease following count and remove from array 
        const senderData=await profileModel.findByIdAndUpdate({_id:profileId},{$inc:{followingCount:-1},$pull:{following:targetProfileId}},{session});
        logger.verbose(`UNfollow Request API Updated senderData Response ${senderData}`)

         //from target  who is  getting unfollowed decrease followers count and remove from followers array 
        const receiverData=await profileModel.findByIdAndUpdate({_id:targetProfileId},{$inc:{followersCount:-1},$pull:{followers:profileId}},{session});
        logger.verbose(`UNfollow Request API Updated receiverData Response ${receiverData}`)

        await session.commitTransaction();
        res.status(200).send({'success':true,"message":'Unfollowed successfully'});

    }catch(err){
        console.log(err);
        logger.error(`Unfollow Request API Error ${err}`)
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while Unfollowing',"errorMsg":err.message});
    }finally{
        session.endSession();
    }

})



profileRouter.post('/blockProfile',async(req,res)=>{
    logger.info(`Block Profile Profiles API  ${req.method} ${req.url}`, {
        body: req.body, 
        userId:req.userId,
        headers: req.headers,
    });
    const {profileId}=req;
    const {targetProfileId}=req.body;
    const session = await mongoose.startSession();
   
    try{
        //decrease followers and following count by 1  if they are following
        session.startTransaction(); 
        let profileResult=await profileModel.findById({_id:profileId});
        let targetProfileResult=await profileModel.findOne({_id:targetProfileId});

        let blockingProfileUpdates=updateObj(profileResult,targetProfileId);
        blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedProfiles:targetProfileId}};
        let result=await profileModel.findByIdAndUpdate({_id:profileId},blockingProfileUpdates,{new:true,session});
        logger.verbose(`Block Profiles API Updated profileId Response ${result}`)
        

        blockingProfileUpdates=updateObj(targetProfileResult,profileId);
        blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedByProfiles:profileId}};
        result=await profileModel.findByIdAndUpdate({_id:targetProfileId},blockingProfileUpdates,{new:true,session});
        logger.verbose(`Block Profiles API Updated targetprofileId Response ${result}`)
        await session.commitTransaction();
        res.status(200).send({'success':true,"message":'Blocked successfully'});
    }catch(err){
        console.log(err);
        logger.error(`Block Profile  API Error ${err}`)
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while Blocking',"errorMsg":err.message});
    }finally{
        session.endSession();
    }

});

profileRouter.post('/unBlockProfile',async(req,res)=>{
    logger.info(`UnBlock Profile Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    });
    const {profileId}=req;
    const {targetProfileId}=req.body;
    const session = await mongoose.startSession();

    try{
        session.startTransaction(); 
        //remove from blockedprofiles in sender 
        await profileModel.findByIdAndUpdate({_id:profileId},{$pull:{blockedProfiles:targetProfileId}},{session});
        //remove from blockedBy in receiver
        await profileModel.findByIdAndUpdate({_id:targetProfileId},{$pull:{blockedByProfiles:profileId}},{session});
        await session.commitTransaction();
        logger.verbose('Unblocking profile is done')
        res.status(200).send({'success':true,"message":'UnBlock Successfull'});
    }catch(err){
        console.log(err);
        logger.error(`UnBlock Profile  API Error ${err}`)
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while unblocking',"errorMsg":err.message});
    }finally{
        session.endSession();
    }

})

profileRouter.get('/getSuggestions',async(req,res)=>{
    logger.info(`Get Suggestions  Profiles API  ${req.method} ${req.url}`, {
        body: req.body,
        userId:req.userId,
        headers: req.headers,
    });
    const {profileId}=req;
    let suggestionList=[];

    try{
        const profileList=await profileModel.findById({_id:profileId}).select('following  blockedProfiles');
    
        const friendsList=profileList.following?.map((eachFriend)=>eachFriend.toString());
        const blockedList=profileList.blockedProfiles?.map((eachFriend)=>eachFriend.toString());
        if(profileList.following.length>0){
            //all following friends profiles
            const frndOfFrnfList= await profileModel.find({_id :{$in:friendsList}}).populate('following');

            //each friend following keep in array of suggestions list
            frndOfFrnfList.map((eachFrined)=>{
                    eachFrined.following?.map((eachFollowingId)=>{
                        const followingId=eachFollowingId._id.toString();
                        if(!blockedList.includes(followingId)){
                            suggestionList.push({
                                suggestionId:followingId,
                                suggestionusername:eachFollowingId.username,
                                suggestionUserImage:eachFollowingId.profileImg
                            })
                        }
                    });
            })
        }  
        logger.verbose(`Get Suggestion Profiles API ${JSON.stringify(suggestionList)}`)
        res.status(200).send({'success':true,"message":'Suggestion List Retrieved Successfully',"result":suggestionList}); 
    }catch(err){
        console.log(err);
        logger.error(`Get Suggestion Profiles API Error ${err}`)
        res.status(500).send({'success':false,"message":'Error while Suggesting',"errorMsg":err.message});
    }
})


const updateObj=(result,pid)=>{
    let followersArray=result.followers;
        let isFollower=followersArray && followersArray.includes(new ObjectId(pid));
        let followingArray=result.following;
        let isFollowing =followingArray && followingArray.includes(new ObjectId(pid));

        let followerField=0,followingField=0;

        if(isFollower){
            followerField=-1;
        }

        if(isFollowing){
            followingField=-1;
        }

        let blockingProfileUpdates={
            $inc:{
                followersCount:followerField,
                followingCount:followingField
            },
            $pull:{followers:pid,following:pid}
        }

        return blockingProfileUpdates;
}




module.exports=profileRouter;
