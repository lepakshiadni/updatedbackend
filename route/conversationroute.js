const route=require('express').Router()
const {newConversation,getConversation, getAllConversation,updateLastMessage,getLastMessage}=require('../controllers/conversationctrl')



//conversation route

route.post("/newconversation",newConversation)
route.put("/updatedLastmessage/:conversationId",updateLastMessage)
route.get("/lastMessage/:conversationId",getLastMessage)
route.get("/getAllconversation",getAllConversation)
route.get("/:userId",getConversation)

module.exports=route