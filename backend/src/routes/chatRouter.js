const express = require("express");
const { userAuth } = require("../utils/user");
const { Chat } = require("../models/chat");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetId", userAuth, async (req, res) => {
  const { targetId } = req.params;
  const user = req.user;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [user._id, targetId] },
    }).populate({
      path: "message.senderId",
      select: "firstName lastName photoUrl",
    });
    if (!chat) {
      chat = new Chat({
        participants: [user._id, targetId],
        message: [],
      });
    }

    const totalMessages = chat.message.length;
    const start = Math.max(totalMessages - limit * page, 0);
    const end = totalMessages - limit * (page - 1);

    // Get paginated slice (latest first)
    const paginatedMessages = chat.message.slice(start, end);
    await chat.save();
    res.status(200).json({
      participants: chat.participants,
      messages: paginatedMessages,
      hasMore: start > 0,
    });
  } catch (error) {
    console.log("error in sending chat data", error);
  }
});

module.exports = chatRouter;
