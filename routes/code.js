const express = require("express");
const router = express.Router();

const otpModel  = require("../models/otp_model");
const userModel=require("../models/user_model");

const  sendemail  = require("../utils/sendemail");

router.post("/getcode", async (req, res) => {
  console.log(req.body);
  try{
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
        const result = await otpobj.save();
      } else {
        let newotp = {
          email,
          otp: randnum,
          time: date.getTime() + 600000,
        };
        const otpObj = new otpModel(newotp);
        await otpObj.save();
      }
      await sendemail(randnum, email);
      res.status(200).send({'success':true,"message":'OTP Send Successfully'});
    }else{
      res.status(200).send({'success':false,"message":'Invalid Email'});
    }
  }catch(err){
    res.status(500).send({'success':false,"message":'Error sending OTP',"error":err.message});
  }
});

router.post("/verifycode", async (req, res) => {
  try{
  const email = req.body.email;
  const result = await otpModel.findOne({ email });
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
    res.status(500).send({'success':false,"message":'Error Verfiying OTP',"error":err.message});
  }
});

router.post('/resetPassword',async(req,res)=>{
  const email=req.body.email;
  const newPassword=req.body.newPassword;

  try{
        const userData=await userModel.findOneAndUpdate({email},{password:newPassword}).select('-password').populate('profile'); 
        if(userData){
          res.status(200).send({'success':true,"message":'Password Updated Successfully',"result":userData});
        }else{
          res.status(500).send({'success':false,"message":'User Not  Founnd'});
        }
    }catch(err){
      console.log(err);
    res.status(500).send({'success':false,"message":'Error Updating Password',"errorMsg":err.message});
  }
})

module.exports = router;
