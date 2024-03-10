// employerSignUp  controller
const employerSchema = require("../models/employermodel.js");
const { generateToken } = require("../config/jwttoken.js");
const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');


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
    const { fullName, experience, skills, primaryNumber, role } = req.body;

    console.log(req.body, role);

    const findEmployer = await employerSchema.findOne({ primaryNumber });
    if (!findEmployer) {
        try {
            const employerDetails = new employerSchema({
                fullName: fullName,
                experience: experience,
                skills: skills,
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

    try {
        let profileImgUrl;
        if (req.files['profileImg']) {
            const profileImg = req.files['profileImg'][0];
            const params = {
                Bucket: 'sisso-data',
                Key: `employer/profile/${_id}/${profileImg.originalname}`,
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
                Key: `employer/profile/${_id}/${profileBanner.originalname}`,
                Body: profileBanner.buffer,
                ContentType: profileBanner.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;

        }

        if (req.user) {
            const employerDetails = await employerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.firstName': req.body.firstName || '',
                    'basicInfo.lastName': req.body.lastName || '',
                    'basicInfo.designation': req.body.designation || '',
                    'basicInfo.company': req.body.company || '',
                    'basicInfo.age': Number(req.body.age) || null,
                    'basicInfo.location': req.body.location || '',
                    'basicInfo.objective': req.body.objective || '',
                    'basicInfo.aboutYou': req.body.aboutYou || '',
                    'basicInfo.profileImg': profileImgUrl,
                    'basicInfo.profileBanner': profileBannerUrl,
                    'basicInfo.status': req.body.status || '',
                }
            }, { new: true }
            )
            await employerDetails.save()
            resp.status(201).json({ success: true, message: 'Basic Info Updated Successfully', employerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, error });
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
                'contactInfo.primaryNumber': primaryNumber || '-',
                'contactInfo.secondaryNumber': secondaryNumber || '',
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

    console.log(experienceDetailsArray);

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

const getemployerProfile = async (req, resp) => {
    const employerDetails = await req.user;
    // console.log("User details", employerDetails)
    if (employerDetails) {
        resp.status(201).json({ success: true, message: 'employerProfileFected', employerDetails })
    } else {
        resp
            .status(403)
            .json({
                sucess: false,
                message: "You are not authorized to access this api",
            });
    }
};

//for employer portal 
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








module.exports = {
    employerSignUp,
    getemployerProfile,
    employerBasicInfoUpdate,
    employerSkillsUpdate,
    employerContactInfoUpdate,
    employerExperienceInfoUpdate,
    employerExperienceInfoDelete,
    getAppliedTrainingEmployer,


};
