// employerSignUp  controller
const employerSchema = require("../models/employermodel.js");
const { generateToken } = require("../config/jwttoken.js");
const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const postTrainingRequirementSchema = require('../models/employerpostTrainingRequirementmodel')
const bookmarkedEmployerSchema = require('../models/bookmarkedEmployerPostmodel.js')
const SkillSchema = require('../models/skillmodel.js')
const { compareOtp } = require('../utils/services.js')
const mongoose = require('mongoose')
const aws = require("aws-sdk");
require("dotenv").config();

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,
});
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
};

const employerSignUp = async (req, resp) => {
    const { fullName, companyName, designation, primaryNumber, role } = req.body;

    // console.log(req.body, role);

    const findEmployer = await employerSchema.findOne({ primaryNumber });
    if (!findEmployer) {
        try {
            const employerDetails = new employerSchema({
                fullName: fullName,
                companyName: companyName,
                designation: designation,
                role: role,
                contactInfo: {
                    primaryNumber: primaryNumber,
                },
            });
            await employerDetails.save();
            const token = await generateToken(employerDetails?._id);

            resp
                .status(200)
                .json({
                    success: true,
                    message: "EmployerProfile Created Successfully",
                    employerDetails,
                    token,
                });
        } catch (error) {
            console.error(error);
            resp
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    } else {
        resp
            .status(401)
            .json({
                success: false,
                message: "Entered user already exists. Please log in.",
            });
    }
};

const employerBasicInfoUpdate = async (req, resp) => {
    const { _id } = req.user
    // console.log(req.body)
    // console.log('req.file', req.files)

    try {
        let profileImgUrl;
        if (req.files && req.files['profileImg']) {
            const profileImg = req.files['profileImg'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/profile/${_id}/${profileImg.originalname}`,
                Body: profileImg.buffer,
                ContentType: profileImg.mimetype
            };
            const data = await s3.upload(params).promise();
            profileImgUrl = data.Location;
        }
        // else{
        //     console.log('req.file is not there')
        // }

        // // Upload profile banner to S3
        let profileBannerUrl;
        if (req.files && req.files['profileBanner']) {
            const profileBanner = req.files['profileBanner'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/profile/${_id}/${profileBanner.originalname}`,
                Body: profileBanner.buffer,
                ContentType: profileBanner.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;

        }
        // else{
        //     console.log('req.file is not there')
        // }
        // console.log(req.body.firstName)


        if (req.user && req.body) {
            const employerDetails = await employerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.firstName': req.body.firstName,
                    'basicInfo.lastName': req.body.lastName,
                    'basicInfo.designation': req.body.designation,
                    'basicInfo.company': req.body.company,
                    'basicInfo.age': Number(req.body.age) || null,
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
            await employerDetails.save()
            // console.log('employerDetalls', employerDetails);
            resp.status(201).json({ success: true, message: 'Basic Info Updated Successfully', employerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, message: 'server Error', error });
    }
}

const employerProfileImageUpdate = async (req, resp) => {
    const { _id } = req.user
    console.log(req.file)
    try {
        let profileImgUrl;
        if (req.file) {
            const profileImg = req.file;

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/profile/${_id}/${profileImg.originalname}`,
                Body: profileImg.buffer,
                ContentType: profileImg.mimetype
            };

            const data = await s3.upload(params).promise();
            profileImgUrl = data.Location;
        }
        console.log(profileImgUrl);
        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileImg': profileImgUrl,
                }
            }, { new: true }
            )
            await employerDetails.save()
            // console.log(employerDetails);
            resp.status(201).json({ success: true, message: 'Profile Image Updated Successfully', employerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }

}

const employerProfileBannerUpdate = async (req, resp) => {
    const { _id } = req.user
    try {
        let profileBannerUrl;
        if (req.file) {
            const profileBannerImg = req.file;
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/profile/${_id}/${profileBannerImg.originalname}`,
                Body: profileBannerImg.buffer,
                ContentType: profileBannerImg.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;
        }

        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileBanner': profileBannerUrl
                }
            }, { new: true }
            )
            await employerDetails.save()
            // console.log(employerDetails);
            resp.status(201).json({ success: true, message: 'Profile Banner Updated Successfully', employerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const employerSkillsUpdate = async (req, resp) => {
    const { _id } = req.user
    try {

        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate({ _id }, {
                skills: req.body?.map((skill) => skill)
            })
            await employerDetails.save()
            // console.log(employerDetails);
            resp.status(201).json({ success: true, message: 'skill updated', employerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const employerContactInfoUpdate = async (req, resp) => {
    const {
        primaryNumber, secondaryNumber,
        address, email,
        website, status
    } = req.body

    const { _id } = req.user

    try {
        if (!req.user) {
            return resp.status(401).json({ message: "User Not Found" });
        }
        const employerDetails = await employerSchema.findOneAndUpdate({ _id }, {
            $set: {
                'contactInfo.primaryNumber': primaryNumber,
                'contactInfo.secondaryNumber': secondaryNumber,
                'contactInfo.address': address || 'Not Available',
                'contactInfo.email': email || 'Not Provided',
                'contactInfo.website': website || 'Not Available',
                'contactInfo.status': status ? true : false
            }
        })
        await employerDetails.save()
        // console.log(employerDetails, 'employerDetails')
        if (employerDetails) {
            resp.status(201).json({ success: true, message: 'Contact Info Updated Successfully', employerDetails })
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

const employerExperienceInfoUpdate = async (req, resp) => {
    const { _id } = req.user;
    const experienceDetailsArray = req.body; // Assuming req.body is an array of experience details

    // console.log(experienceDetailsArray);

    try {
        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate(
                _id,
                { $addToSet: { experience: { $each: experienceDetailsArray } } },
                { new: true }
            );

            await employerDetails.save()
            resp.status(200).json({ success: true, message: "Experience data has been updated", employerDetails });
        } else {
            resp.status(401).json({ message: 'You are not logged in' });
        }
    } catch (error) {
        resp.status(500).json({ message: error.toString() });
    }
};

const employerExperienceInfoDelete = async (req, resp) => {
    const { _id } = req.user;
    const experienceIdToDelete = req.params._id; // Assuming you're passing the experience ID as a URL parameter
    try {
        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate(
                _id,
                { $pull: { experience: { _id: experienceIdToDelete } } },
                { new: true }
            );

            await employerDetails.save()
            resp.status(200).json({ success: true, message: "Experience data has been deleted", employerDetails });
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

const getemployerProfile = async (req, resp) => {
    const employerDetails = await req.user;
    // console.log("User details", employerDetails)
    try {
        if (employerDetails) {
            resp.status(201).json({ success: true, message: 'employerProfileFected', employerDetails })
        } else {
            resp.status(200).json({ sucess: false, message: "You are not authorized to access this api", });
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Internal Server Error', error })
    }
};



//for employer portal 

const getEmployerProfileById = async (req, resp) => {
    const { id } = req.params;
    try {

        const employerDetails = await employerSchema.findOne({ _id: id });
        const employerPost = await postTrainingRequirementSchema.aggregate([
            // {  "$addFields": { "postedByIdObj": { "$toObjectId": "$postedById" } } },

           
            {
                $lookup: {
                    from: 'employers',
                    localField: 'postedById',
                    foreignField: '_id',
                    as: 'employerData'
                }
            },
            {
                $set: {
                    'employerData': { $first: '$employerData' }
                }
            },
            {
                $set: {
                    'postedByName': '$employerData.fullName',
                    'postedByCompanyName': "$employerData.companyName",
                    'postedByImg': "$employerData.basicinfo.profileImg",
                    'postedByDesignation': "$employerData.designation"
                }
            },
            {
                '$project': {
                    "_id": 1,
                    "trainingName": 1,
                    "description": 1,
                    "topics": 1,
                    "modeOfTraining": 1,
                    "typeOfTraining": 1,
                    "experience": 1,
                    "location": 1,
                    "participantCount": 1,
                    "minBudget": 1,
                    "maxBudget": 1,
                    "durationType": 1,
                    "durationCount": 1,
                    "selectedCountry": 1,
                    "availability": 1,
                    "tocFile": 1,
                    "startDate": 1,
                    "endDate": 1,
                    "createdAt":1,
                    "urgentlyNeedTrainer": 1,
                    'postedById':1,
                    'postedByImg':1,
                    'postedByName':1,
                    'postedByCompanyName':1,
                    'postedByDesignation':1
                }
            },
            {
                '$match': {
                    "postedById": new mongoose.Types.ObjectId(id), 
                    // 'postedById':{'$exists:true}

                },

            },

        ])
        // .sort({ createdAt: -1 });
        // console.log('employerPost', employerPost);

        if (!employerDetails) {
            return resp.status(404).json({ success: false, message: "No User Found" });
        } else {
            return resp.status(200).json({ success: true, message: 'Employer Details Fetched',employerDetails, employerPost });
        }
    } catch (error) {
        console.log('error', error);
        return resp.status(200).json({ success: false, message: "Server Error", error });
    }
};




const getAppliedTrainingEmployer = async (req, resp) => {
    const { _id } = req.user
    try {
        if (req.user?.role === 'employer') {
            const getAppliedTraining = await trainerAppliedTrainingSchema.find()

            if (!getAppliedTraining) {
                resp.status(200).json({ success: false, message: 'Applied Training Not Found' })
            }
            else {
                resp.status(201).json({ success: true, message: 'Applied Training Fected', getAppliedTraining })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'Not An Employer' })
        }

    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Internal Server Error', error })
    }
}


const updateProfileVisibility = async (req, res) => {
    const { _id } = req.user;
    const { profileVisibility } = req.body;

    // try {
    //     const updatedProfile = await Employer.findByIdAndUpdate(
    //         _id,
    //         { $set: { 'basicInfo.visibility': profileVisibility } },
    //         { new: true }
    //     );

    //     if (!updatedProfile) {
    //         return res.status(404).json({ success: false, message: 'Employer profile not found' });
    //     }

    //     return res.status(200).json({ success: true, message: 'Profile visibility updated successfully', updatedProfile });
    // } catch (error) {
    //     console.error('Error updating profile visibility:', error);
    //     return res.status(500).json({ success: false, message: 'Internal server error' });
    // }
};
const updateContactVisibility = async (req, res) => {
    const { _id } = req.user;
    const { profileVisibility } = req.body;

    try {
        const updatedProfile = await Employer.findByIdAndUpdate(
            _id,
            { $set: { 'basicInfo.visibility': profileVisibility } },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ success: false, message: 'Employer profile not found' });
        }

        return res.status(200).json({ success: true, message: 'Profile visibility updated successfully', updatedProfile });
    } catch (error) {
        console.error('Error updating profile visibility:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const addBookMarkedPost = async (req, res) => {
    try {
        const { _id } = req.user;
        const postDetails = req.body; // Assuming _id is the field identifying the post
        // Check if the current user already has a bookmarked document
        let userBookmarks = await bookmarkedEmployerSchema.findOne({ userId: _id });

        if (!userBookmarks) {
            // If the current user doesn't exist, create a new document
            userBookmarks = new bookmarkedEmployerSchema({
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
        const findBookMarkedPost = await bookmarkedEmployerSchema.findOne({ userId: _id })

        if (!findBookMarkedPost) {
            resp.status(200).json({ success: false, message: "No Data Found" })
        }
        else {
            resp.status(201).json({ success: true, message: 'bookMarked Post fetch', userBookmarks: findBookMarkedPost })
        }
    }
    catch (error) {
        console.log(error)
    }
};

const UpdatePhoneNumber = async (req, resp) => {
    const {
        phoneNumber,
        otp
    } = req.body
    console.log('req.body', req.body);
    const { _id } = req.user

    try {
        if (req.user) {
            const valid = await compareOtp(otp, phoneNumber)
            if (valid) {
                const findUser = await employerSchema.findOne({ 'contactInfo.primaryNumber': req.user.contactInfo.primaryNumber, })
                if (!findUser) {
                    resp.status(200).json({ success: false, message: 'User Details Not Found ' })
                }
                else {
                    const employerDetails = await employerSchema.findOneAndUpdate({ _id }, {
                        $set: {
                            'contactInfo.primaryNumber': phoneNumber,
                        }
                    }, { new: true })
                    if (employerDetails) {
                        await employerDetails.save()
                        resp.status(201).json({ success: true, message: 'Employer PhoneNumber Updated SuccessFully', employerDetails })
                    }
                    else {
                        resp.status(200).json({ success: false, message: 'Error Updating Number' })
                    }
                }
            }
            else {
                resp.status(200).json({ success: false, message: 'Invalid Otp' })

            }

        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ message: error.toString() })
    }


}

module.exports = {
    employerSignUp,
    getemployerProfile,
    getEmployerProfileById,
    employerProfileImageUpdate,
    employerProfileBannerUpdate,
    employerBasicInfoUpdate,
    employerSkillsUpdate,
    employerContactInfoUpdate,
    employerExperienceInfoUpdate,
    employerExperienceInfoDelete,
    getSkills,
    getAppliedTrainingEmployer,
    updateProfileVisibility,
    addBookMarkedPost,
    getBookMarkedPostsByUserId,
    UpdatePhoneNumber
};
