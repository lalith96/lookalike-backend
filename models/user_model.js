const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({
  id: Number,
  email: {
    type:String,
    unique:true
  },
  number: {
    type:Number,
    unique:true
  },
  fullname: String,
  password: String,
  gender:String,
  dob:Date,
  country:String,
  language:String,
  theme:String,
  profile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"profiles"
  }
});

 const userModel = mongoose.model("users", userSchema);

module.exports=userModel;