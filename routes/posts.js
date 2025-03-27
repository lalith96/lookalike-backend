const express=require('express');
const postRouter=express.Router();
const {ObjectId}=require('mongodb');
const mongoose = require('mongoose');

const profileModel=require('../models/profile_model');
const postModel=require('../models/posts_model');
const commentModel=require('../models/comments_model');
const alertModel = require('../models/alerts_model');
const upload=require('../middleware/fileUploadS3.middleware');
const {s3upload,s3delete,s3update}=require('../middleware/s3operations.middleware');

postRouter.post("/addPost",upload.array('postImages'),(req,res,next)=>s3upload(req,res,next),async (req,res)=>{
    const {location,description}=req.body;
    const {img,imageNames,expiresAt}=req;
    const profileId=req.profileId;
    const session = await mongoose.startSession();
    
    try{
        session.startTransaction();
        //add into posts array.
        const postData={
            profile:profileId,
            img:img,
            imgName:imageNames,
            expiresAt:expiresAt,
            location,
            description
        }

        
        const post_model = new postModel(postData);
        const postResponse = await post_model.save({session});

        //add in profile record in posts array
        const profileRes=await profileModel.findOneAndUpdate({_id:profileId},{$push:{posts:postResponse._id}},{new:true,session}).populate({path:'user',select:['-password']}); 
        await session.commitTransaction();
        res.status(200).send({'success':true,"message":'post added successfully',"result":profileRes})
    }catch(err){
        console.log(err);
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error adding post',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
});

postRouter.delete('/deletePost',async(req,res)=>{
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        //delete comments 
        const postId=req.query.postId;
        const {profileId}=req;
        console.log(postId+" "+profileId)

        
        //delete post
       const postData= await postModel.findOneAndDelete({_id:postId,profile:profileId},{session});
       
       //delete comments:
        const commentsData=postData?await commentModel.deleteMany({postId:postId},{session}):null;

        //delet post from profile 
        const result=postData?await profileModel.findOneAndUpdate({_id:profileId},{$pull:{posts:postId}},{new:true,session}):null;

        //delete from s3
        postData && await s3delete(postData);

        await session.commitTransaction()
        if(result){
            res.status(200).send({'success':true,"message":'Post Deleted Successfully',"result":result});
            return;
        }
        res.status(500).send({'success':false,"message":'Invalid Access'});
    }catch(err){
        console.log(err);
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while deleting post',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
})


postRouter.put('/updatePost',upload.array('postImages'),(req,res,next)=>s3update(req,res,next),async(req,res)=>{

    const {location,description}=req.body;
    const postId=req.query.postId;
    const {profileId,img,imageNames,expiresAt}=req;
    try{    
        const postData={
            location,
            description
        }

        if(img && imageNames && expiresAt){
            postData.img=img
            postData.imgName=imageNames
            postData.expiresAt=expiresAt
        }
       
        const result=await postModel.findOneAndUpdate({_id:postId,profile:profileId},postData,{new:true});

        if(result){
            res.status(200).send({'success':true,"message":'Post Updated Successfully',"result":result});
            return;
        }
        res.status(500).send({'success':false,"message":'Invalid Access'});
    }catch(err){
        console.log(err);
        res.status(500).send({'success':false,"message":'Error while updating post',"errorMsg":err.message});
    }
})

postRouter.post('/savePost',async(req,res)=>{
    const {profileId}=req;
    const {postId}=req.body;
    
    try{
        const result=await profileModel.findOneAndUpdate({_id:profileId}, { $addToSet: { savedPosts: postId } },{new:true});
        res.status(200).send({'success':true,"message":'Saved Post Successfully',"result":result});
    }catch(err){
        res.status(500).send({'success':false,"message":'Error while saving post',"errorMsg":err.message});
    }
});

postRouter.post('/unsavePost',async(req,res)=>{
    const {profileId}=req;
    const {postId}=req.body;
    
    try{
        const result=await profileModel.findOneAndUpdate({_id:profileId},{$pull:{savedPosts:postId}},{new:true});
        res.status(200).send({'success':true,"message":'UnSaved Post Successfully',"result":result});
    }catch(err){
        res.status(500).send({'success':false,"message":'Error while unsaving post',"errorMsg":err.message});
    }
});

postRouter.get('/getSavedPosts',async(req,res)=>{
    const {profileId}=req;
    const {postId}=req.body;
    
    try{
        const result=await profileModel.find({_id:profileId}).populate('posts');
        res.status(200).send({'success':true,"message":'Posts Retrieved Successfully',"result":result[0].savedPosts});
    }catch(err){
        res.status(500).send({'success':false,"message":'Error while retrieving posts',"errorMsg":err.message});
    }
});

//toggleLike 
postRouter.post('/toggleLike',async(req,res)=>{
    const onOrOff=req.body.toggleLike;
    const postId=req.query.postId;
    const {profileId,username}=req;
    const session = await mongoose.startSession();

    try{
        session.startTransaction();
    //for particular postId,insert profileand username
        const addlike={
            $inc:{likeCount:1},
            $push:{likeArray:{profileId,username}}
        }

        const removeLike={
            $inc:{likeCount:-1},
            $pull:{likeArray:{profileId,username}}
        }
        const result=await postModel.findByIdAndUpdate({_id:postId},onOrOff=="ON"?addlike:removeLike,{new:true,session}).populate('profile')

        //add into alert profileId --loggedinuser  result.profile is target /receiver post
  
        if(profileId!=result.profile._id.toString() && onOrOff=="ON"){
            alertSave("you liked post of ","liked your post",result.profile._id,profileId,result.profile.username,username,postId,session);
        }else if(onOrOff=="OFF"){
            const alertDeleteData=await alertModel.deleteOne({postId:postId},{session});
            console.log(alertDeleteData)
        }
       await session.commitTransaction()
        if(result){
            res.status(200).send({'success':true,"message":'Likes Updated Successfully',"result":result});
            return;
        }
        res.status(500).send({'success':false,"message":'Invalid Access'});
    }catch(err){
        console.log(err);
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while Liking post',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
})


//add comment
postRouter.post('/addComment',async(req,res)=>{
    const postId=req.query.postId;
    const {profileId,username}=req;
    const {comment}=req.body;
    const session = await mongoose.startSession();
    try{
        //add in comments  db 
        session.startTransaction();
        const commentData=new commentModel({postId,comment,commentByProfileId:profileId,commentByProfileName:username})
        await commentData.save();
        console.log("comment done")
        //add in posts db with the commentid 
        const commentid=commentData._id;
        const postResult=await postModel.findByIdAndUpdate({_id:postId},{$push:{commentArray:commentid},$inc:{commentCount:1}},{new:true,session}).populate('profile')
        console.log("post done")
        //add in alerts 
        if(postResult && profileId!=postResult.profile._id.toString()){
            alertSave("you have commented on post","commented on your post",postResult.profile._id,profileId,postResult.profile.username,username,postId,commentid,session);
            console.log("alert done")
        }
       await session.commitTransaction();
        res.status(200).send({'success':true,"message":'Comment Added Successfully',"result":postResult});
    }catch(err){
        console.log(err);
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while adding comment',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
})

postRouter.put('/updateComment',async (req,res)=>{
    const {comment}=req.body;
    const {profileId,username}=req;
    const commentId=req.query.commentId;
    
    try{
        //update comment table
        const commentData=await commentModel.findByIdAndUpdate({_id:commentId,commentByProfileId:profileId},{comment,commentByProfileName:username},{new:true});
        if(commentData){
            res.status(200).send({'success':false,"message":'Comment Added Successfully',"result":commentData});
        }else{
            res.status(500).send({'success':false,"message":'Invalid access'});
        }
    }catch(err){
        console.log(err);
        res.status(500).send({'success':false,"message":'Error while updating comment',"errorMsg":err.message});
    }
})


//deletecomment
postRouter.delete('/deleteComment',async(req,res)=>{
    const commentId=req.query.commentId;
    const {profileId,username}=req;
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        //add in comments  db 
        const commentData=await commentModel.findByIdAndDelete({_id:commentId,commentByProfileId:profileId},{session});
        console.log(commentData);
        //add in posts db with the commentid 
        if(commentData){
            const postId=commentData.postId;
            const postResult=await postModel.findByIdAndUpdate({_id:postId},{$pull:{commentArray:commentId},$inc:{commentCount:-1}},{new:true,session},{}).populate('profile')
            
            //delete in alerts
            await alertModel.deleteOne({commentId},{session});
            await session.commitTransaction();
            res.status(200).send({'success':true,"message":'Comment Deleted Successfully',"result":postResult});
        }else{
            await session.commitTransaction();
            res.status(500).send({'success':false,"message":'Error while deleting comment'});
        }
    }catch(err){
        console.log(err);
        await session.abortTransaction();
        res.status(500).send({'success':false,"message":'Error while deleting comment',"errorMsg":err.message});
    }finally{
        session.endSession();
    }
})

postRouter.get("/getComments",async(req,res)=>{
    try{
        const postId=req.query.postId;
        const comments=await commentModel.find({postId:postId});
        res.status(200).send({'success':true,"message":'Comment Retrieved Successfully',"result":comments});
    }catch(err){
        res.status(500).send({'success':false,"message":'Error Retrieving Comments',"errorMsg":err.message});
    }
});


async function  alertSave(sendermsg,receivermsg,receiverProfileId,senderProfileId,receiverusername,senderusername,postId,commentId,session){
    const senderMsg={
        msg:sendermsg,
        profileId:new ObjectId(receiverProfileId),
        username:receiverusername
    }

    const receiverMsg={
        msg:receivermsg,
        profileId:new ObjectId(senderProfileId),
        username:senderusername
    }

    
    const alertMsg={
        sender:new ObjectId(senderProfileId),
        receiver:new ObjectId(receiverProfileId),
        senderMsg,
        receiverMsg,
        postId:postId,
        commentId:commentId
    }

    const alertData = new alertModel(alertMsg);
    const alertResult = await alertData.save({session});
}


module.exports=postRouter;