const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

const users = {}; // socket.id -> friendCode
const friendCodeMap = {}; // friendCode -> socket.id

function generateFriendCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  const friendCode = generateFriendCode();
  users[socket.id] = friendCode;
  friendCodeMap[friendCode] = socket.id;

  socket.emit('yourCode', friendCode);
  io.emit('onlineUsers', Object.values(users));

  socket.on('sendMessage', ({ toCode, message }) => {
    const targetSocketId = friendCodeMap[toCode];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiveMessage', {
        from: users[socket.id],
        message,
      });
    }
  });

  socket.on('disconnect', () => {
    const code = users[socket.id];
    delete users[socket.id];
    delete friendCodeMap[code];
    io.emit('onlineUsers', Object.values(users));
  });
});

http.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
