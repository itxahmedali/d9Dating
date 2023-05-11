const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');

app.get("/*", function(req, res) {
  res.write(`<h1>Hello socket</h1> ${PORT}`)
  res.end(); // <-- Corrected line
});
const io = socketio(server);
const socketIdToUserIdMap = new Map();

io.on('connection', socket => {
  console.log(`⚡: ${socket.id} user just connected!`);
  
  socket.on('login', ({ userId }) => {
    // Store the mapping of socket ID to user ID
    socketIdToUserIdMap.set(socket.id, userId);
    console.log(`User ${userId} logged in.`);
  });

  socket.on('private_message', ({ content, to }) => {
    const fromUserId = socketIdToUserIdMap.get(socket.id);
    const toSocketId = Array.from(socketIdToUserIdMap.entries())
      .find(([_, userId]) => userId === to)?.[0];
    
    if (toSocketId) {
      io.to(toSocketId).emit('private_message', {
        content,
        from: fromUserId,
        time: new Date().toLocaleTimeString(),
      });
      console.log(`Private message sent from ${fromUserId} to ${to}.`);
    } else {
      console.log(`Invalid recipient: ${to}.`);
    }
  });

  socket.on('disconnect', () => {
    const disconnectedUserId = socketIdToUserIdMap.get(socket.id);
    socketIdToUserIdMap.delete(socket.id);
    console.log(`🔥: User ${disconnectedUserId} disconnected.`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
