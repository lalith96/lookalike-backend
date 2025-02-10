const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv');

const generateToken=(userData)=>{
    const token = jwt.sign(
            {
            userID: userData._id,
            email: userData.email,
            profileId:userData.profile._id,
            username:userData.profile.username
            },
            process.env.JWT_KEY
        );
    return token;
}

module.exports=generateToken;