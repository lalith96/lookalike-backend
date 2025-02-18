const express=require('express');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv');
const {ObjectId}=require('mongodb')

const settingsRouter = express.Router();
const {settings,termsOfUse,privacyPolicy}=require('../data/settingsData');
const profileModel=require('../models/profile_model');
const userModel=require('../models/user_model');
const generateToken=require('../utils/token');
const alertModel=require('../models/alerts_model')



settingsRouter.get("/",async(req,res)=>{
    //get the userId;
    const userId=req.userID;
    const userData=await userModel.findOne({_id:userId}).populate('profile');
    const {email,gender,dob,theme,language,country,profile}=userData;

    //get all profiles except a particular profile.
    const profileId=userData.profile;
    const blockedProfiles=userData.profile.blockedProfiles;
    let profiles=await profileModel.find({
        _id:{$ne:profileId},visibility:true
    }).populate('user');

    profiles=profiles.filter((eachProfile)=>{
        if(!blockedProfiles.includes(eachProfile._id)){
            return eachProfile;
        }
    });
    console.log(profiles);

    //your account setup done 
    settings["Your Account"][0].PersonalInformation.DateOfBirth=!dob?settings["Your Account"][0].PersonalInformation.DateOfBirth:dob;
    settings["Your Account"][0].PersonalInformation.Gender=!gender?settings["Your Account"][0].PersonalInformation.Gender:gender;
    settings["Your Account"][0].PersonalInformation["Country/region"]=!country?settings["Your Account"][0].PersonalInformation["Country/region"]:country;
    settings["Your Account"][0].PersonalInformation.Language=!language?settings["Your Account"][0].PersonalInformation.Language:language;
    settings["Your Account"][1].EmailAddress=email;
    if(theme=="light"){
        settings["Your Account"][3].AppTheme["Light Mode"]=true;
        settings["Your Account"][3].AppTheme["Dark Mode"]=settings["Your Account"][3].AppTheme["System Default"]=false;
    }else if(theme=="dark"){
        settings["Your Account"][3].AppTheme["Dark Mode"]=true;
        settings["Your Account"][3].AppTheme["Light Mode"]=settings["Your Account"][3].AppTheme["System Default"]=false;
    }else{
        settings["Your Account"][3].AppTheme["System Default"]=true;
        settings["Your Account"][3].AppTheme["Light Mode"]=settings["Your Account"][3].AppTheme["Dark Mode"]=false;
    }
    settings["Your Account"][4]["Profile Visibility"]=profile.visibility;
    settings["Your Account"][5]["Share Profile"]=profiles;


    //support 
    settings.Support[0]["Terms Of Use"]=termsOfUse;
    settings.Support[1]["Privacy Policy"]=privacyPolicy;

    res.status(200).send(settings);
});



settingsRouter.post('/dobUpdate',async(req,res)=>{
    const userId=req.userID;
    const dob=req.body.dob;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{dob:dob},{new:true}).select('-password'); 
        res.status(200).send({'success':true,"message":'DOB Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Date Of Birth',"errorMsg":err});
    }
    
})



settingsRouter.post('/genderUpdate',async(req,res)=>{
    const userId=req.userID;
    const gender=req.body.gender;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{gender},{new:true}).select('-password'); 
        res.status(200).send({'success':true,"message":'Gender Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Gender',"errorMsg":err});
    }
})

settingsRouter.post('/countryRegion',async(req,res)=>{
    const userId=req.userID;
    const country=req.body.country;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{country},{new:true}).select('-password'); 
        res.status(200).send({'success':true,"message":'Country/Region Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Country/Region',"errorMsg":err});
    }
})

settingsRouter.post('/language',async(req,res)=>{
    const userId=req.userID;
    const language=req.body.language;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{language},{new:true}).select('-password'); 
        res.status(200).send({'success':true,"message":'Language Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Language',"errorMsg":err});
    }
})

//can we do more 

settingsRouter.post('/emailIdUpdate',async(req,res)=>{
    const userId=req.userID;
    console.log(userId);
    const email=req.body.email;
    try{
      const userData=await userModel.findOneAndUpdate({_id:userId},{email},{new:true}).select('-password').populate('profile');
      const token = generateToken(userData);
      res.cookie('token',token);
      userData.token=token;
      res.status(200).send({'success':true,"message":'Email Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Email',"errorMsg":err});
    }
})


settingsRouter.post('/passwordUpdate',async(req,res)=>{
    const userId=req.userID;
    const oldPassword=req.body.oldPassword;
    const newPassword=req.body.newPassword;
    try{
        const userPresent=await userModel.findOne({_id:userId,password:oldPassword},{new:true}).select('-password'); 
        if(userPresent){
            const userData=await userModel.findOneAndUpdate({_id:userId,password:oldPassword},{password:newPassword}).select('-password').populate('profile'); 
            const token = generateToken(userData);
            res.cookie('token',token);
            res.status(200).send({'success':true,"message":'Password Updated Successfully',"result":userData});
        }else{
            res.status(400).send({'success':false,"message":'Wrong Password'});
        }
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Password',"errorMsg":err});
    }
})

settingsRouter.post('/themeUpdate',async(req,res)=>{
    const userId=req.userID;
    const theme=req.body.theme;
    try{
        const userData=await userModel.findOneAndUpdate({_id:userId},{theme:theme},{new:true}).select('-password');  
        res.status(200).send({'success':true,"message":'Theme Updated successfully',"result":userData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Theme',"errorMsg":err});
    }
})

settingsRouter.post('/profileVisibilty',async(req,res)=>{
    const profileId=req.profileId;
    const visibility=req.body.visibility;
    try{
        const profileData=await profileModel.findByIdAndUpdate(profileId,{visibility:visibility},{new:true});
        res.status(200).send({'success':true,"message":'Visibility Updated successfully',"result":profileData})
    }catch(err){
        res.status(400).send({'success':false,"message":'Error Updating Visibility',"errorMsg":err});
    }
})

settingsRouter.post('/logout',(req,res)=>{
    res.clearCookie('token');
    res.status(200).send({'success':true,"message":'Logout Successful'});
})


settingsRouter.post('/sendProfiles',async (req,res)=>{
    const {profileId,username}=req;
    const sharedProfiles=req.body.profiles;

    console.log("send"+username);

    //getpid
    try{
       
        //create alert record for each profile taht needs  to be  shared
        sharedProfiles.forEach(async (eachprofile)=>{
            const eachUserName=eachprofile.username;
            const eachProfileId=eachprofile.profileId;
            //form input sendermsg 
            const senderMsg={
                msg:"Shared profile to",
                profileId:new ObjectId(eachProfileId),
                username:eachUserName
            }


            //form input receivermsg
            const receiverMsg={
                msg:"Shared Profile By",
                profileId:new ObjectId(profileId),
                username
            }

            console.log("rec")
            const alertMsg={
                sender:new ObjectId(profileId),
                receiver:new ObjectId(eachProfileId),
                senderMsg,
                receiverMsg
            }

            console.log(alertMsg)

            const alertData = new alertModel(alertMsg);
            const result = await alertData.save();
        })
        res.status(200).send({'success':true,"message":'Profiles Shared Successfully'})
    }catch(err){
        console.log(err);
        res.status(400).send({'success':false,"message":'Error Sharing profiles',"errorMsg":err});
    }
})

module.exports = settingsRouter;
