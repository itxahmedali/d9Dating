const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello, Socket!</h1>');
});

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  const users = Object.keys(io.sockets.sockets).map((socketId) => {
    const { username } = io.sockets.sockets[socketId];
    return {
      userID: socketId,
      username: username,
    };
  });

  io.emit('users', users);
  console.log(users);

  socket.broadcast.emit('user connected', {
    userID: socket.id,
    username: socket.username,
  });

  socket.on('private_message', ({ content, to, timestamp }) => {
    console.log('sent, received', content, to, socket.id);
    socket.emit('private_message', {
      content,
      from: socket.id,
      time: `${timestamp.hour}:${timestamp.mins}`,
    });
    console.log('emitted');
  });

  socket.on('disconnect', () => {
    console.log(`🔥: ${socket.id} user disconnected`);
  });
});

io.use((socket, next) => {
  const { username } = socket.handshake.auth;

  console.log(username, 'server');

  if (!username) {
    return next(new Error('Invalid username'));
  }

  socket.username = username;
  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
