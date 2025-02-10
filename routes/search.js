const express=require('express');
const userModel=require('../models/user_model');

const searchRouter=express.Router();

searchRouter.post('/',async(req,res)=>{
    const username=req.body.username;
    const userID=req.userID;

    //search with username.
    try{
        const userList=await userModel.find({username:{ $regex: username, $options: 'i' ,_id:{$ne:userID}}}).populate('profile');
        res.status(200).send({'success':true,"message":'Matching profiles',"result":userList});
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Retrieving profiles',"errorMsg":err});
    }

})

module.exports=searchRouter;