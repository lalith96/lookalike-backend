const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

// middleware
app.use(express.json());

const login = require("./routes/login");
const signup = require("./routes/signup");
const code = require("./routes/code");
const staticdata = require("./routes/staticdata");

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
app.use("/api/code", code);
app.use("/api/staticdata", staticdata);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running server on ${PORT}`);
});
