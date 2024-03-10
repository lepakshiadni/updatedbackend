const MessageSchema = require('../models/message')


//post the messages

const addMesage = async (req, resp) => {
    const { conversationId, sender, text } = req.body;
    
    // Ensure conversationId is defined before creating a new Message
    if (!conversationId || !sender || !text) {
        return resp.status(400).json({ success: false, message: 'Invalid message data' });
    }

    const newMessage = new MessageSchema({
        conversationId,
        sender,
        text,
    });

    try { 
        const savedMessage = await newMessage.save();
        resp.status(200).json({ success: true, message: 'Message saved', savedMessage });
    } catch (err) {
        resp.status(500).json(err);
    }
};

//get the messages

const getMessage = async (req, resp) => {
    const { conversationId } = req.params

    const messages = await MessageSchema.find({
        conversationId: conversationId
    })
    const lastMessage = await MessageSchema.findOne({
         conversationId }).sort({ createdAt: -1 }).limit(1);

    try {
        resp.status(200).json({ sucess: true, messages:messages,lastMessage:lastMessage })
    }
    catch (err) {
        resp.status(500).json(err)
    }
}

const getLastmessage = async (req, resp) => {
    const { conversationId } = req.params;

    try {
        const lastMessage = await MessageSchema.findOne({ conversationId }).sort({ createdAt: -1 }).limit(1);
        resp.json({ lastMessage: lastMessage });
    } 
    catch (error) {
        console.error("Error fetching last message:", error);
        resp.status(500).json({ error: "Internal Server Error" });
    }

}
module.exports = { addMesage, getMessage, getLastmessage }