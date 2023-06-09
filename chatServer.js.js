const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");

const io = socketio(server);
app.get("/*", function (req, res) {
  res.write(`<h1>Hello socket</h1> ${PORT}`);
  res.end;
});
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("private_message", ({ content, to, timestamp }) => {
    console.log("sent,recieve", content, to);
    socket.to(to).emit("private_message", {
      content,
      from: socket.id,
      time: `${timestamp.hour}:${timestamp.mins}`,
    });
  });
  socket.on("like", ({ postId, postUserId, myId, type }) => {
    io.emit("like", {
      postId: postId,
      postUserId: postUserId,
      myId: myId,
      type:type
    });
    console.log("sent,recieve", postUserId, myId, type);
  });
  socket.on("request", ({ from, to, type }) => {
    io.emit("request", {
      from: from,
      to: to,
      type: type,
    });
    console.log("sent,recieve", from, to, type);
  });
  socket.on("comment", ({ postId, postUserId,  myId }) => {
    io.emit("comment", {
      postId: postId,
      postUserId: postUserId,
      myId: myId,
    });
    console.log("sent,recieve", postId, postUserId, myId);
  });
  socket.on("commentDelete", ({ postId, postUserId,  myId }) => {
    io.emit("commentDelete", {
      postId: postId,
      postUserId: postUserId,
      myId: myId,
    });
    console.log("sent,recieve", postId, postUserId, myId);
  });
  socket.on("message", ({ from, to,  message, time,socketUniqueId }) => {
    io.emit("message", {
      from: from,
      to: to,
      message: message,
      time:time,
      socketUniqueId:socketUniqueId
    });
    console.log("messageing recivieng sending", from, to,  message,time, socketUniqueId);
  });
  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
