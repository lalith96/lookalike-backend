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

      res.status(200).send(response);
    } else {
      res.clearCookie('token');
      res.status(400).send("Wrong password! Please try again");
    }
  }catch(err){
    console.log(err);
    res.clearCookie('token');
    res.status(400).send('Error Logging In')
  }
});

module.exports = router;
