const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
    {

        fullName: {
            type: String,
        },
        experience: {
            type: Number,
        },
        skills: [
            {
                type: Object
            }
        ],
        role: {
            type: String,  //trainer or employer
        },
        basicInfo: {

            profileImg: {
                type: String
            },
            profileBanner: {
                type: String
            },
            firstName: {
                type: String
            },
            lastName: {
                type: String
            },
            designation: {
                type: String
            },
            company: {
                type: String
            },
            age: {
                type: Number
            },
            location: {
                type: String
            },
            objective: {
                type: String
            },
            aboutYou: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            },
            visbility: {
                noOne: {
                    type: Boolean,
                    default: false
                },
                yourFriends: {
                    type: Boolean,
                    default: false
                },
                allSissoMembers: {
                    type: Boolean,
                    default: false
                }
            }
        },

        certificateDetails: [
            {
                certificateHead: {
                    type: String
                },
                institution: {
                    type: String
                },
                certificationDescription: {
                    type: String
                },
                certificateUrl: {
                    type: String,
                },
                status: {
                    type: Boolean,
                    default: false
                },
                visbility: {
                    noOne: {
                        type: Boolean,
                        default: false
                    },
                    yourFriends: {
                        type: Boolean,
                        default: false
                    },
                    allSissoMembers: {
                        type: Boolean,
                        default: false
                    }
                }
            },
        ],

        contactInfo: {

            primaryNumber: {
                type: Number,
                unique: true,
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            secondaryNumber: {
                type: Number,
                unique: true,
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            address: {
                type: String
            },
            email: {
                type: String,
                unique: true,
                sparse: true  // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            website: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            },
            visbility: {
                noOne: {
                    type: Boolean,
                    default: false
                },
                yourFriends: {
                    type: Boolean,
                    default: false
                },
                allSissoMembers: {
                    type: Boolean,
                    default: false
                }
            }
        },
        experience: {
            expertIn: {
                type: String
            },
            experience: {
                type: Number
            },
            sinceInTheFiled: {
                type: Number
            },
            recentCompany: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            }
        },

        connections: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'
                }
            }
        ],
        skillsRating: [
            {
                skillname: String,
                rating: { type: Decimal128 }
            }
        ],
        likes: [
            {
                postId: {
                    type: mongoose.Schema.Types.ObjectId, ref: ''
                }
            }
        ],
        rating: [
            {
                trainingName: String,
                value: Number,  // from 1 to 5
            }
        ],
        notification:{

            messages:{
                type:Boolean,
                default:false
            },
            updateProfile:{
                type:Boolean,
                default:false
            },
            newsAndreports:{
                type:Boolean,
                default: false
            },
            proposals:{
                type: Boolean,
                default:false
            }

        }
    },
    { timestamps: true }

)


trainerSchema.indexes({ 'contactInfo.primaryNumber': 1 });

module.exports = mongoose.model("Trainers", trainerSchema)