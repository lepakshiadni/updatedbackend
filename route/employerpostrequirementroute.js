const route=require('express').Router()
const {
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
    hidePost,
    employerPostSearchHistory
} =require('../controllers/employerpostrequriement')

const {jwtverify} =require('../middleware/jwtverify')

const multer = require('multer');

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

//training route

route.post("/postTrainingRequirement",jwtverify,upload.single('tocFile'),postTrainingRequirement)
route.post("/postJobRequirement",postJobRequirement)
route.put("/postTrainingRequirementComments/:postId",postTrainingRequirementComments)
route.put('/addLikeToTrainingPost/:postId',addLikeToTrainingPost)
route.get('/getpostTrainingRequirement',jwtverify,getpostTrainingRequirement )
route.get("/getpostJobRequiement",getpostJobRequirement)
route.get("/getTrainingRequirementComments/:postId",getTrainingRequirementComments)
route.delete("/deletePostRequirement/:postId",jwtverify,deletePostRequirement)
route.delete('/deletePostTrainingComment/:postId/:commentId', deletePostTrainingComment)
route.get('/getAllPostTrainingRequirement',getAllPostTrainingRequirement)
route.post('/hidePost/:postId', hidePost)
route.get('/searchData',employerPostSearchHistory)
 
module.exports=route