const ConversationSchema = require('../models/Conversation')
// const User = require('../models/usermodel');
const trainerSchema = require('../models/trainermodel')
const employerSchema = require('../models/employermodel')
const MessageSchema = require('../models/message')

//new conversation 

const newConversation = async (req, resp) => {
    const { senderId, receiverId } = req.body;
    console.log('api hit')
    console.log(req.body)

    try {
        // Find the sender and receiver based on their IDs
        const sender = (await trainerSchema.findById(senderId)) || (await employerSchema.findById(senderId));
        const receiver = (await trainerSchema.findById(receiverId)) || (await employerSchema.findById(receiverId));
        console.log(sender)
        console.log(receiver)
        if (!sender || !receiver) {
            return resp.status(200).json({ success: false, message: 'Sender or receiver not found.' });
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
            return resp.status(200).json({
                success: false,
                message: 'Conversation already exists between the users.',
                conversation: existingConversation,
            });
        }

        // Create a new conversation
        const newconversation = new ConversationSchema({
            members: [
                { _id: sender._id, fullName: sender?.fullName, basicInfo: sender.basicInfo },
                { _id: receiver._id, fullName: receiver?.fullName, basicInfo: receiver.basicInfo }
            ],
        });

        await newconversation.save();
        resp.status(201).json({ success: true, message: 'Connected', conversation: newconversation });
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
        resp.status(201).json(allConversation)
    }
    catch {
        resp.status(200).json({ message: 'sever error' })
    }
}

//get conversation by userId


const getConversation = async (req, resp) => {
    const { userId } = req.params;
    // console.log(`Searching for conversations where user ID ${userId} is in the members array...`);

    try {
        const conversation = await ConversationSchema.find({
            members: { $elemMatch: { _id: userId } },
            requestStatus: "accepted" // Filter by request status being "accepted"
        })


        if (conversation?.length > 0) {
            resp.status(201).json({ sucess: true, conversation: conversation });
        }
        else {
            resp.status(200).json({ success: false, message: 'No matched result or Waiting For Accept' })
        }

    } catch (err) {
        console.error(`Error getting conversation by user ID ${userId}:`, err);
        resp.status(200).json({ success: false, message: `Server Error : ${err}` });
    }
};

const getConversationRequest = async (req, resp) => {
    const { userId } = req.params;
    try {
        const conversation = await ConversationSchema.find({
            members: { $elemMatch: { _id: userId } },
            requestStatus: "pending"
        })
        if (conversation.length === 0) {
            resp.status(200).json({ success: false, message: 'There are no requests at this time.' })
        }
        else {
            resp.status(201).json({ sucess: true, message: 'conversationFound', conversation });
        }


    }
    catch (err) {
        // console.log('error', err)
        resp.status(200).json({ success: false, message: 'Server error', errors: err })
    }
}

// Accept the converstaion request 

const conversationRequestAccept = async (req, resp) => {
    const  {requestId}  = req.body;
    const { _id } = req.user
    console.log('api hit')
    console.log(requestId)
    // Find the specific request from the array of requests in db and update it to accepted status

    try {

        const findconversation = await ConversationSchema.findOneAndUpdate(
            {
                members: { $elemMatch: { _id: requestId } },
                requestStatus: "pending",
            },
            {
                $set: {
                    'requestStatus': 'accepted',
                }
            },
            { new: true },
        )
        console.log(findconversation);
        if (findconversation) {

            await findconversation.save()
            console.log(findconversation);
            const conversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            resp.status(200).json({ success: true, message: 'Conversation Request is Accepted', conversation })

        }

        
    }
    catch (error) {
        console.log(error)
        console.log("Error in finding and updating the document")

    }





}

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

const getLastMessage = async (req, resp) => {
    const { conversationId } = req.params
    const lastMessage = await ConversationSchema.findById(conversationId, "lastMessage").lean()
    // console.log(lastMessage)
    if (lastMessage) {
        resp.status(201).json({ success: true, message: 'Get Last Message Success', lastMessage })
    }
    else {
        resp.status(200).json({ success: false, message: "No Last Message" })
    }
}




module.exports = {
    newConversation, getConversation,
    getAllConversation, updateLastMessage,
    getLastMessage, getConversationRequest,
    conversationRequestAccept
}
