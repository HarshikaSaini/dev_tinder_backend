const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const  ConnectionRequestModel  = require('../models/connection-request')
const getSecreteId = (userId, targeted_user_id) => {
  return crypto
    .createHash("sha256")
    .update([userId, targeted_user_id].sort().join("_"))
    .digest("hex");
};

const initalizeSocket = (server) => {
  // server - This server can handle regular HTTP requests (like API calls, web page responses, etc.).
  // you’re attaching Socket.IO to the same HTTP server.
  // That means----------------------------------------
  // Both HTTP requests and WebSocket (real-time) connections share the same server instance.
  // The WebSocket handshake (the initial upgrade from HTTP to WebSocket) happens through this same HTTP server.
  // If you didn’t pass the httpServer, Socket.IO would create its own internal HTTP server on a separate port.
  // But by attaching it manually, you can:
  // 	•	Serve both REST APIs and Socket.IO on the same port (e.g., http://localhost:5173/).
  // 	•	Integrate CORS, authentication, and middleware more easily.
  // 	•	Avoid extra servers and ports.
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinchat", ({ firstName, _id, targeted_user_id }) => {
      const roomId = getSecreteId(_id, targeted_user_id); // creating custom room id
      socket.join(roomId); // inbuilt Socket.Io function(join) that lets connected client join a named "room"
    });

    socket.on("sendMessage", async ({firstName,lastName,photoUrl,userID, targetID,mess,attachment,attachmentType,createdAt}) => {
      try {
        const roomId = getSecreteId(userID, targetID);
        const connectionExists = await ConnectionRequestModel.findOne({
          status:"accepted",
          $or:[
             {fromUserId:userID ,toUserId:targetID},
             {fromUserId:targetID, toUserId:userID}
          ]
        })
     
        if(!connectionExists){
           console.log("Unauthorized message attempt")
           return;
        }

        io.to(roomId).emit("messRecieved", {firstName,lastName,photoUrl,mess,userID,attachment,attachmentType,createdAt});
        
        let chat = await Chat.findOne({
          participants:{$all : [userID,targetID]}
        })

        if(!chat){
         chat = new Chat({
          participants:[userID,targetID],
          message:[]
         })
        }

        chat.message.push({
          senderId:userID,
          text:mess,
          attachment,
          attachmentType
        });
        
        await chat.save();
      } catch (error) {
        console.log(error)
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initalizeSocket;
