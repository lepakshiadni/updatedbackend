const route = require('express').Router()
const { addMesage,getMessage,getLastmessage  } = require('../controllers/messagectrl')



route.post("/addMesage", addMesage)
route.get("/allMessage/:conversationId",getMessage)
route.get("/lastMessage/:conversationId",getLastmessage)





module.exports = route