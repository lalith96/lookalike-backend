const mongoose=require('mongoose')

const postsSchema=new mongoose.Schema({
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"profiles"
    },
    img:[String],
    imgName:[String],
    expiresAt:String,
    description:String,
    location:String,
    likeCount:{
        type:Number,
        min:0
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
        min:0
    },
    commentArray:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comments"
        }
    ],    
},
{
    timestamps: true 
  })

const postModel = mongoose.model("posts", postsSchema);

module.exports=postModel;
