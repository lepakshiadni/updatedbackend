const bcrpt = require('bcrypt')
const otpSchema = require('../models/otpmodel')
const userSchema = require('../models/usermodel')
const plivo = require('plivo');

// Initialize the Plivo client
const authId = process.env.OTP_AUTHID;
const authToken = process.env.OTP_TOKEN;
const client = new plivo.Client(authId, authToken);
// Example function that sends an OTP to a phone number using Plivo
function sendOTP(phoneNumber, otp) {
    const message = `Your OTP is ${otp}. Please do not share it with anyone.`;
    const src = 'Mind0088';
    const countryCode = '+91'
    const validnumber=countryCode+phoneNumber
    const dst = validnumber;
    const timeLimit = 100
    client.messages.create(src, dst, message, { time_limit: timeLimit })
        .then(response => {
            console.log('OTP sent successfully:', response);
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
        });

}

const generateOtp = () => {
    //generate otp code 4 digit
    const otp = Math.floor(1000 + Math.random() * 9000)
    return otp
}

const compareOtp = async (otp, number) => {
    const finduser = await otpSchema.findOne({ phoneNumber: number })
    // console.log(otp,number)
    if (!finduser) {
        console.log('user Not fount')
    }
    else{
        const validotp = await bcrpt.compare(otp, finduser?.Otp)
        return validotp
    }
}

const decodedpassword = async (email, password) => {
    const find = await userSchema.findOne({ email })
    if (find) {
        let decrypted = await bcrpt.compare(password, find.password)
        return decrypted
    }
    else {
        return false
    }

}


module.exports = { generateOtp, compareOtp, sendOTP, decodedpassword }

