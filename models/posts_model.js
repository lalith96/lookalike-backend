const mongoose=require('mongoose')

const postsSchema=new mongoose.Schema({
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"profiles"
    },
    img:[String],
    description:String,
    location:String,
    likeCount:Number,
    likeArray:[
        {
            profileId:{
                type:mongoose.Schema.Types.ObjectId,
                 ref:"profiles"
            },
            username:String
        }
    ],
    commentCount:Number,
    commentArray:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comments"
        }
    ],
    createdAt:{ 
        type: Date, 
        default: Date.now
    }
})

const postModel = mongoose.model("posts", postsSchema);

module.exports=postModel;
