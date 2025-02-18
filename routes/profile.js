const express=require('express');
const {ObjectId}=require('mongodb');

const profileModel=require('../models/profile_model');
const userModel=require('../models/user_model');
const alertModel=require('../models/alerts_model');


const profileRouter = express.Router();

profileRouter.post("/editName",async (req,res)=>{
    const userId=req.userID;
    const newName=req.body.name;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{fullname:newName},{new:true}).select("-password");  
        res.status(200).send({'success':true,"message":'name updated successfully',"result":userData})
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Updating name',"errorMsg":err});
    }
});

profileRouter.post("/editUserName",async (req,res)=>{
    const profileId=req.profileId;
    const newUserName=req.body.username;
    try{
        const profileResp=await profileModel.findOneAndUpdate({_id:profileId},{username:newUserName},{new:true}).populate({path:'user',select:['-password']}); 
        res.status(200).send({'success':true,"message":'username updated successfully',"result":profileResp})
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Updating username',"errorMsg":err});
    }
});


profileRouter.post("/editBio",async (req,res)=>{
    const bio=req.body.bio;
    const profileId=req.profileId;
    try{
        const profileData=await profileModel.findOneAndUpdate({_id:profileId},{bio:bio},{new:true}).populate({path:'user',select:['-password']}); 
        res.status(200).send({'success':true,"message":'Bio updated successfully',"result":profileData})
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Updating Bio',"errorMsg":err});
    }
});


profileRouter.post("/updateImage",async (req,res)=>{
    const {image}=req.body;
    const profileId=req.profileId;
    try{
        const profileData=await profileModel.findOneAndUpdate({_id:profileId},{profileImg:image},{new:true}).populate({path:'user',select:['-password']});  
        res.status(200).send({'success':true,"message":'ProfileImage updated successfully',"result":profileData})
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Updating ProfileImage',"errorMsg":err});
    }
});


profileRouter.post('/openProfile',async(req,res)=>{
    const {userID,profileId}=req;

    const targetProfileId=req.body.targetProfileId;


    //check targetprofileid is present in following array of profileid if following , send posts array .
    try{
        const resultObj=await profileModel.findOne({_id:targetProfileId,blockedByProfiles:{ $nin: [profileId] }}).populate({path:'user',select:['-password'],path:'posts'}); 
        if(resultObj){
            const following=resultObj.following;
            const result = resultObj.toObject();
            if(following && following.includes(profileId)){
                result.isFollowing="Y";
            }else{
                result['isFollowing']="N";
            }
            console.log(result)
            res.status(200).send({'success':true,"message":'Open Profile API successful',"result":result});
       }else{
        res.status(400).send({'success':false,"message":'Cannot open profile'});

       }
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Opening profile',"errorMsg":err});
    }
   
});


profileRouter.post('/sendRequest',async(req,res)=>{
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
        res.status(200).send({'success':true,"message":'Request Sent',"result":result});
  }catch(err){
    console.log(err);
    res.status(400).send({'success':false,"message":'Error while Sending Request',"errorMsg":err});
  }
})



profileRouter.post('/unFollowRequest',async(req,res)=>{
    const {profileId}=req;
    const {targetProfileId}=req.body;

    try{
        //from sender  who is  unfollowing decrease following count and remove from array 
        const senderData=await profileModel.findByIdAndUpdate({_id:profileId},{$inc:{followingCount:-1},$pull:{following:targetProfileId}});

         //from target  who is  getting unfollowed decrease followers count and remove from followers array 
        const receiverData=await profileModel.findByIdAndUpdate({_id:targetProfileId},{$inc:{followersCount:-1},$pull:{followers:profileId}});

        res.status(200).send({'success':true,"message":'Unfollowed successfully'});

    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error while Unfollowing',"errorMsg":err});
    }

})



profileRouter.post('/blockProfile',async(req,res)=>{
    const {profileId}=req;
    const {targetProfileId}=req.body;

    try{
        //decrease followers and following count by 1  if they are following 
        let profileResult=await profileModel.findById({_id:profileId});
        let targetProfileResult=await profileModel.findById({_id:targetProfileId});

        let blockingProfileUpdates=updateObj(profileResult,targetProfileId);
        blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedProfiles:targetProfileId}};
        let result=await profileModel.findByIdAndUpdate({_id:profileId},blockingProfileUpdates,{new:true});

        blockingProfileUpdates=updateObj(targetProfileResult,profileId);
        blockingProfileUpdates={...blockingProfileUpdates,$push:{blockedByProfiles:profileId}};
        result=await profileModel.findByIdAndUpdate({_id:targetProfileId},blockingProfileUpdates,{new:true});
        res.status(200).send({'success':true,"message":'Blocked successfully'});
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error while Blocking',"errorMsg":err});
    }

});

profileRouter.post('/unBlockProfile',async(req,res)=>{
    const {profileId}=req;
    const {targetProfileId}=req.body;

    try{
        //remove from blockedprofiles in sender 
        await profileModel.findByIdAndUpdate({_id:profileId},{$pull:{blockedProfiles:targetProfileId}});
        //remove from blockedBy in receiver
        await profileModel.findByIdAndUpdate({_id:targetProfileId},{$pull:{blockedByProfiles:profileId}});
        res.status(200).send({'success':true,"message":'UnBlock Successfull'});
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error while unblocking',"errorMsg":err});
    }

})


const updateObj=(result,pid)=>{
    let followersArray=result.followers;
        let isFollower=followersArray.includes(new ObjectId(pid));
        let followingArray=result.following;
        let isFollowing =followingArray.includes(new ObjectId(pid));

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
