const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../utils/user");
const ConnectionRequestModel = require("../models/connection-request");
const User = require("../models/user-model");

// to get the list of all pending connection request
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedIn = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedIn._id,
      status: "intrested",
    }).populate("fromUserId", "firstName lastName age photoUrl gender contact desc");
   
    // const data = connectionRequests.map(item => item.fromUserId)
    
    res
      .status(200)
      .json({ mess: "Data fetched successfully", data:connectionRequests });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error", error);
  }
});

// get all the accepted connection of the user
userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    const loggedIn = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedIn._id, status: "accepted" },
        { fromUserId: loggedIn._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName age photoUrl gender contact desc")
      .populate("toUserId", "firstName lastName age photoUrl gender contact desc");

    // we dont want to send the entire info of the request model so we just sent fromuserId data or to userId data
    const data = connections.map((item) => {
      if (item.fromUserId._id.toString() === loggedIn._id.toString()) {
        return item.toUserId;
      } else {
        return item.fromUserId;
      }
    });
    
    res.status(200).json({
      mess: "Data fetched successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mess: "Internal server error", err: error });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedIn = req.user;
    // pagination for the users
    const page = req.query.page || 1;
    let limit = req.query.limit || 20;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    // get all the connection data to which user has done interaction
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedIn._id }, { toUserId: loggedIn._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((item) => {
      hideUsersFromFeed.add(item.fromUserId.toString());
      hideUsersFromFeed.add(item.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedIn._id } },
      ],
    })
      .select("firstName lastName age photoUrl gender contact desc skills")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ mess: "Feed fetched successfully", data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mess: "Internal server error", data: error });
  }
});

module.exports = userRouter;
