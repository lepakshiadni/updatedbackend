const route = require('express').Router()

const {
    trainerCreatePost, addTrainerPostComments, addLikeToTrainerPost,getTrainerPostBy,
    getTrainierPostComments, getpostTrainerPost, getpostTrainercreatePostById, deleteTrainerPostComment, hidePost, trainerPostSearchHistory

} = require('../controllers/trainercreatepostctrl')
const { jwtverify } = require('../middleware/jwtverify')

const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

route.post('/trainerCreatePost', jwtverify, upload.single('postImg'), trainerCreatePost)
route.put('/addTrainerPostComments/:postId', addTrainerPostComments)
route.delete('/deleteTrainerPostComment/:postId/:commentId', deleteTrainerPostComment)
route.put('/addLikeToTrainerPost/:postId', addLikeToTrainerPost)
route.get('/getTrainierPostComments/:postId', getTrainierPostComments)
route.get('/getTrainerPost', getpostTrainerPost)
route.get('/getpostTrainercreatePostById/:postId', getpostTrainercreatePostById)
route.get('/getTrainerPostBy',jwtverify, getTrainerPostBy)
route.post('/hidePost/:postId', hidePost)
route.get('/searchData',trainerPostSearchHistory)


module.exports = route;