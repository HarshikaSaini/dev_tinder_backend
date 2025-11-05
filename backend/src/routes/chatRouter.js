const express = require("express")
const { userAuth } = require("../utils/user")
const { Chat } = require("../models/chat")
const chatRouter = express.Router()

chatRouter.get("/chat/:targetId", userAuth , async(req,res)=>{
    const {targetId} = req.params;
    const user = req.user;
    try {
        let chat = await Chat.findOne({
            participants:{$all : [user._id,targetId]}
        }).populate({
            path:"message.senderId",
            select:"firstName lastName photoUrl"
        })
        if(!chat){
            chat = new Chat({
                participants:[user._id, targetId],
                message:[]
            })
        }
        await chat.save();
        res.status(200).json(chat)
    } catch (error) {
        console.log("error in sending chat data", error)
    }

})

module.exports=chatRouter