const mongoose = require('mongoose')

const bookMarkedEmployerPostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    postDetails: [
        {
        type: Object
    }
]
});


module.exports = mongoose.model('bookMarkedEmployerPost', bookMarkedEmployerPostSchema)