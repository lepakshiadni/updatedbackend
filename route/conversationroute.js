const route = require('express').Router()
const {
    newConversation, getConversation,
    getAllConversation, updateLastMessage,
    getLastMessage,
    employerConversationRequestAccept,trainerConversationRequestAccept,
    trainerdeclineConversation,employerdeclineConversation,
    getEmployerConnectionsRequest,getTrainerConnectionsRequest,getAllRequested

} = require('../controllers/conversationctrl')

const {jwtverify} =require('../middleware/jwtverify')



//conversation route

route.post("/newconversation", newConversation)
route.put("/updatedLastmessage/:conversationId", updateLastMessage)
route.get("/lastMessage/:conversationId", getLastMessage)
route.get("/getAllconversation", getAllConversation)
route.get("/getConversation/:userId", getConversation)
route.get('/getAllRequested',jwtverify,getAllRequested)
route.get("/employerConnectionRequest",jwtverify,getEmployerConnectionsRequest)
route.get("/trainerConnectionRequest",jwtverify,getTrainerConnectionsRequest)
route.put("/employerConversationRequestAccept",jwtverify,employerConversationRequestAccept)
route.put("/trainerConversationRequestAccept",jwtverify,trainerConversationRequestAccept)

route.put("/employerdeclineConversation",jwtverify ,employerdeclineConversation)
route.put("/trainerdeclineConversation",jwtverify ,trainerdeclineConversation)


module.exports = route