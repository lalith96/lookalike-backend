// passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userModel = require('../models/user_model'); // Your User model
const profileModel = require('../models/profile_model');
const generateToken=require('../utils/token')


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const {email,name}=profile._json;
        let user = await userModel.findOne({ email: profile._json.email}).populate('profile');

        console.log("user",user +" profile");

        //official signup of user 
        if (!user) {
          user = new userModel({
            email: email,
            fullname: name
          });
          await user.save();

          const userId={
            user:user._id,
            username:email.split("@")[0]
          }

          const profileData=new profileModel(userId);
          const profileRes=await profileData.save();
  
          const finalRes=await userModel.updateOne({_id:user._id},{profile:profileRes._id});
        }


        const token = generateToken(user);
        const response={
          _id:user._id,
          profileId:user.profile._id,
          username:user.profile.username,
          token:token
        }
        return done(null, { user: response });
      } catch (error) {
        return done(error);
      }
    }
  )
);
