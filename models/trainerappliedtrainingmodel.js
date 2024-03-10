const { Decimal128 } = require('mongodb')
const mongoose = require('mongoose')

const trainerAppliedTraining = new mongoose.Schema({
    trainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'trainer'
    },
    trainerProfileImg: {
        type: String,
    },
    trainerName: {
        type: String
    },
    trainerDesignation: {
        type: String
    },
    trainerRating: {
        type: Array,
    },
    trainingDetails: [
        {
            trainingPostDetails: {
                type: Object
            },
            trainerAvailableDate1: {
                type: String
            },
            trainerAvailableDate2: {
                type: String
            },
            trainerAvailableDate3: {
                type: String
            },
            trainerModeOfTraining: {
                type: String
            },
            trainingResources: [
                {
                    fileName: {
                        type: String,
                    },
                    fileData: {
                        type: String
                    },
                    fileOriginalName: {
                        type: String
                    }

                }
            ],
            feedBackDetails: {
                
                reviewedById: {
                    type: String,
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
                    type: mongoose.Types.Decimal128
                },
                feedBack: {
                    type: String
                }
             

            },
            appliedStatus: {
                type: Boolean,
                default: false
            },
            applicationstatus: {
                type: String,
                default: 'Pending'
            }

        }
    ],


},
    { timestamps: true }
)

module.exports = mongoose.model("trainerappliedtraining", trainerAppliedTraining)