const mongoose=require('mongoose')

const commentSchema=new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts"
    },
    comment:String
})

const commentModel = mongoose.model("comments", commentSchema);

module.exports=commentModel;