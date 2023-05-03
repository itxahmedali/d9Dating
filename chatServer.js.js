// const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');

const io = socketio(server);
app.get("/*", function(req, res) {
  res.write(`<h1>Hello socket</h1> ${PORT}`)
  res.end
});
io.on('connection', (socket) => {
  console.log("a user connected :D");
        socket.on('message', (message) => {
            const obj = JSON.stringify(message)
            io.emit('message',`${obj}`);
            socket.broadcast.to(message.recieverId).emit( 'message',`${obj}`);
            console.log(message);
        });
//   socket.on('typing', ({user,status})=>{
//     const obj = {status, user}
//     io.emit('typing', obj)
//     socket.broadcast.to(user).emit( 'typing',`${obj}`);
//   })
//   socket.on('notification', (noticondition, userData) => {
//     const obj = JSON.stringify(noticondition)
//     io.emit('notification',`${obj}`);
//     socket.broadcast.to(userData).emit( 'notification',`${obj}`);
//   });
//   socket.on('call', (noticondition, userData) => {
//     const obj = JSON.stringify(noticondition)
//     io.emit('call',`${obj}`);
//     socket.broadcast.to(userData).emit( 'call',`${obj}`);

//   });
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
  // USER IS ONLINE
//   socket.on("online", (userId) => {
//     const obj = JSON.stringify(userId);
//     io.emit('online',`${obj}`);
// });

// // USER IS OFFLINE
// socket.on("offline", (userId) => {
//   const obj = JSON.stringify(userId);
//   io.emit('offline',`${obj}`);
// });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));