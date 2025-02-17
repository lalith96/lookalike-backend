const express = require("express");
const router = express.Router();
const generateToken=require('../utils/token')


const  userModel  = require("../models/user_model");

router.post("/", async (req, res) => {
  console.log("inside login api");
  try{
    const userData = await userModel.findOne({
      $or: [{ email: req.body.email }, { number: req.body.number }],
    }).populate('profile');
    if (userData.password === req.body.password) {

      const token = generateToken(userData);
      res.cookie('token',token);
      const response={
        _id:userData._id,
        profileId:userData.profile._id,
        username:userData.profile.username
      }
      console.log(response);
     
      res.status(200).send( {'success':true,"message":'Login  Successful',"result":response});
    } else {
      res.clearCookie('token');
      res.status(400).send( {'success':false,"message":'Wrong password please try again'});
    }
  }catch(err){
    console.log(err);
    res.clearCookie('token');
    res.status(400).send({'success':false,"message":'Error Logging in',"error":err})
  }
});



module.exports = router;
