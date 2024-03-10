const mongoose = require('mongoose')


const ConversationSchema = mongoose.Schema(
    {
        members: {
            type: Array,  // array of user id's that are in the conversation
            required: true
        },

        lastMessage: {
            type: {
                sender: String,
                text: String,
                createdAt: String,
            },
            default: null,
        },
    },

    {
        timestamps: true
    }

)

// Adding an index to the members field
ConversationSchema.index({ members: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema)