const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors=require('cors');
const cookieParser=require('cookie-parser');

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

//refresh signed Urls every 5mins
setInterval(()=>{
  refreshSignedUrls()
},process.env.REFRESH_SIGNED_URL)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running server on ${PORT}`);
});
