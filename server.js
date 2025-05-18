const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { randomBytes } = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Map friend codes to socket ids
const friendCodeToSocket = new Map();

io.on('connection', (socket) => {
  let myFriendCode = null;

  // Generate and send a new friend code
  socket.on('generateCode', () => {
    // Generate 6-char alphanumeric code
    myFriendCode = randomBytes(3).toString('hex');
    friendCodeToSocket.set(myFriendCode, socket.id);
    socket.emit('codeGenerated', myFriendCode);
  });

  // Handle sending a message to a friend code
  socket.on('sendMessage', ({ toCode, message }) => {
    const targetSocketId = friendCodeToSocket.get(toCode);
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiveMessage', { fromCode: myFriendCode, message });
    } else {
      socket.emit('receiveMessage', { fromCode: 'System', message: `Friend code ${toCode} not found.` });
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    if (myFriendCode) {
      friendCodeToSocket.delete(myFriendCode);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
