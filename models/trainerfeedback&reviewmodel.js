const mongoose = require('mongoose')

const trainerFeedBackSchema = new mongoose.Schema({
    trainerId: {
        type: String,
    },
    feedBackDetails: [
        {
            reviewedById: {
                type: String,
                required: true
            },
            reviewedByName: {
                type: String
            },
            reviewedByDesignation: {
                type: String
            },
            reviewedByImg: {
                type: String
            },
            rating: {
                type: Number
            },
            feedBack: {
                type: String
            }
        }
    ],



})

module.exports = mongoose.model("TrainerFeedback", trainerFeedBackSchema)

