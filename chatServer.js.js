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
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  io.emit("users", users);
  console.log(users);
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
  socket.on("private_message", ({ content, to, timestamp }) => {
    console.log("sent,recieve", content, to);
    socket.to(to).emit("private_message", {
      content,
      from: socket.id,
      time: `${timestamp.hour}:${timestamp.mins}`,
    });
  });
  socket.on("like", ({ postId, postUserId, myId }) => {
    io.emit("like", {
      postId: postId,
      postUserId: postUserId,
      myId: myId,
    });
    console.log("sent,recieve", postUserId, myId);
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
  socket.on("disconnect", () => {
    socket.disconnect();
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        username: socket.username,
      });
    }
    io.emit("user-disconnected", users);
    console.log("🔥: A user disconnected", users);
  });
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  console.log(socket.handshake.auth.username, "server");

  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
