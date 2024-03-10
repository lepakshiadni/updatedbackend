const ConversationSchema = require('../models/Conversation')
// const User = require('../models/usermodel');
const trainerSchema = require('../models/trainermodel')
const employerSchema = require('../models/employermodel')
const MessageSchema = require('../models/message')

//new conversation 

const newConversation = async (req, resp) => {
    const { senderId, receiverId } = req.body;

    try {
        // Find the sender and receiver based on their IDs
        const sender = (await trainerSchema.findById(senderId)) || (await employerSchema.findById(senderId));
        const receiver = (await trainerSchema.findById(receiverId)) || (await employerSchema.findById(receiverId));
        console.log(sender)
        console.log(receiver)
        if (!sender || !receiver) {
            return resp.status(404).json({
                success: false,
                message: 'Sender or receiver not found.',
            });
        }

        // Check if a conversation already exists between sender and receiver
        const existingConversation = await ConversationSchema.findOne({
            members: {
                $all: [
                    { $elemMatch: { _id: sender._id } },
                    { $elemMatch: { _id: receiver._id } },
                ],
            },
        });

        if (existingConversation) {
            return resp.status(400).json({
                success: false,
                message: 'Conversation already exists between the users.',
                existingConversation: existingConversation,
            });
        }

        // Create a new conversation
        const newconversation = new ConversationSchema({
            members: [
                sender,
                receiver
            ],
        });

        await newconversation.save();
        resp.status(200).json({ success: true, newconversation });
    } catch (err) {
        console.error("Error creating conversation:", err);
        resp.status(500).json({ success: false, error: err.message });
    }
};



//get all coversation 

const getAllConversation = async (req, resp) => {
    const allConversation = await ConversationSchema.find()
    console.log(allConversation)
    try {
        resp.status(200).json(allConversation)
    }
    catch {
        resp.status(404).json({ message: 'sever error' })
    }
}

//get conversation by userId


const getConversation = async (req, resp) => {
    const { userId } = req.params;
    // console.log(`Searching for conversations where user ID ${userId} is in the members array...`);

    try {
        const conversation = await ConversationSchema.find({
            members: { $elemMatch: { _id: userId } },
        }).populate('members', '-password');

        const conversationsWithLastMessage = await Promise.all(
            conversation.map(async (conversation) => {
                const lastMessage = await MessageSchema.findOne({
                    conversationId: conversation._id,
                })
                    .sort({ createdAt: -1 })
                    .limit(1);

                return {
                    ...conversation.toObject(),
                    lastMessage: lastMessage || null,
                };
            })
        );

        resp.status(200).json({ sucess: true, conversation: conversationsWithLastMessage });
    } catch (err) {
        console.error(`Error getting conversation by user ID ${userId}:`, err);
        resp.status(500).json(err);
    }
};

// Update last message in a conversation
const updateLastMessage = async (req, resp) => {
    const { conversationId } = req.params;
    const { lastMessage } = req.body;
    // console.log(req.body)
    // console.log(req.params)

    try {
        // Find the conversation by its ID
        let updatedConversation = await ConversationSchema.findById(conversationId);

        if (!updatedConversation) {
            return resp.status(404).json({ success: false, message: "Conversation not found" });
        }

        // Update the last message in the conversation
        updatedConversation.lastMessage = lastMessage;

        // Save the updated conversation
        await updatedConversation.save();

        resp.status(200).json({ success: true, updatedConversation });
    } catch (err) {
        console.error(`Error updating last message for conversation ID ${conversationId}:`, err);
        resp.status(500).json({ success: false, error: err.message });
    }
};

const getLastMessage=async(req,resp)=>{
    const{conversationId}=req.params
    const lastMessage=await ConversationSchema.findById(conversationId,"lastMessage").lean()
    // console.log(lastMessage)
    if(lastMessage){
        resp.status(201).json({success:true,message:'Get Last Message Success',lastMessage})
    }
    else{
        resp.status(200).json({success:false,message:"No Last Message"})
    }


}




module.exports = { newConversation, getConversation, getAllConversation, updateLastMessage,getLastMessage }