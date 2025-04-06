const {ObjectId}=require('mongodb');

const updateObj=(result,pid)=>{
    let followersArray=result.followers;
        let isFollower=followersArray && followersArray.includes(new ObjectId(pid));
        let followingArray=result.following;
        let isFollowing =followingArray && followingArray.includes(new ObjectId(pid));

        let followerField=0,followingField=0;

        if(isFollower){
            followerField=-1;
        }

        if(isFollowing){
            followingField=-1;
        }

        let blockingProfileUpdates={
            $inc:{
                followersCount:followerField,
                followingCount:followingField
            },
            $pull:{followers:pid,following:pid}
        }

        return blockingProfileUpdates;
}



module.exports={updateObj}