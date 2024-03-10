const mongoose = require('mongoose')

const bookMarkedTrainingPost = new mongoose.Schema({
    useId: {
        type: String,
    },  // the id of the user who has bookmark
    bookMarkedTrainingPost: [
        {
            postId:{
                type:String,

            },
            postDetails:{
                type:Object
            }
        }
    ]
    
})


module.exports = mongoose.model('bookMarkedTrainingPost', bookMarkedTrainingPost)