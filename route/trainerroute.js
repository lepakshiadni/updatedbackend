const route = require('express').Router()
const {
    trainerSignUp, gettrainerProfile,trainerBasicInfoUpdate,trainerSkillsUpdate,trainerCertificateUpdate,trainerContactInfoUpdate,trainerExperienceInfoUpdate,
    addBookMarkedPost,getBookMarkedPostsByUserId,trainerCertificateDelete,getTrainerDetailsById,
    trainerAppliedTraining,getAppliedTraining,deleteAppliedTraining,addTrainingResources,
    testProfileApi,
    getAllTrainerDetails
} = require('../controllers/trainerctrl')

const { jwtverify } = require('../middleware/jwtverify')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })  //for image uploading to s3 bucket

// route for trainers api

route.post('/trainerSignup', trainerSignUp) // add the trainer details add 1st time
route.put('/trainerBasicInfoUpdate', jwtverify, upload.fields([{ name: 'profileImg', maxCount: 1 },{ name: 'profileBanner', maxCount: 1 }]), trainerBasicInfoUpdate)
route.put('/trainerSkillsUpdate',jwtverify,trainerSkillsUpdate)
route.put('/trainerCertificateUpdate',jwtverify, upload.fields([{name:'certificateImg',maxCount:Infinity}]),trainerCertificateUpdate)
route.put('/trainerContactInfoUpdate',jwtverify,trainerContactInfoUpdate)
route.put('/trainerExperienceInfoUpdate',jwtverify,trainerExperienceInfoUpdate)
route.get('/gettrainerProfile', jwtverify, gettrainerProfile) // to view the profile of the user who is logged in
route.get('/getTrainerDetailsById/:id', getTrainerDetailsById)   // get the trainer details by id
route.delete('/trainerCertificateDelete',jwtverify,trainerCertificateDelete) // to delete the ceriticate 

route.post('/addBookMarkePost/:postId', jwtverify, addBookMarkedPost)   // to bookmark a post by trainer
route.post('/trainerAppliedTraining/:trainingPostId', jwtverify, trainerAppliedTraining)
route.delete('/deleteAppliedTraining/:trainingPostId', jwtverify, deleteAppliedTraining)
route.put('/addTrainingResources/:trainingDetailsId',upload.fields([{name:'fileData',maxCount:Infinity}]),jwtverify,addTrainingResources)
route.get('/getBookMarkedPostsByUserId', jwtverify, getBookMarkedPostsByUserId)
route.get('/getAppliedTraining', jwtverify, getAppliedTraining)
route.post('/testProfileApi', upload.single('file'), testProfileApi)
route.get('/getAllTrainerDetails',getAllTrainerDetails)

module.exports = route