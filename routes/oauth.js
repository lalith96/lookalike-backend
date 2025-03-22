// auth-routes.js
const express = require('express');
const passport = require('passport');
const oAuthRouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

oAuthRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login',session:false }),
  (req, res) => {
    // Successful authentication, redirect or send token
    console.log(req.user);
    const userDataJSON = JSON.stringify(req.user);
    const encodedUserData = encodeURIComponent(userDataJSON);
    res.redirect(`${process.env.REACT_URL}/google-auth?userData=${encodedUserData}`); //send token to frontend
  }
);

module.exports = oAuthRouter;