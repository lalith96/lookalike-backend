const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const mongoose = require("mongoose");

const  userModel  = require("../models/user_model");
const infoModel=require('../models/info_model')
const profileModel=require("../models/profile_model");
const logger=require('../middleware/winstonlogger.middleware')
const signUpValidator=require('../validators/signUp.validator')


router.post("/", (req,res,next)=>signUpValidator(req,res,next),async (req, res) => {
  logger.info(`SignUp API  ${req.method} ${req.url}`, {
      body: req.body,
      headers: req.headers,
    });
  const session = await mongoose.startSession();
  try{
    let userdata = ({
      email,
      number,
      fullname,
      password,
      gender,
    } = req.body);
    userdata.password=password!=null?await bcrypt.hash(password, 12):null;
    //check if user already present
    let isuserPresent = await userModel.findOne({$or:[{email:email},{number:number}]});
    logger.verbose(`Is user present ${isuserPresent}`)
    console.log(isuserPresent);
    if(isuserPresent){
      
      res.status(200).send({'success':true,"message":'User Already signed Up'});
    }else{
      session.startTransaction();
      const user_model = new userModel(userdata);
      const result = await user_model.save({ session });
  
  
      // save profile and then update  user also .
      const userId={
        user:result._id,
        username:email.split("@")[0]
      }
      const profileData=new profileModel(userId);
      const profileRes=await profileData.save({ session });
  
      //sve profileid in user
      const finalRes=await userModel.updateOne({_id:result._id},{profile:profileRes._id},{session});
      logger.verbose(` Final Response of SignUp API ${JSON.stringify(finalRes)}`)
      // info.save();
      await session.commitTransaction();
      res.status(200).send({'success':true,"message":'Sign Up Successful',"result":result});
    }
  }catch(err){
    console.log(err);
    logger.error(`signUp API Error ${err}`)
    await session.abortTransaction();
    res.status(500).send({'success':false,"message":"Error Signing Up","error":err.message})
  }finally{
    session.endSession();
  }
});

router.post("/checkuser", async (req, res) => {
  console.log(req.body);
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    res.send("userFound");
  } else {
    res.send("success");
  }
});

router.post("/checkusername", async (req, res) => {
  console.log(req.body);
  const user = await userModel.findOne({ username: req.body.username });
  if (user) {
    res.send("username already exist. Please try with different username");
  } else {
    res.send("success");
  }
});

module.exports = router;
