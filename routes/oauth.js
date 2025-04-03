// auth-routes.js
const express = require('express');
const passport = require('passport');
const oAuthRouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger=require('../middleware/winstonlogger.middleware')


oAuthRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login',session:false }),
  (req, res) => {
    // Successful authentication, redirect or send token
    console.log(req.user);
    const userDataJSON = JSON.stringify(req.user);
    const encodedUserData = encodeURIComponent(userDataJSON);
    logger.verbose(`encodedUserData ${JSON.stringify(encodedUserData)}  \n userDataJSON ${userDataJSON}`)
    res.redirect(`${process.env.REACT_URL}/google-auth?userData=${encodedUserData}`); //send token to frontend
  }
);

module.exports = oAuthRouter;