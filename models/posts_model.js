const mongoose=require('mongoose')

const postsSchema=new mongoose.Schema({
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"profiles"
    },
    img:[String],
    description:String,
    location:String
});

const postModel = mongoose.model("posts", postsSchema);

module.exports=postModel;
