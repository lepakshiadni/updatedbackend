const route=require('express').Router()
const {
    postTrainingRequirement,
    getpostTrainingRequirement,
    postJobRequirement,
    getpostJobRequirement,
    postTrainingRequirementComments,
    getTrainingRequirementComments,
    addLikeToTrainingPost,
    deletePostRequirement
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
route.get("/getpostTrainingRequirement",getpostTrainingRequirement)
route.get("/getpostJobRequiement",getpostJobRequirement)
route.get("/getTrainingRequirementComments/:postId",getTrainingRequirementComments)
route.delete("/deletePostRequirement/:postId",jwtverify,deletePostRequirement)



module.exports=route