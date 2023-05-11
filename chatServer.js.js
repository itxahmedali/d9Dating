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

// Store connected clients
const clients = new Map();

// Handle new connections
io.on('connection', (socket) => {
  console.log('connected user: ', socket.id);
  // Handle new user joining the chat
  socket.on('join', (userId) => {
    console.log('Join user: ', userId);
    // Authenticate the user (you can add your own authentication logic here)

    // Store the user's socket with their user ID
    clients.set(userId, socket);

    // Join a room based on the user ID
    socket.join(userId);
  });

  // Handle incoming messages
  socket.on('message', (data) => {
    const { senderId, receiverId, message } = data;
    console.log('User data : ', data);
    // Check if the receiver is connected and in the same room
    const receiverSocket = clients.get(receiverId);
    if (receiverSocket && receiverSocket.rooms.has(receiverId)) {
      console.log('condition matched : ',receiverSocket, data);
      // Send the message to the receiver in the specified room
      receiverSocket.to(receiverId).emit('message', { senderId, message });
    } else {
      // Receiver is offline or not found
      // You can handle this case accordingly
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    // Remove the user's socket from the clients map
    for (const [userId, clientSocket] of clients.entries()) {
      if (clientSocket === socket) {
        clients.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
