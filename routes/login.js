const express = require("express");
const router = express.Router();
const bcrypt=require('bcrypt');

const generateToken=require('../utils/token')
const  userModel  = require("../models/user_model");

router.post("/", async (req, res) => {
  console.log("inside login api");
  try{
    let userData=null;
    if(req.body.email){
      userData = await userModel.findOne({email: req.body.email }).populate('profile');
    }else{
      userData = await userModel.findOne({number: req.body.number }).populate('profile');
    }
    console.log(userData);
    if(userData){
      const result = await bcrypt.compare(req.body.password, userData.password);
      if (result) {
        const token = generateToken(userData);
        res.cookie('token',token);
        const response={
          _id:userData._id,
          profileId:userData.profile._id,
          username:userData.profile.username,
          token:token
        }
        console.log(response);
       
        res.status(200).send( {'success':true,"message":'Login  Successful',"result":response});
      } else {
        res.clearCookie('token');
        res.status(500).send( {'success':false,"message":'Wrong password please try again'});
      }
      }else{
      res.status(500).send( {'success':false,"message":'Enter Correct Credentials'});
    }
  }catch(err){
    console.log(err);
    res.clearCookie('token');
    res.status(500).send({'success':false,"message":'Error Logging in',"error":err.message})
  }
});



module.exports = router;
