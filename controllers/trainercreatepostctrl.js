const aws = require('aws-sdk')
require('dotenv').config()
const trainerCreatePostSchema = require('../models/trainerCreatePostmodel')

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

const trainerCreatePost = async (req, resp) => {
    const { _id } = req.user

    try {
        let postImgUrl;
        let postedImg={
            fileName: '',
            postImg: ''

        }
        if (req.file) {
            const postImg = req.file
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `trainer/trainerPost/${_id}/${postImg.originalname}`,
                Body: postImg.buffer,
                ContentType: postImg.mimetype
            };
            const data = await s3.upload(params).promise();
            // console.log("Image uploaded successfully at ", data.Location);
            postImgUrl = data.Location;
            postedImg.fileName=postImg.originalname
            postedImg.postImg=postImgUrl
            // const postedImg = {
            //     fileName: postImg.originalname,
            //     postImg: postImgUrl || ''
            // }

        }
        // else {
        //     resp.status(200).json({ success: false, message: 'Error in the Upload Image' })
        // }
        if(Object.keys(req.body).length > 0){

            const trainercreatePost = new trainerCreatePostSchema({
                postedById: _id,
                postedByName: req?.user?.basicInfo?.firstName ? req.user?.basicInfo?.firstName + req.user?.basicInfo?.lastName : req.user?.fullName || '',
                postedByDesignation: req.user?.basicInfo?.designation ? req?.user?.basicInfo?.designation : '',
                postedByImg: req.user?.basicInfo?.profileImg || '',
                postedByCompany: req.user?.basicInfo?.company ? req.user?.basicInfo?.company : '' ,
                postForAllSissoMember: req.body.postForAllSissoMember || false,
                onlyPostMyConnenctions: req.body.onlyPostMyConnenctions || false,
                postedDescrition: req.body.postDescription,
                postedImg: postedImg
            })
            // console.log(trainercreatePost)
            trainercreatePost.save()
            resp.status(201).json({ success: true, message: "Your Post has been created Successfully!", trainercreatePost });
        }
        else{
            resp.status(200).json({success:false ,message:"No Data Provided"})
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(500).json({ success: false, message: "Internal Server Error", error });
    }
}

// add like  on posts
const addLikeToTrainerPost = async (req, resp) => {
    const { likedBy } = req.body;
    const { postId } = req.params;

    try {
        const findTrainingPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        // Check if likedBy already exists in the likes array
        const existingLikeIndex = findTrainingPost.likes.findIndex(like => like._id.toString() === likedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            findTrainingPost.likes.push({ _id: likedBy }); // Assuming likedBy is an ObjectId
            await findTrainingPost.save();
            const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            // console.log('trainer',trainercreatePost)
            resp.status(201).json({ success: true, message: 'Like Added', trainercreatePost });
        } else {``
            // Remove like if it already exists
            findTrainingPost.likes.splice(existingLikeIndex, 1);
            await findTrainingPost.save();
            const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            resp.status(201).json({ success: true, message: 'Like Removed', trainercreatePost });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
};

// find postRequiement and add comments
const addTrainerPostComments = async (req, resp) => {
    const { comment } = req.body
    const { postId } = req.params

    try {
        const findTrainerPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainerPost) {
            return resp.status(200).json({ success: false, message: " No Post Found" })
        }
        // console.log(findTrainingPost)
        findTrainerPost.comments.push(comment);
        await findTrainerPost.save();
        const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })

        resp.status(201).json({ success: true, message: 'Comment Added', trainercreatePost })
    }
    catch (error) {
        console.log(error)
        resp.status(500).json({ sucess: false, message: "Server Error" })
    }

}
// delete the post training comments 

const deleteTrainerPostComment = async (req, resp) => {
    const { postId, commentId } = req.params;
    try {
        const findTrainerPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainerPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        const commentIndex = findTrainerPost.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return resp.status(200).json({ success: false, message: "Comment not found" });
        }

        findTrainerPost.comments.splice(commentIndex, 1);
        await findTrainerPost.save();
        const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 });

        resp.status(201).json({ success: true, message: 'Comment deleted', trainercreatePost });
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}


// get the post training comments 
const getTrainierPostComments = async (req, resp) => {
    const { postId } = req.params
    const findTrainerPostComments = await trainerCreatePostSchema.findOne({ _id: postId })

    try {
        if (!findTrainerPostComments) {
            return resp.status(200).json({ success: false, msg: "No Comments found" });
        }
        else {
            await findTrainerPostComments.comments.sort((a, b) => b.createdAt - a.createdAt);
            const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            resp.status(201).json({ success: true, message: 'Getting all comments', trainercreatePost });
        }
    }
    catch (error) {
        console.log(error)
        resp.status(500).json({ success: false, message: "server error" });
    }

}

const getpostTrainercreatePostById = async (req, resp) => {
    const { postId } = req.params
    try {
        const trainercreatePost = await trainerCreatePostSchema.findById(postId)
        
        if (!trainercreatePost) {
            resp.status(200).json({ success: false, message: "No Post Found" })
        }
        else {
            resp.status(201).json({ success: true, message: 'Post Fected', trainercreatePost })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
}

const getpostTrainerPost = async (req, resp) => {
    try {
        const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 });
        const tcp = await trainerCreatePostSchema.aggregate([
            {  "$addFields": { "postedByIdObj": { "$toObjectId": "$postedById" } } },
            {
              $lookup: {
                from: "trainers",
                localField: "postedByIdObj",
                foreignField: "_id",
                as: "trainer_data"
              }
            },
            // {
            //     $unwind: "$trainer_data"
            //   },
              {$set: {'trainer_data': {$first: '$trainer_data'}}},
              {$set: {
                'postedByDesignation': '$trainer_data.basicInfo.designation',
                'postedByImg': '$trainer_data.basicInfo.profileImg',
                'postedByName': '$trainer_data.basicInfo.firstName',
            }},
            {
                "$project":{
                    "_id":1,
                    "postedImg":1,
                    "onlyPostMyConnenctions":1,
                    "postForAllSissoMember":1,
                    "createdAt":1,
                    // "postedImg":1,
                    "hide":1,
                    "likes":1,
                    "comments":1,
                    "updatedAt":1,
                    "postedByDesignation":1,
                    "postedById": 1,
                    "postedByImg":1,
                    "postedByName":1,
                    "postedDescrition":1,
                    "trainer_data":1,
                }
            },
            {"$match": { "postedByImg": { "$exists" : true } }}
          ]).sort({ createdAt:-1 })
        // console.log(trainercreatePost);
        console.log("tran",tcp[0]?.trainer_data,"abck")


        if (trainercreatePost.length == 0) {
            resp.status(200).json({ success: false, message: "No Post Found" })
        }
        else {
            console.log("trainercreatePost")
            // resp.status(201).json({ success: true, message: 'Post Fected', trainercreatePost })
            resp.status(201).json({ success: true, message: 'Post Fected', trainercreatePost:tcp })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
}

//Get trainerPost by user id

const getTrainerPostBy = async (req, resp) => {
    const { _id } = req.user
    try {
        const trainercreatePost = await trainerCreatePostSchema.find({ postedById: _id }).sort({ createdAt: -1 });
        // console.log(trainercreatePost)
        if (trainercreatePost.length > 0) {
            resp.status(201).json({ success: true, message: 'Post Fected', trainercreatePost })
        }
        else {
            resp.status(200).json({ success: false, message: "No Post Found", trainerCreatePost: [] })
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, message: 'Server Error', error })
    }
}

const hidePost = async (req,resp) => {
    const { hideBy } = req.body;
    const { postId } = req.params;

    try {
        const findTrainingPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        else {
            findTrainingPost.hide.push({ _id: hideBy }); 
            await findTrainingPost.save();
            const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            resp.status(201).json({ success: true, message: 'post Hided', trainercreatePost });
        }

    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}


module.exports = {
    trainerCreatePost, addTrainerPostComments, addLikeToTrainerPost,
    getTrainierPostComments, getTrainierPostComments, getpostTrainerPost,
    getpostTrainercreatePostById, deleteTrainerPostComment, getTrainerPostBy, hidePost
}