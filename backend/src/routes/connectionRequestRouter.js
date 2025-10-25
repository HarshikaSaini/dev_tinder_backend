const express = require("express");
const connectionRouter = express.Router();
const { userAuth } = require("../utils/user");
const ConnectionRequestModel = require("../models/connection-request");
const User = require("../models/user-model");

// to sent the connection request
connectionRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {
    try {
      const status = req.params.status;
      const toUserId = req.params.toUserId;
      const fromUserId = req.user._id;
    
      //check if user is in data base to whom we are sending request
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ mess: "User not found" });
      }

      // check for the valid status as currently we are dealing with ignore and interest case
      const allowedStatus = ["ignore", "intrested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ mess: "Invalid Request" });
      }

      // check if users are not sending the reqest to each other again and again
      const existingUser = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingUser) {
        let message;
        if(existingUser.fromUserId.toString() === fromUserId.toString()){
          message = `Connection request already sent to ${toUser.firstName}`
        }else{
          message = `You already have connection request from ${toUser.firstName}`
        }
        return res
          .status(400)
          .json({
            mess: message,
          });
      }

      const connectionRequest = new ConnectionRequestModel({
        status,
        fromUserId,
        toUserId,
      });
      await connectionRequest.save();
      res
        .status(200)
        .json({ mess: `Connection Request ${status} successfully`, data: toUser });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error", error);
    }
  }
);

// to accept or reject connection request
connectionRouter.post("/request/received/:status/:requestId", userAuth ,async (req,res)=>{
   try {
      const loggedIn = req.user;
      const { status, requestId } = req.params

      // check for valid status request
      const allowedStatus = ["accepted","rejected"]
      if(!allowedStatus.includes(status)){
        return res.status(400).send("Invalid Request")
      }
     
      const connectionRequest = await ConnectionRequestModel.findOne({
        _id:requestId, 
        status:"intrested", // having status as intrested
        toUserId:loggedIn._id // to whom request came should be the logged in user
      })

      if(!connectionRequest){
        return res.status(400).send("Connection Request not received")
      }
      connectionRequest.status = status
      const data =  await connectionRequest.save()
      res.status(200).json({mess:`Connection ${status}`,data:data})
   
   } catch (error) {
      console.log(error)
      res.status(500).send("Internal server error",error)
   }
})

module.exports = connectionRouter;