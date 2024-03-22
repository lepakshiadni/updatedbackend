// const userSchema = require('../models/usermodel')
const trainerSchema = require('../models/trainermodel')
const employerSchema = require('../models/employermodel')
const otpSchema = require('../models/otpmodel')
const { generateToken } = require('../config/jwttoken.js')
const { generateOtp, compareOtp, sendOTP, decodedpassword } = require('../utils/services.js')
const localStorage = require('localStorage')
const Cookies = require('js-cookie')


// Generate opt api 

const generateopt = async (req, resp) => {
    const { number } = req.body
    console.log(number);
    if (number) {
        try {
            let user = await otpSchema.findOne({ phoneNumber: number })
            if (!user) {
                user = new otpSchema({
                    phoneNumber: number
                })
            }
            const otp = generateOtp()
            user.Otp = otp
            await user.save();
            // await sendOTP(number,otp)
            console.log(otp)
            await localStorage.setItem('phoneNumber', JSON.stringify(number))
            resp.status(200).json({ success: true, message: 'Otp sended', otp })
        }
        catch (err) {
            console.log(err)
        }
    }

}

//Verify opt api 

// const verifyOtp = async (req, resp) => {
    
//     const { otp, phoneNumber, } = req.body

//     //finding the users in the db using the phoneNumber and validating the opt

//     const findUser = await otpSchema.findOne({ phoneNumber: phoneNumber })
//     const existTrainer = await trainerSchema.findOne({ primaryNumber: phoneNumber })
//     const existEmployer = await employerSchema.findOne({ primaryNumber: phoneNumber })

//     if (existTrainer && findUser) {
//         const valid = await compareOtp(otp, phoneNumber) //validateting the opt form the user 
//         if (valid) {
//             if (existTrainer?.role === 'trainer') {
//                 const token = await generateToken(existTrainer._id) //generating the token to the exiting user according to the role 
//                 resp.status(200).json({ success: true, message: 'verifiedExitingTrainer', existTrainer, token })
//             }
//         }
//         else {
//             resp.status(404).json({ success: false, message: 'Invalid OTP' })
//         }
//     }
//     if (existEmployer && findUser) {

//         const valid = await compareOtp(otp, phoneNumber) //validateting the opt form the user 
        
//         if (valid) {
//             if (existEmployer?.role === 'employer') {

//                 const token = await generateToken(existEmployer._id) //generating the token to the exiting user according to the role 

//                 resp.status(200).json({ success: true, message: 'verifiedExitingEmployer', existEmployer, token })
//             }
//         }
//         else {
//             resp.status(404).json({ success: false, message: 'Invalid OTP' })
//         }
//     }
//     else {
//         if (findUser) {
//             const valid = await compareOtp(otp, phoneNumber)
//             if (valid) {
//                 resp.json({ success: true, message: 'New user', phoneNumber })
//             }
//             else {
//                 resp.json({ success: false, message: 'invalid otp' })
//             }
//         }
//     }
// }

const verifyOtp = async (req, resp) => {
    try {
        const { otp, phoneNumber } = req.body;
        // find the user details using the phoneNumber
        const findUser = await otpSchema.findOne({ phoneNumber: phoneNumber });
        const existTrainer = await trainerSchema.findOne({ 'contactInfo.primaryNumber': phoneNumber });
        const existEmployer = await employerSchema.findOne({ 'contactInfo.primaryNumber': phoneNumber });
        // console.log(existTrainer)
        if (existTrainer && findUser) {
            const valid = await compareOtp(otp, phoneNumber); // validating  the otp from the otp Schema 
            if (valid) {
                if (existTrainer.role === 'trainer') {
                    const token = await generateToken(existTrainer._id); // generating the token for the user according to the role 
                    return resp.status(200).json({ success: true, message: 'verifiedExitingTrainer', existTrainer, token });
                }
            } else {
                return resp.status(404).json({ success: false, message: 'Invalid OTP' });
            }
        }

        if (existEmployer && findUser) {
            const valid = await compareOtp(otp, phoneNumber);// validating  the otp from the otp Schema 
            if (valid) {
                if (existEmployer.role === 'employer') {
                    const token = await generateToken(existEmployer._id);// generating the token for the user according to the role 
                    return resp.status(200).json({ success: true, message: 'verifiedExitingEmployer', existEmployer, token });
                }
            } else {
                return resp.status(404).json({ success: false, message: 'Invalid OTP' });
            }
        }
        if (findUser) {
            const valid = await compareOtp(otp, phoneNumber);
            if (valid) {
                return resp.json({ success: true, message: 'newUser', phoneNumber });
            } else {
                return resp.json({ success: false, message: 'Invalid OTP' });
            }
        }
        // Handle the case where no conditions are met
        return resp.status(404).json({ success: false, message: 'Invalid OTP' });
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ success: false, message: 'Internal server error' });
    }
};


//update user profile 

const updateProfile = async (req, resp) => {
    const { firstName, lastName,
        designation, company,
        location, about,
        skills, certificateHead,
        certificateDescription, certificate,
        secondaryNumber, address,
        email, website, experience } = req.body;
    const { userId } = req.params;
    const { profileImg, profileBanner } = req.file ? req.file.buffer : undefined;
    console.log(profileBanner, profileImg)
    console.log(userId);
    console.log(req.body);

    const findUser = await userSchema.findOneAndUpdate({ _id: userId }, {
        firstName: firstName ? firstName : null,
        lastName: lastName ? lastName : null,
        designation: designation ? designation : '',
        company: company ? company : null,
        location: location ? location : null,
        about: about ? about : "",
        profileImg: profileImg ? profileImg : null,
        profileBanner: profileBanner ? profileBanner : null,
        skills: skills ? skills : [],
        address: address ? address : {},
        certificateHead: certificateHead ? certificateHead : "",
        certificateDescription: certificateDescription ? certificateDescription : "",
        certificate: certificate ? [...certificate] : [],
        secondaryNumber: secondaryNumber ? secondaryNumber : "",
        website: website ? website : null,
        experiece: experience ? experience : [],
        email: email ? email : ""
    })
    await findUser.save()
    console.log(findUser);
    if (findUser) {
        return resp.status(200).json({ success: true, data: findUser })
    }
    else {
        return resp.status(404).json({ success: false, messgae: 'Something went' })
    }
}

//get all user 
const getAlluser = async (req, resp) => {
    const finduser = await userSchema.find()
    try {
        resp.status(200).json({ sucess: true, message: 'All User Fetched', finduser })
    }
    catch (err) {
        resp.status(404).json({ sucess: false, message: 'User Not found ' })
    }
}

//get user by verification 
const getuser = async (req, resp) => {
    const user = await req.user
    // console.log('get api is working')
    if (user) {
        resp.json({ sucess: true, message: 'feched', user })
    }
    else {
        resp.json({ sucess: false, message: 'not found' })
    }
}


// get user by userID

const getuserId = async (req, resp) => {
    const { userId, username } = req.params
    try {
        const user = userId ?
            await userSchema.findById(userId)
            : await userSchema.findOne({ name: username })
        resp.status(200).json({ success: true, message: 'user found', user })
    }
    catch (err) {
        resp.status(404).json({ sucess: false, message: 'User not found' })
    }
}






module.exports = { generateopt, verifyOtp,  getuser, getuserId, getAlluser, updateProfile }
