const route = require('express').Router()
const {
    newConversation, getConversation,
    getAllConversation, updateLastMessage,
    getLastMessage,getConversationRequest,
    conversationRequestAccept

} = require('../controllers/conversationctrl')
const {jwtverify} =require('../middleware/jwtverify')



//conversation route

route.post("/newconversation", newConversation)
route.put("/updatedLastmessage/:conversationId", updateLastMessage)
route.get("/lastMessage/:conversationId", getLastMessage)
route.get("/getAllconversation", getAllConversation)
route.get("/getConversation/:userId", getConversation)
route.get("/getConversationRequest/:userId", getConversationRequest)
route.put("/conversationRequestAccept",jwtverify,conversationRequestAccept)

module.exports = route