const dotenv=require('dotenv');
dotenv.config();
const {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand}=require('@aws-sdk/client-s3')
const {getSignedUrl}=require('@aws-sdk/s3-request-presigner');
const postModel = require('../models/posts_model');
const profileModel = require('../models/profile_model');

const s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});


const s3upload=async(req,res,next)=>{


   const imageUrls=[];
   const imageFileNames=[];
   let profileImage="";
   let profileImageUrl="";
    
    const fileUploads=req.files;
    const profileId=req.profileId;
    try{
        await Promise.all(
            fileUploads?.map(async (eachFileUpload,index)=>{
                const params={
                    Bucket:process.env.BUCKET_NAME,
                    Key:eachFileUpload.originalname+"-"+profileId,
                    Body:eachFileUpload.buffer,
                    ContentType:eachFileUpload.mimetype
                }

                const command=new PutObjectCommand(params);
                await s3.send(command);

                const getObjectParams={
                    Bucket:process.env.BUCKET_NAME,
                    Key:eachFileUpload.originalname+"-"+profileId
                }
                const getCommand=new GetObjectCommand(getObjectParams);
                const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: process.env.EXPIRE_SIGNED_URL });
                if(req.url=="/updateImage"){
                    profileImageUrl=signedUrl;
                    profileImage=eachFileUpload.originalname+"-"+profileId;
                }else{
                    imageUrls.push(signedUrl)
                    imageFileNames.push(eachFileUpload.originalname+"-"+profileId)
                }
            })
        )
        req.img=imageUrls;
        req.imageNames=imageFileNames;
        req.profileImg=profileImage;
        req.profileImageUrl=profileImageUrl;
        req.expiresAt=new Date(new Date().getTime()+process.env.EXPIRE_SIGNED_URL*1000).getTime();
        
    }catch(err){
        throw err;
    }
    next();
}

const s3delete=async(postData)=>{
    const {imgName}=postData;
    console.log(imgName)
    try{
        await Promise.all(
            imgName.map(async (eachImgName)=>{
                const params={
                    Bucket:process.env.BUCKET_NAME,
                    Key:eachImgName
                }

                const command=new DeleteObjectCommand(params);
                await s3.send(command);
            })
        );
    }catch(err){
        console.log(err);
        throw err;
    }
}


const s3update=async(req,res,next)=>{
    const {imgFileNames}=req.body;
    if(imgFileNames && (req.files)?.length>0){
        try{
            //delete the files 
            const postData={
                imgName:imgFileNames
            }
            await s3delete(postData);

            //upload the  files
            await s3upload(req,res,next);
        }catch(err){
            console.log(err);
            throw err;
        }
    }else{
        next();
    }
}

const updatePostModelWithSignedUrls=async (img,imgName,expiresAt,id)=>{
    const updateData={
        img,
        imgName,
        expiresAt
    }


    try{
        await postModel.findByIdAndUpdate({_id:id},updateData);
    }catch(err){
        console.log(err.message);
    }
}

const updateProfileModelWithSignedUrls=async (profileImg,profileImageUrl,expiresAt,id)=>{
    const updateData={
        profileImg,
        profileImageUrl,
        expiresAt
    }


    try{
        await profileModel.findByIdAndUpdate({_id:id},updateData);
    }catch(err){
        console.log(err.message);
    }
}

const renewSignedUrl=async(expiringRecords)=>{

    try{
        await Promise.all(
            expiringRecords.map(async (eachExpiringRecord)=>{
                const imgName=eachExpiringRecord.imgName;
                imgName.map(async (eachImgDetail,index)=>{
                    const getObjectParams={
                        Bucket:process.env.BUCKET_NAME,
                        Key:eachImgDetail
                    }
                    const getCommand=new GetObjectCommand(getObjectParams);
                    const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: process.env.EXPIRE_SIGNED_URL });
                    eachExpiringRecord.img[index]=signedUrl;
                })
                eachExpiringRecord.expiresAt=new Date(new Date().getTime()+process.env.EXPIRE_SIGNED_URL*1000).getTime();
                await updatePostModelWithSignedUrls(eachExpiringRecord.img,eachExpiringRecord.imgName,eachExpiringRecord.expiresAt,eachExpiringRecord._id);
            })
        ); 
        console.log("after")
        console.log(expiringRecords);
    }catch(err){
        console.log(err);
    }
}


const renewProfileImageSignedUrl=async(expiringRecords)=>{

    try{
        await Promise.all(
            expiringRecords.map(async (eachExpiringRecord)=>{
                const profileImg=eachExpiringRecord.profileImg;
                    const getObjectParams={
                        Bucket:process.env.BUCKET_NAME,
                        Key:profileImg
                    }
                    const getCommand=new GetObjectCommand(getObjectParams);
                    const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: process.env.EXPIRE_SIGNED_URL });
                    eachExpiringRecord.profileImageUrl=signedUrl;
                    eachExpiringRecord.expiresAt=new Date(new Date().getTime()+process.env.EXPIRE_SIGNED_URL*1000).getTime();
                     await updateProfileModelWithSignedUrls(eachExpiringRecord.profileImg,eachExpiringRecord.profileImageUrl,eachExpiringRecord.expiresAt,eachExpiringRecord._id);
                })
            )
        console.log("after")
        console.log(expiringRecords);
    }catch(err){
        console.log(err);
    }
}

module.exports={s3upload,s3delete,s3update,renewSignedUrl,renewProfileImageSignedUrl};


