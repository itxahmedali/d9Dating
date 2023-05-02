const express = require('express');
const app = express();
const generateID = () => Math.random().toString(36).substring(2, 10);
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const https = require('https').createServer(app);
const cors = require('cors');
app.use(cors());

const socketIO = require('socket.io')(https, {
  cors: {
    origin: '<http://192.168.18.226:3000>',
    methods: ['GET', 'POST'],
  },
});

socketIO.on('connection', socket => {
  console.log(`⚡: ${socket.id} user just connected!`);
  const users = [];
  for (let [id, socket] of socketIO.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socketIO.emit('users', users);
  console.log(users);
  socket.broadcast.emit('user connected', {
    userID: socket.id,
    username: socket.username,
  });
  socket.on('private message', ({content, to, timestamp}) => {
    console.log('sent,recieve', content, to);
    socket.to(to).emit('private message', {
      content,
      from: socket.id,
      time: `${timestamp.hour}:${timestamp.mins}`,
    });
  });
 
  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('🔥: A user disconnected');
  });
});


socketIO.use((socket, next) => {
  const username = socket.handshake.auth.username;
  console.log(socket.handshake.auth.username, 'server');

  if (!username) {
    return next(new Error('invalid username'));
  }
  socket.username = username;
  next();
});

app.get('/api', (req, res) => {
  res.json(chatRooms);
});
app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});
https.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
