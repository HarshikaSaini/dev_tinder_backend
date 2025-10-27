const socket = require("socket.io");

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
      origin: "http://localhost:5173/",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinchat", ({userId,targetId}) => {
    const roomId = [userId,targetId].sort().join("_");
    console.log(roomId)
    socket.join(roomId)
    });
    socket.on("sendMessage", () => {});
    socket.on("disconnect", () => {});
  });
};

module.exports = initalizeSocket;
