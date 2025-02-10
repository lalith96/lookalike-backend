const express=require('express');
const {ObjectId}=require('mongodb');

const profileModel=require('../models/profile_model');
const userModel=require('../models/user_model');
const postModel=require('../models/posts_model');
const alertModel=require('../models/alerts_model');

const alertRouter=express.Router();

alertRouter.post('/acceptrejectRequest',async(req,res)=>{
    const {alertId,senderId,receiverId,status}=req.body;

    //status is accepted then in sender profileid increase following count and in receiver increase followers count

    //getalertId record
    try{
        if(status=='accepted'){
            //update alert message .
            const update = {
                $set: {
                  "senderMsg.msg": "You are now unfollowing ",
                  "receiverMsg.msg": "Started Following you Follow Back from your profile"
                }
              };
    
            const alertRes=await alertModel.findOneAndUpdate({_id:alertId},update);

            //update sender following count.
            const sendProfileId=await profileModel.findByIdAndUpdate({_id:senderId},{
                $push:{following:receiverId},
                $inc: {followingCount: 1}
            });

            //update receivers followers count
            const receiverProfileId=await profileModel.findByIdAndUpdate({_id:receiverId},{
                $push:{followers:senderId},
                $inc: {followersCount: 1}
            });

            res.status(200).send({'success':true,"message":'Request Accepted and Updated Profiles',"result":alertRes});
            
        }else{
            const alertRes=await alertModel.findOneAndDelete({_id:alertId});
            res.status(200).send({'success':true,"message":'Request Deleted Successfully',"result":alertRes});
        }
    }catch(err){
        res.status(400).send({'success':true,"message":'Error Updating Profiles or Alerts',"errorMsg":err});
    }

});


alertRouter.post('/followBackRequest' ,async(req,res)=>{

    const {alertId,senderId,receiverId}=req.body;

    try{
        const update = {
            $set: {
            "senderMsg.msg": "Both are follwing Each Other",
            "receiverMsg.msg": "Both are follwing Each Other"
            }
        };

        const alertRes=await alertModel.findOneAndUpdate({_id:alertId},update);

        //update sender following count.
        const sendProfileId=await profileModel.findByIdAndUpdate({_id:senderId},{
            $push:{followers:receiverId},
            $inc: {followersCount: 1}
        });

        //update receivers followers count
        const receiverProfileId=await profileModel.findByIdAndUpdate({_id:receiverId},{
            $push:{following:senderId},
            $inc: {followingCount: 1}
        });

        res.status(200).send({'success':true,"message":'Request Accepted and Updated Profiles',"result":alertRes});

    }catch(err){
        res.status(400).send({'success':true,"message":'Error Updating Profiles or Alerts',"errorMsg":err});
    }
});

module.exports=alertRouter;