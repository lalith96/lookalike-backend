const mongoose=require('mongoose')

const profileSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    profileImg:String,
    bio:String,
    username: {
        type:String,
        index:true,
        unique:true
    },
    visibility:  {
        type: Boolean,
        default: true
    },
    followersCount:{
        type:Number,
        default:0
    },
    followingCount:{
        type:Number,
        default:0
    },
    followers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'profiles' }] ,
    following:[{ type: mongoose.Schema.Types.ObjectId, ref: 'profiles' }],
    posts:[{ type: mongoose.Schema.Types.ObjectId, ref: 'posts' }] 
});

const profileModel = mongoose.model("profiles", profileSchema);

module.exports=profileModel;
