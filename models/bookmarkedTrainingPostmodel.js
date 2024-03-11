const mongoose = require('mongoose');

const bookMarkedTrainingPostSchema = new mongoose.Schema({
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

module.exports = mongoose.model('bookMarkedTrainingPost', bookMarkedTrainingPostSchema);
