const postTrainingRequirementSchema = require('../models/employerpostTrainingRequirementmodel')
const postJobRequirementSchema = require('../models/employerpostJobRequirementmodel')
const aws = require('aws-sdk')

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

const postTrainingRequirement = async (req, resp) => {
    const { _id } = req.user;
    try {
        // Extracting data from request body
        const {
            trainingName, description, typeOfTraining, participantCount,
            modeOfTraining, location, minBudget, maxBudget, experience,
            durationType, durationCount, selectedCountry, availability,
            startDate, endDate, urgentlyNeedTrainer,
        } = req.body;
        let { topics } = req.body

        if (typeof topics === 'string') {
            topics = JSON.parse(topics)
        }
        // Check if a TOC file is provided
        let tocUrl = '';
        if (req.file) {
            const params = {
                Bucket: 'sisso-data',
                Key: `employer/tocFile/${_id}/${req.file.originalname.replace(/\s+/g, '')}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };
            const data = await s3.upload(params).promise();
            tocUrl = data.Location;
        }

        // Create a new instance of postTrainingRequirementSchema
        const trainingDetails = new postTrainingRequirementSchema({
            trainingName, description, typeOfTraining, modeOfTraining,
            experience, participantCount, location, minBudget, maxBudget,
            durationType, durationCount, selectedCountry, availability, topics,
            startDate: new Date(startDate).toISOString().split('T')[0],
            endDate: new Date(endDate).toISOString().split('T')[0],
            tocFile: {
                tocFileName: req.file?.originalname.replace(/\s+/g, '') || '',
                tocUrl
            },
            urgentlyNeedTrainer, postedById: _id,

            postedByName: req.user?.fullName || '',
            postedByCompanyName: req.user?.companyName || '',
            postedByImg: req.user?.basicInfo?.profileImg || '',
            postedByDesignation: req.user?.designation || ''
        });

        // Save the new instance to the database
        await trainingDetails.save();

        // Respond with success message
        resp.status(200).json({
            success: true,
            message: 'TrainingPostCreatedSuccessfully',
            trainingDetails
        });
    } catch (err) {
        console.log(err);
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
};

// find postRequiement and add comments
const postTrainingRequirementComments = async (req, resp) => {
    const { comment } = req.body
    const { postId } = req.params

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ sucess: false, message: " No Post Found" })
        }
        // console.log(findTrainingPost)
        findTrainingPost.comments.push(comment);
        await findTrainingPost.save();

        const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
        resp.status(201).json({ success: true, message: 'Comment Added', postTrainingDetails })
    }
    catch (error) {
        console.log(error)
        resp.status(500).json({ sucess: false, message: "Server Error", error })
    }

}

//add like  on posts
const addLikeToTrainingPost = async (req, resp) => {
    const { likedBy } = req.body;
    const { postId } = req.params;

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        // Check if likedBy already exists in the likes array
        const existingLikeIndex = findTrainingPost.likes.findIndex(like => like._id.toString() === likedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            findTrainingPost.likes.push({ _id: likedBy }); // Assuming likedBy is an ObjectId
            await findTrainingPost.save();

            const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });

            resp.status(201).json({ success: true, message: 'Like Added', postTrainingDetails });
        } else {
            // Remove like if it already exists
            findTrainingPost.likes.splice(existingLikeIndex, 1);
            await findTrainingPost.save();
            const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });

            resp.status(201).json({ success: true, message: 'Like Removed', postTrainingDetails });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
};


const deletePostRequirement = async (req, resp) => {
    const { postId } = req.params
    // console.log(postId)
    try {
        if (req.user?.role === 'employer') {
            const postTrainingDetails = await postTrainingRequirementSchema.findOneAndDelete({ _id: postId })
            // console.log(findPostTrainingRequirements)
            if (postTrainingDetails) {
                resp.status(201).json({ success: true, message: "Deleted Successfully", postTrainingDetails })
            }
            else {
                resp.status(200).json({ success: false, message: 'Post Not Found' })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'Access Denied' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Internal Server Error', error })
    }
}


// get the post training comments 

const getTrainingRequirementComments = async (req, res) => {
    const { postId } = req.params
    const findPostTrainingComments = await postTrainingRequirementSchema.findOne({ _id: postId })
    // console.log(findPostTrainingComments.comments)
    try {
        if (!findPostTrainingComments) {
            return res.status(404).json({ success: false, msg: "No Comments found" });
        }
        else {
            await findPostTrainingComments.comments.sort((a, b) => b.createdAt - a.createdAt);

            const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, message: 'Getting all comments', postTrainingDetails });

        }
    }

    catch (error) {
        console.log(error)
        res.status(500).json({ success: false, msg: "server error" });
    }

}

const deletePostTrainingComment = async (req, resp) => {
    const { postId, commentId } = req.params;
    // console.log(postId, commentId);
    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        const commentIndex = findTrainingPost.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return resp.status(200).json({ success: false, message: "Comment not found" });
        }

        findTrainingPost.comments.splice(commentIndex, 1);
        await findTrainingPost.save();
        const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });

        resp.status(201).json({ success: true, message: 'Comment deleted', postTrainingDetails });
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

const getpostTrainingRequirement = async (req, resp) => {
    const { _id } = req.user
    // console.log(req.user)
    try {
        const postTrainingDetails = await postTrainingRequirementSchema.find({ postedById: _id })
            .sort({ createdAt: -1 });

        // console.log(postTrainingDetails)
        if (postTrainingDetails.length == 0) {
            resp.status(200).json({ success: false, message: "No Training Requirements  Found" })
        }
        else {
            resp.status(201).json({ success: true, message: 'Post TrainingRequirements Fected', postTrainingDetails })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Server Error', error });
    }
}

const postJobRequirement = async (req, resp) => {
    try {
        // Extracting data from request body
        const { jobTitle, description2, description3, salary, benifit, location2, experience2, qualificationRef, topics2 } = req.body;
        // console.log(req.body)
        const PostJobData = new postJobRequirementSchema({
            jobTitle,
            description2,
            description3,
            salary,
            benifit,
            location2,
            experience2,
            location2,
            qualificationRef,
            topics2
        });

        // Saving the new JobPost instance to the database
        await PostJobData.save()
        // console.log(PostJobData)
        // Responding with a success message
        resp.status(200).json({ sucess: true, message: 'PostJobDataSaved' })
    }
    catch (err) {
        console.log(err)
        resp.status(500).json({ sucess: false, message: 'server error ' })
    }
}

const getpostJobRequirement = async (req, resp) => {
    try {
        const postJobRequiementDetails = await postJobRequirementSchema.find()
        if (postJobRequiementDetails) {
            resp.status(201).json({ success: true, message: 'postJobDetails fetched', postJobRequiementDetails })
        }
        else {
            resp.status(200).json({ success: false, message: 'postJobDetails Data Not Found' })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

const getAllPostTrainingRequirement = async (req, resp) => {
    try {
        const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });

        if (postTrainingDetails.length == 0) {
            resp.status(200).json({ success: false, message: "No Training Requirements  Found" })
        }
        else {
            resp.status(200).json({ success: true, message: 'Post TrainingRequirements Fected', postTrainingDetails })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error', error });
    }
}

const hidePost = async (req, resp) => {
    const { hideBy } = req.body;
    const { postId } = req.params;
    console.log(req.body)

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        else {
            findTrainingPost.hide.push({ _id: hideBy });
            await findTrainingPost.save();

            const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            resp.status(201).json({ success: true, message: 'post Hided', postTrainingDetails });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = {
    postTrainingRequirement,
    getpostTrainingRequirement,
    postJobRequirement,
    getpostJobRequirement,
    postTrainingRequirementComments,
    getTrainingRequirementComments,
    addLikeToTrainingPost,
    deletePostRequirement,
    getAllPostTrainingRequirement,
    deletePostTrainingComment,
    hidePost
}