const express = require("express");
const mongoose = require("mongoose");
const cors=require('cors');
const cookieParser=require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const passport = require('passport');
require("dotenv").config();
require('./middleware/passport-setup.middleware');
const login = require("./routes/login");
const signup = require("./routes/signup");
const code = require("./routes/code");
const staticdata = require("./routes/staticdata");
const settingsRouter=require('./routes/settings');
const profileRouter=require('./routes/profile');
const searchRouter=require('./routes/search');
const alertRouter=require('./routes/alerts');
const postRouter=require('./routes/posts')
const oAuthRouter=require('./routes/oauth')
const jwtAuth=require('./middleware/auth.middleware');
const refreshSignedUrls=require('./middleware/refreshSignedUrls.middleware');
const chatRouter=require('./routes/chat.controller');
const messageRouter=require('./routes/message.controller')
const groupRouter=require('./routes/group.controller')
const onlineUserModel=require('./models/onlineuser.model');

// middleware
app.use(express.json());


app.use(cookieParser());
app.use(cors());
app.use(passport.initialize());

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("Could not connect to mongodb ..." + err));

app.get("/", (req, res) => {
  res.send("Lookalike backend server up and running");
});


app.use("/api/login", login);
app.use("/api/signup", signup);
app.use("/api/code",code);
app.use("/api/staticdata", staticdata);
app.use("/api/settings",jwtAuth,settingsRouter);
app.use("/api/profile",jwtAuth,profileRouter);
app.use("/api/search",jwtAuth,searchRouter);
app.use("/api/alerts",jwtAuth,alertRouter);
app.use('/api/posts',jwtAuth,postRouter);
app.use('/auth', oAuthRouter);
app.use('/api/chat',jwtAuth,chatRouter);
app.use('/api/messages',jwtAuth,messageRouter);
app.use('/api/groups',jwtAuth,groupRouter);

const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
     origin: '*'
  }
});

//refresh signed Urls every 5mins
setInterval(()=>{
  refreshSignedUrls()
},process.env.REFRESH_SIGNED_URL)

io.on('connection',(socket)=>{
  console.log('cient connected '+socket.id);

  socket.on('saveUser',async (loginData)=>{
      loginData.loginProfileId && await onlineUserModel.findOneAndUpdate({loginProfileId:{$eq:loginData.loginProfileId}},loginData,{upsert: true});
      try{
        const socketData=await onlineUserModel.find({});
        const socketIds=socketData.map((eachSocketData)=>eachSocketData.socket)
        console.log("onlineusers",socketData)
        io.to(socketIds).emit('onlineUsers', socketData);
        }catch(err){
          console.log(err);
        }
  });


  socket.on('sendMessage',async(messageData)=>{
    //get targetuserId socketId from onlineUsers if user is present.
    const otherUserid=messageData.otherProfileId;
    console.log(otherUserid);
    const socketData=await onlineUserModel.find({loginProfileId:{ $in:otherUserid}});
    if(socketData==null){
      console.log("other userid offline");
    }else{
      const socketIds=socketData.map((eachSocketData)=>eachSocketData.socket)
      console.log(socketIds)
      io.to(socketIds).emit('getMessage', messageData.message);
    }
  })


  socket.on('disconnect',async ()=>{
    console.log('client disconnected '+socket.id);
    const deleteRepsonse=await onlineUserModel.findOneAndDelete({socket:socket.id});
    console.log('user went offline')
  });

 
})

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log(`Running server on ${PORT}`);
    // connectToMongoDB();
})


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Running server on ${PORT}`);
// });
