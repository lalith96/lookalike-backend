const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv');

dotenv.config();


const jwtAuth=(req,res,next)=>{
    const token = req.cookies.token;
    console.log(token)
    if (!token) {
        res.status(401).send('Unauthorized');
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
            res.send(401).send('Unauthorized');
        }
    } 
}

module.exports = jwtAuth;