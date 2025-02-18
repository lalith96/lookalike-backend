const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv');

dotenv.config();


const jwtAuth=(req,res,next)=>{
    // const token = req.cookies.token;
    const token = req.headers['authorization'];
    console.log(token)
    if (!token) {
        res.status(401).send({'success':false,"message":'Unauthorized'});
    }
    else{
        try{
            const payload = jwt.verify(
                token,
                process.env.JWT_KEY
            );
            req.userID = payload.userID;
            req.profileId = payload.profileId;
            req.username=payload.username;
            next();
        }catch(err){
            res.status(401).send({'success':false,"message":'Unauthorized'});
        }
    } 
}

module.exports = jwtAuth;