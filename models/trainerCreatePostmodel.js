const mongoose = require('mongoose')

const trainerCreatePost = new mongoose.Schema({
    postedById: {
        type: String
    },
    postedByName: {
        type: String
    },
    postedByDesignation: {
        type: String
    },
    postedByImg: {
        type: String
    },
    postForAllSissoMember: {
        type: Boolean,
        default: false
    },
    onlyPostMyConnenctions: {
        type: Boolean,
        default: false
    },
    postedImg: {
        fileName: {
            type: String
        },
        postImg: {
            type: String
        }
    },
    postedDescrition: {
        type: String
    },
    comments: [
        {
            commentedByUser: {
                type: String
            },
            commentedByProfile: {
                type: String,
            },
            commentedByName: {
                type: String
            },
            commentedByCompany: {
                type: String
            },
            comment: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    likes: [
        {
            likedBy: {
                type: String,
            }
        }
    ]

}, { timestamps: true }

)

module.exports = mongoose.model("trainerCreatePost", trainerCreatePost)