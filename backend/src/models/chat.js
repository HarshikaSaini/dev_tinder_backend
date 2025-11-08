const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        default:""
    },
    attachment:{
        type:String,
        default:null
    },
    attachmentType:{
        type:String,
        enum:["image","video","file",null],
        default:null
    }
},{timestamps:true})

const Mess = new mongoose.model("Mess", messageSchema)

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref:"User" , required:true }],
  message:[messageSchema]
});

const Chat = new mongoose.model("Chat", chatSchema);
module.exports = {Chat};
