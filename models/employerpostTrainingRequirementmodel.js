const mongoose = require('mongoose');

const employerPostRequriementSchema = new mongoose.Schema({
    postedById:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employer'  
    },
    postedByName: {
        type: String
    },
    postedByCompanyName: {
        type: String
    },
    postedByImg: {
        type: String
    },
    postedByDesignation: {
        type: String
    },
    trainingName: {
        type: String,
    },
    description: {
        type: String,
    },
    topics: [

    ],
    modeOfTraining: {
        type: String,
    },
    typeOfTraining: {
        type: String,
    },
    experience: {
        type: String,
    },
    location: {
        type: String
    },
    participantCount: {
        type: String
    },
    minBudget: {
        type: String,
    },
    maxBudget: {
        type: String
    },
    durationType: {
        type: String
    },
    durationCount: {
        type: String
    },
    selectedCountry: {
        type: String
    },
    availability: {
        type: String
    },
    tocFile: {
        tocFileName: String,
        tocUrl: String
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    urgentlyNeedTrainer: {
        type: String
    },
    // Comments feature
    comments: [
        {
            commentedByUser:{
                type:String
            },
            commentedByProfile: {
                type: String,
            },
            commentedByName: {
                type: String
            },
            commentedByCompany:{
                type:String
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



},
    { timestamps: true }
);


module.exports = mongoose.model('EmployerPostRequirement', employerPostRequriementSchema);