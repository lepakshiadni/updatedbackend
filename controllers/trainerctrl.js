const aws = require('aws-sdk')
const trainerSchema = require('../models/trainermodel');
const bookMarkedTrainingPostSchema = require('../models/bookmarkedTrainingPostmodel.js');
const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const trainerCreatePostSchema = require('../models/trainerCreatePostmodel.js')
const SkillSchema = require('../models/skillmodel.js')
const { generateToken } = require('../config/jwttoken.js')
const { generateS3UploadParams } = require('../utils/uploads3.js');
const { compareOtp } = require('../utils/services.js');
require('dotenv').config()


aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

// const generateS3UploadParams = (bucketName, file) => {
//     return {
//         Bucket: bucketName,
//         Key: `${file.originalname}`, // Customize the key as needed
//         Body: file.buffer,
//         ContentType: file.mimetype
//     };
// };


const testProfileApi = async (req, resp) => {

    // const profileImg=req.file

    // let url;
    // const params=generateS3UploadParams('sisso-data',profileImg)
    // const data=await s3.upload(params).promise()
    // url=data.Location
    // console.log(url)

}

const trainerSignUp = async (req, resp) => {

    const { fullName, experience, skills, primaryNumber, role, } = req.body
    console.log(req.body, role)
    const findTrainer = await trainerSchema.findOne({ primaryNumber });
    if (!findTrainer) {
        try {
            const trainerDetails = new trainerSchema({
                fullName: fullName,
                experience: experience,
                skills: skills?.map(({ name, image }) => ({ name, image, })),
                role: role,
                contactInfo: {
                    primaryNumber: primaryNumber,
                },
            })
            await trainerDetails.save();
            const token = await generateToken(trainerDetails?._id)
            console.log(token)
            resp.status(200).json({ success: true, message: 'TrainerProfile Created Successfully', trainerDetails, token });
        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, message: 'Internal server error' });
        }
    } else {
        resp.status(401).json({ success: false, message: 'Entered user already exists. Please log in.' });
    }
};


const trainerBasicInfoUpdate = async (req, resp) => {
    const { _id } = req.user
    console.log(req.body)

    try {
        let profileImgUrl;
        if (req.files['profileImg']) {
            const profileImg = req.files['profileImg'][0];
            const params = {
                Bucket: 'sisso-data',
                Key: `profile/${_id}/${profileImg.originalname}`,
                Body: profileImg.buffer,
                ContentType: profileImg.mimetype
            };
            const data = await s3.upload(params).promise();
            profileImgUrl = data.Location;
        }

        // Upload profile banner to S3
        let profileBannerUrl;
        if (req.files['profileBanner']) {
            const profileBanner = req.files['profileBanner'][0];
            const params = {
                Bucket: 'sisso-data',
                Key: `profile/${_id}/${profileBanner.originalname}`,
                Body: profileBanner.buffer,
                ContentType: profileBanner.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;
        }

        if (req.user) {
            if (Object.keys(req.body).length > 0) {

                const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                    $set: {
                        'basicInfo.firstName': req.body.firstName,
                        'basicInfo.lastName': req.body.lastName,
                        'basicInfo.designation': req.body.designation,
                        'basicInfo.company': req.body.company,
                        'basicInfo.age': Number(req.body.age) || 0,
                        'basicInfo.location': req.body.location,
                        'basicInfo.objective': req.body.objective,
                        'basicInfo.aboutYou': req.body.aboutYou,
                        'basicInfo.profileImg': profileImgUrl,
                        'basicInfo.profileBanner': profileBannerUrl,
                        'basicInfo.status': req.body.status,
                        fullName: `${req.body.firstName} ${req.body.lastName}`
                    }
                }, { new: true }
                )
                await trainerDetails.save()
                // console.log(trainerDetails);
                resp.status(201).json({ success: true, message: 'Basic Info Updated Successfully', trainerDetails });
            }
            else{
                resp.status(200).json({success: false, message:"No request body found"})
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, error });
    }
}

const trainerProfileImageUpdate = async (req, resp) => {
    const { _id } = req.user
    console.log(req.file);
    try {
        let profileImgUrl;
        if (req.file) {
            const profileImg = req.file;

            const params = {
                Bucket: 'sisso-data',
                region: "ap-south-1",
                Key: `trainer/profile/${_id}/${profileImg.originalname}`,
                Body: profileImg.buffer,
                ContentType: profileImg.mimetype,
            };

            const data = await s3.upload(params).promise();
            profileImgUrl = data.Location;
        }
        console.log(profileImgUrl);
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileImg': profileImgUrl,
                }
            }, { new: true }
            )
            await trainerDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Image Updated Successfully', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }

}

const trainerProfileBannerUpdate = async (req, resp) => {
    const { _id } = req.user
    try {
        let profileBannerUrl;
        if (req.file) {
            const profileBannerImg = req.file;
            const params = {
                Bucket: 'sisso-data',
                region: "ap-south-1",
                Key: `trainer/profile/${_id}/${profileBannerImg.originalname}`,
                Body: profileBannerImg.buffer,
                ContentType: profileBannerImg.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;
        }

        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileBanner': profileBannerUrl
                }
            }, { new: true }
            )
            await trainerDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Banner Updated Successfully', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }
}

const trainerSkillsUpdate = async (req, resp) => {
    const { _id } = req.user
    try {

        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                skills: req.body?.map((skill) => skill)
            })
            trainerDetails.save()
            resp.status(201).json({ success: true, message: 'skill updated', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
    }
}


const updateSkillRangeById = async (req, res) => {
    const { _id } = req.user;
    const { skillId } = req.params;
    const { newRange } = req.body

    try {
        // Find the trainer by ID
        const trainer = await trainerSchema.findById(_id);
        if (!trainer) {
            res.status(200).json({ success: false, message: 'user not found' });
        }
        else {

            const skillIndex = trainer.skills.findIndex(skill => skill._id.toString() === skillId);

            if (skillIndex === -1) {
                return res.status(200).json({ success: false, message: 'Skill not found' });
            }
            // Update the range of the skill
            trainer.skills[skillIndex].range = newRange;

            await trainer.save();
            res.status(201).json({ success: true, message: 'Skill range updated', trainerDetails: trainer });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const trainerCertificateUpdate = async (req, resp) => {
    const { _id } = req.user;
    const { certificateHead, institution, certificationDescription, status } = req.body
    const certificates = req.files['certificateImg']
    const certificateHeadArray = Array.isArray(certificateHead) ? certificateHead : [certificateHead];
    const institutionArray = Array.isArray(institution) ? institution : [institution];
    const certificationDescriptionArray = Array.isArray(certificationDescription) ? certificationDescription : [certificationDescription];
    const statusArray = Array.isArray(status) ? status : [status];
    try {
        const uploadedCertificates = [];
        if (req.files['certificateImg']) {
            for (let i = 0; i < certificates.length; i++) {
                const certificate = certificates[i];
                const params = {
                    Bucket: 'sisso-data',
                    Key: `trainer/certificates/${_id}/${certificate.originalname}`,
                    Body: certificate.buffer,
                    ContentType: certificate.mimetype
                };

                const uploadResult = await s3.upload(params).promise();
                uploadedCertificates.push(uploadResult.Location);
            }
        }
        const certificateDetails = uploadedCertificates.map((certificateUrl, index) => ({
            certificateHead: certificateHeadArray[index % certificateHeadArray.length],
            institution: institutionArray[index % institutionArray.length],
            certificationDescription: certificationDescriptionArray[index % certificationDescriptionArray.length],
            certificateUrl: certificateUrl,
            status: statusArray[index % statusArray.length] || false
        }));

        // console.log('certificateDetails:', certificateDetails);
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $addToSet: {
                    certificateDetails: certificateDetails
                }
            })
            await trainerDetails.save()
            // console.log(trainerDetails,'trainerDetails')
            resp.status(200).json({ success: true, message: "Certificate has been updated", trainerDetails })
        }
        else {
            resp.status(200).json({ message: 'You are not logged in' })
        }

    }
    catch (error) {
        resp.status(500).send(`Error processing file ${error}`);
    }
}

const trainerContactInfoUpdate = async (req, resp) => {
    const {
        primaryNumber, secondaryNumber,
        address, email,
        website, avaiableData, status
    } = req.body
    console.log(req.body)
    const { _id } = req.user
    try {
        if (!req.user) {
            return resp.status(401).json({ message: "User Not Found" });
        }
        const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, {
            $set: {
                'contactInfo.primaryNumber': primaryNumber,
                'contactInfo.secondaryNumber': secondaryNumber || 0,
                'contactInfo.address': address || 'Not Available',
                'contactInfo.email': email || 'Not Provided',
                'contactInfo.website': website || 'Not Available',
                'contactInfo.status': status ? true : false,
                'contactInfo.availableDate': avaiableData ? avaiableData : new Date(),
            }
        })
        await trainerDetails.save()
        console.log(trainerDetails, 'trainerDetails')
        if (trainerDetails) {
            resp.status(201).json({ success: true, message: 'Contact Info Updated Successfully', trainerDetails })
        }
        else {
            resp.status(200).json({ success: false, message: 'User Not Found' })
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ message: error.toString() })
    }

}

const trainerExperienceInfoUpdate = async (req, resp) => {
    const {
        expertIn, experience,
        sinceInTheFiled, recentCompany,
        status
    } = req.body
    // console.log(req.body)
    const { _id } = req.user
    try {
        if (!req.user) {
            return resp.status(401).json({ message: "User Not Found" });
        }
        const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, {
            $set: {
                'experience.expertIn': expertIn || '-',
                'experience.experience': experience || '-',
                'experience.sinceInTheFiled': sinceInTheFiled || 'Not Available',
                'experience.recentCompany': recentCompany || 'Not Provided',
                'experience.status': status ? true : false
            }
        })
        await trainerDetails.save()
        console.log(trainerDetails, 'trainerDetails')
        if (trainerDetails) {
            resp.status(201).json({ success: true, message: 'Experience Info Updated Successfully', trainerDetails })
        }
        else {
            resp.status(200).json({ success: false, message: 'User Not Found' })
        }
    }
    catch (error) {
        resp.status(200).json({ message: error.toString() })
    }

}

const trainerCertificateDelete = async (req, resp) => {
    const { _id } = req.user;

    const certificateIdToDelete = req.params.id; // Assuming you're passing the experience ID as a URL parameter
    try {
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate(
                _id,
                { $pull: { certificateDetails: { _id: certificateIdToDelete } } },
                { new: true }
            );

            await trainerDetails.save()
            resp.status(200).json({ success: true, message: "Certificate data has been deleted", trainerDetails });
        } else {
            resp.status(401).json({ message: 'You are not logged in' });
        }
    } catch (error) {
        resp.status(500).json({ message: error.toString() });
    }
};

const getSkills = async (req, resp) => {
    try {
        const skills = await SkillSchema.find()

        if (!skills) {
            resp.status(200).json({ success: false, message: "No Data Found" })

        } else {
            resp.status(201).json({ success: true, message: 'getting skills', skills })
        }
    } catch (error) {
        console.log(error)

    }
}


const gettrainerProfile = async (req, resp) => {
    const trainerDetails = await req.user
    // console.log("User details",trainerDetails)
    if (trainerDetails) {
        resp.status(200).json({ success: true, message: 'trainerProfileFected', trainerDetails })
    }
    else {
        resp.status(403).json({ sucess: false, message: "You are not authorized to access this api" })
    }
}



const addBookMarkedPost = async (req, res) => {
    try {
        const { _id } = req.user;
        const postDetails = req.body; // Assuming _id is the field identifying the post

        // Check if the current user already has a bookmarked document
        let userBookmarks = await bookMarkedTrainingPostSchema.findOne({ userId: _id });

        if (!userBookmarks) {
            // If the current user doesn't exist, create a new document
            userBookmarks = new bookMarkedTrainingPostSchema({
                userId: _id,
                postDetails: [postDetails]
            });
            await userBookmarks.save();
            return res.status(201).json({ success: true, message: 'Post Bookmarked Successfully', userBookmarks });
        }

        // Check if the post is already bookmarked
        const existingPostIndex = userBookmarks.postDetails.findIndex(detail => detail._id === postDetails._id);

        if (existingPostIndex !== -1) {
            // If the post is already bookmarked, delete its details
            userBookmarks.postDetails.splice(existingPostIndex, 1);
            await userBookmarks.save();
            return res.status(200).json({ success: true, message: 'Post Unbookmarked Successfully', userBookmarks });
        }
        else {
            // If the user exists and the post is not already bookmarked, add the new postDetails
            userBookmarks.postDetails.unshift(postDetails);
            await userBookmarks.save();
        }

        // Return a success response
        return res.status(201).json({ success: true, message: 'Post Bookmarked Successfully', userBookmarks });

    } catch (error) {
        console.error(error);
        // Return an error response if an error occurs
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const getBookMarkedPostsByUserId = async (req, resp) => {
    const { _id } = req.user;

    try {
        const findBookMarkedPost = await bookMarkedTrainingPostSchema.findOne({ userId: _id })

        if (!findBookMarkedPost) {
            resp.status(200).json({ success: false, message: "No Data Found" })
        }
        else {
            resp.status(201).json({ success: true, userBookmarks: findBookMarkedPost })
        }
    }
    catch (error) {
        console.log(error)
    }
};



const trainerAppliedTraining = async (req, resp) => {
    try {
        const { _id } = req.user;
        const { trainingPostId } = req.params;
        const { trainingDetails } = req.body;

        // const ctrainerAvailableDate1 = new Date(trainingDetails.trainerAvailableDate1)
        // const ctrainerAvailableDate2 = new Date(trainingDetails.trainerAvailableDate2)
        // const ctrainerAvailableDate3 = new Date(trainingDetails.trainerAvailableDate3)

        // const onlyDate1 = ctrainerAvailableDate1.toISOString().slice(0, 10)
        // const onlyDate2 = ctrainerAvailableDate2.toISOString().slice(0, 10)
        // const onlyDate3 = ctrainerAvailableDate3.toISOString().slice(0, 10)

        // Check if the trainer has already applied for this training
        const existingApplication = await trainerAppliedTrainingSchema.findOne({
            trainerId: _id,
            'trainingDetails.trainingPostDetails._id': trainingPostId,
        });

        if (existingApplication) {
            console.log('Already applied');
            return resp.status(200).json({ success: false, message: 'Already Applied' });
        }
        else {
            const findApplication = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id });
            // console.log("findApplication", findApplication)
            if (findApplication) {
                findApplication.trainingDetails.push(trainingDetails);
                await findApplication.save();
                // console.log(findApplication)
                return resp.status(201).json({ success: true, message: 'Application Applied' })
            }
            else {
                const newApplication = new trainerAppliedTrainingSchema({
                    trainerId: _id,
                    trainerProfileImg: req?.user?.basicInfo?.profileImg || "",
                    trainerName: req?.user?.basicInfo?.firstName || "",
                    trainerDesignation: req?.user?.basicInfo?.designation || "",
                    // trainerRating: req?.user?.rating?.map((value) => value) || [],
                    trainingDetails: [
                        {
                            trainingPostDetails: trainingDetails?.trainingPostDetails,
                            // trainerAvailableDate1: onlyDate1,
                            // trainerAvailableDate2: onlyDate2,
                            // trainerAvailableDate3: onlyDate3,
                        }
                    ]
                });
                await newApplication.save();
                // console.log(newApplication)
            }
            return resp.status(201).json({ success: true, message: "Training application submitted successfully." });
        }
    } catch (error) {
        console.error(error);
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
};

//for trainer 
const getAppliedTraining = async (req, resp) => {
    const { _id } = req.user;
    try {

        const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id }).populate('trainingDetails.trainingPostDetails')
        const trainingPostData = findAppliedTraining.trainingDetails.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources, feedBackDetails }) => {
            // Destructure the `tocFile` key from `trainingPostDetails`
            // const { tocFile, ...updatedTrainingPostDetails } = trainingPostDetails;
            // Return the updated `trainingPostDetails` object without the `tocFile` key
            return {
                trainingPostDetails,
                appliedStatus,
                applicationstatus,
                _id,
                trainingResources,
                feedBackDetails
            };
        });
        resp.status(201).json({ success: true, message: ' Data is fetching', trainingPostData });
    }
    catch (error) {
        resp.status(200).json({ success: false, message: "Data not found" })
    }
}

//add training resources notes;

const addTrainingResources = async (req, resp) => {

    const { _id } = req.user
    const { trainingDetailsId } = req.params
    const fileData = req.files['fileData']
    const fileNameArray = Array.isArray(req.body.fileName) ? req.body.fileName : [req.body.fileName]
    const fileOriginalNameArray = Array.isArray(req.body.fileOriginalName) ? req.body.fileOriginalName : [req.body.fileOriginalName]
    try {
        const uploadResources = []
        if (req.files['fileData']) {
            for (let i = 0; i < fileData.length; i++) {
                const resourcesFile = fileData[i];
                const params = {
                    Bucket: 'sisso-data',
                    Key: `trainer/resourcesFiles/${_id}/${resourcesFile.originalname}`,
                    Body: resourcesFile.buffer,
                    ContentType: resourcesFile.mimetype
                };
                const uploadResult = await s3.upload(params).promise();
                uploadResources.push(uploadResult.Location);
                // uploadResources.push(resourcesFile.originalname)
            }
        }
        const trainingResources = uploadResources.map((files, index) => ({
            fileName: fileNameArray[index % fileNameArray.length],
            fileData: files,
            fileOriginalName: fileOriginalNameArray[index % fileOriginalNameArray.length],

        }))
        // console.log("trainingResources", trainingResources)
        const addTrainingResources = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: _id,
                'trainingDetails._id': trainingDetailsId// Filter by both trainerId and trainingDetailsId
            },
            {

                $push: {
                    'trainingDetails.$.trainingResources': trainingResources
                }
            },
            { new: true }  // This returns the updated data from the db
        )
        await addTrainingResources.save()

        console.log(addTrainingResources)
        if (addTrainingResources) {
            const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id }).populate('trainingDetails.trainingPostDetails')
            const trainingPostData = findAppliedTraining.trainingDetails.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources, feedBackDetails }) => {
                // Destructure the `tocFile` key from `trainingPostDetails`
                // const { tocFile, ...updatedTrainingPostDetails } = trainingPostDetails;
                // Return the updated `trainingPostDetails` object without the `tocFile` key
                return {
                    trainingPostDetails,
                    appliedStatus,
                    applicationstatus,
                    _id,
                    trainingResources,
                    feedBackDetails
                };
            });
            resp.status(201).json({ success: true, message: 'Resouces Added', trainingPostData })
        }
        else {
            resp.status(200).json({ success: false, message: 'Failed to Add Resources' })
        }

    }
    catch (error) {
        console.log('error', error)
    }
}



const deleteAppliedTraining = async (req, resp) => {
    const { _id } = req.user
    const { trainingPostId } = req.params
    try {
        const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ trainerId: _id, })
        if (!findAppliedTraining) {
            return resp.status(404).json({ success: false, message: 'Applied training not found.' });
        }

        else {
            // Use $pull operator to remove the matching training post from the array atomically
            const updatedTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
                { trainerId: _id },
                { $pull: { trainingDetails: { _id: trainingPostId } } },
                { new: true } // Return the updated document
            );

            if (!updatedTraining) {
                return resp.status(404).json({ success: false, message: 'Training post not found in the applied trainings.' });
            }
            else {
                resp.status(200).json({ success: true, message: 'Training post deleted successfully.', updatedTraining });
            }
            // console.log(updatedTraining); 
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, message: 'Internal Server Error', error })
    }


}

// get all training details 
const getAllTrainerDetails = async (req, resp) => {
    console.log('req.query', req.query)
    const trainerDetails = await trainerSchema.find()
    if (trainerDetails) {
        resp.status(201).json({ success: true, message: 'TrainerDataFected', trainerDetails })
    }
    else {
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }
}

//get trainerDetail by using the Id 


const getTrainerDetailsById = async (req, resp) => {
    const { id } = req.params
    try {
        const trainerDetails = await trainerSchema.findOne({ _id: id })
        if (!trainerDetails) {
            resp.status(200).json({ success: false, message: "No User Found" })
        }
        else {
            resp.status(201).json({ success: true, message: 'Trainer Details Fetched', trainerDetails })
        }

    }
    catch (error) {
        resp.status(200).json({ success: false, message: "Server Error", error })
    }

}

const UpdatePhoneNumber = async (req, resp) => {
    const {
        phoneNumber,
        otp
    } = req.body 
    console.log('req.body',req.body); 
    const { _id } = req.user

    try {
        if(req.user){
            const valid =await compareOtp(otp,phoneNumber)
            if(valid){
                const findUser=await trainerSchema.findOne({'contactInfo.primaryNumber': req.user.contactInfo.primaryNumber,})
                if(!findUser){
                    resp.status(200).json({success:false,message:'User Details Not Found '})
                }
                else{
                    const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, {
                        $set: {
                            'contactInfo.primaryNumber': phoneNumber,
                        }   
                    },{new:true})
                    if(trainerDetails){
                        await trainerDetails.save()
                        resp.status(201).json({success:true,message:'Trainer PhoneNumber Updated SuccessFully',trainerDetails})
                    }
                    else{
                        resp.status(200).json({success:false,message:'Error Updating Number'})
                    }
                }
            }
            else{
                resp.status(200).json({success:false,message:'Invalid Otp'})

            }

        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ message: error.toString() })
    }


}


module.exports = {
    trainerSignUp, gettrainerProfile, trainerBasicInfoUpdate, updateSkillRangeById,
    trainerSkillsUpdate, trainerCertificateUpdate, trainerContactInfoUpdate, trainerProfileBannerUpdate,
    trainerExperienceInfoUpdate, trainerCertificateDelete, getTrainerDetailsById, getSkills,
    addBookMarkedPost, getBookMarkedPostsByUserId, trainerProfileImageUpdate,
    trainerAppliedTraining, getAppliedTraining, deleteAppliedTraining, addTrainingResources,
    testProfileApi,
    getAllTrainerDetails,UpdatePhoneNumber
}