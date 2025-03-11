const express=require('express');
const profileModel=require('../models/profile_model')

const searchRouter=express.Router();

searchRouter.post('/',async(req,res)=>{
    const username=req.body.username;
    const userID=req.userID;


    //search with username.
    try{
        const profileList=await profileModel.find({username:{ $regex: username, $options: 'i'},user:{$ne:userID}});
        res.status(200).send({'success':true,"message":'Matching profiles',"result":profileList});
    }catch(err){
        res.status(500).send({'success':false,"message":'Error Retrieving profiles',"errorMsg":err.message});
    }

})

module.exports=searchRouter;