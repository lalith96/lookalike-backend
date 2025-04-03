const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');
const mongoose = require("mongoose");

const otpModel  = require("../models/otp_model");
const userModel=require("../models/user_model");
const logger=require('../middleware/winstonlogger.middleware')
const  sendemail  = require("../utils/sendemail");

router.post("/getcode", async (req, res) => {
  console.log(req.body);
   logger.info(`Get Code OTPs API  ${req.method} ${req.url}`, {
          body: req.body, headers: req.headers,
      }); 
  const session = await mongoose.startSession();
  try{
    session.startTransaction();
    const email = req.body.email;
    const userResult=await userModel.find({email:email});
    if(userResult.length!=0){
      const date = new Date();
      let randnum =
        (date.getMinutes() + 1) *
        (date.getSeconds() + 1) *
        (Math.random() * 100000);
      randnum = randnum.toString().slice(0, 6);
      otpobj = await otpModel.findOne({ email });
      if (otpobj) {
        otpobj.otp = randnum;
        otpobj.time = date.getTime() + 600000;
        const result = await otpobj.save({session});
      } else {
        let newotp = {
          email,
          otp: randnum,
          time: date.getTime() + 600000,
        };
        const otpObj = new otpModel(newotp);
        await otpObj.save({session});
        logger.verbose(`Get Codes API Response ${otpObj}`)
      }
      await sendemail(randnum, email);
      logger.verbose(`send email  ${randnum} ${email}`)
      await session.commitTransaction();
      res.status(200).send({'success':true,"message":'OTP Send Successfully'});
    }else{
      await session.commitTransaction();
      res.status(200).send({'success':false,"message":'Invalid Email'});
    }
  }catch(err){
    logger.error(`Get Codes API Error ${err}`)
    await session.abortTransaction();
    res.status(500).send({'success':false,"message":'Error sending OTP',"error":err.message});
  }finally{
    session.endSession();
  }
});

router.post("/verifycode", async (req, res) => {
  logger.info(`verify Code OTPs API  ${req.method} ${req.url}`, {
    body: req.body, headers: req.headers,
}); 
  try{
  const email = req.body.email;
  const result = await otpModel.findOne({ email });
  logger.verbose(`verify Codes result Response ${otpresultObj}`)
  if (result) {
    let cur_time = new Date().getTime();
    if (cur_time <= result.time) {
      if (result.otp == req.body.otp) {
        result.time = 0;
        result.save();
        res.status(200).send({'success':true,"message":'verified successfully'});
      } else {
        res.status(200).send({'success':false,"message":'You entered wrong code. Please try again.'});
      }
    } else {
      res.status(200).send({'success':false,"message":'Your otp expired. Please try again'});
    }
  } else {
    res.status(200).send({'success':false,"message":'No otps found Request OTP again'});
  }
  }catch(err){
    logger.error(`Verify Codes API Error ${err}`)
    res.status(500).send({'success':false,"message":'Error Verfiying OTP',"error":err.message});
  }
});

router.post('/resetPassword',async(req,res)=>{
  logger.info(`Reset Password API  ${req.method} ${req.url}`, {
    body: req.body, headers: req.headers,
  }); 
  const email=req.body.email;
  const newPassword=await bcrypt.hash(req.body.newPassword, 12);

  try{
        const userData=await userModel.findOneAndUpdate({email},{password:newPassword}).select('-password').populate('profile'); 
         logger.verbose(`Reset Password userData Response ${userData}`)
        if(userData){
          res.status(200).send({'success':true,"message":'Password Updated Successfully',"result":userData});
        }else{
          res.status(500).send({'success':false,"message":'User Not  Founnd'});
        }
    }catch(err){
      console.log(err);
    logger.error(`Reset Password API Error ${err}`)
    res.status(500).send({'success':false,"message":'Error Updating Password',"errorMsg":err.message});
  }
})

module.exports = router;
