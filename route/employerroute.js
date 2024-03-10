const route = require('express').Router()

//employer Details route 
const {
    employerSignUp, getemployerProfile, employerBasicInfoUpdate, employerSkillsUpdate, employerContactInfoUpdate, employerExperienceInfoUpdate,
    getAppliedTrainingEmployer, employerExperienceInfoDelete
} = require('../controllers/employerctrl')

// trainer training routes
const {
    getAllAppliedTraining, updateAppliedStatus,addFeedback
} = require('../controllers/trainerappliedctrl')

// feedback route 



const { getTrainerDetailsById } = require('../controllers/trainerctrl')


const { jwtverify } = require('../middleware/jwtverify')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })  //for image uploading to s3 bucket

// route for employer api

route.post('/employerSignup', employerSignUp) // add the employer details add 1st time
route.put('/employerBasicInfoUpdate', jwtverify, upload.fields([{ name: 'profileImg', maxCount: 1 }, { name: 'profileBanner', maxCount: 1 }]), employerBasicInfoUpdate)
route.put('/employerSkillsUpdate', jwtverify, employerSkillsUpdate)
route.put('/employerContactInfoUpdate', jwtverify, employerContactInfoUpdate)
route.put('/employerExperienceInfoUpdate', jwtverify, employerExperienceInfoUpdate)
route.get('/getemployerProfile', jwtverify, getemployerProfile) // to view the profile of the user who is logged in
route.get('/getAppliedTrainingEmployer', jwtverify, getAppliedTrainingEmployer)

route.get('/getTrainerDetailsById/:id', getTrainerDetailsById)
route.delete('/employerExperienceInfoUpdate/:_id', jwtverify, employerExperienceInfoDelete)



route.put('/updateAppliedStatus', jwtverify, updateAppliedStatus)   // update applied status of training from employer side
route.get('/getAllAppliedTraining', jwtverify, getAllAppliedTraining)

route.put('/addFeedback/:trainingDetailsId',jwtverify,addFeedback)




module.exports = route