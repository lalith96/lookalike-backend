const express = require("express");
const router = express.Router();

const  userModel  = require("../models/user_model");
const infoModel=require('../models/info_model')
const profileModel=require("../models/profile_model");

router.post("/", async (req, res) => {
  console.log("signup req");
  // console.log(req.body);
  // let info = await infoModel.findOne({});
  // let id =1;
  // if(info){
  //   id = (info.totalusers = info.totalusers + 1);
  // }
  // console.log(id)
  try{
    let userdata = ({
      email,
      number,
      fullname,
      password,
      gender,
    } = req.body);
    
    //check if user already present
    let isuserPresent = await userModel.findOne({$or:[{email:email},{number:number}]});
    console.log(isuserPresent);
    if(isuserPresent){
      
      res.status(500).send({'success':false,"message":'User Already signed Up'});
    }else{
      const user_model = new userModel(userdata);
      const result = await user_model.save();
  
  
      // save profile and then update  user also .
      const userId={
        user:result._id,
        username:email.split("@")[0]
      }
  
      const profileData=new profileModel(userId);
      const profileRes=await profileData.save();
  
      //sve profileid in user
      const finalRes=await userModel.updateOne({_id:result._id},{profile:profileRes._id});
      // info.save();
      res.status(200).send({'success':true,"message":'Sign Up Successful',"result":result});
    }
  }catch(err){
    console.log(err);
    res.status(400).send({'success':false,"message":"Error Signing Up","error":err.message})
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
