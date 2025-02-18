const mongoose=require('mongoose')

const postsSchema=new mongoose.Schema({
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"profiles"
    },
    img:[String],
    description:String,
    location:String,
    likeCount:{
        type:Number,
        min:1
    },
    likeArray:[
        {
            profileId:{
                type:mongoose.Schema.Types.ObjectId,
                 ref:"profiles"
            },
            username:String
        }
    ],
    commentCount:{
        type:Number,
        min:1
    },
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
