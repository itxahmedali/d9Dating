const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const https = require('https').createServer(app);
const cors = require('cors');
app.use(cors());

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');

app.set('port', port);
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

app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});
https.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
