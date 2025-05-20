const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const sanitizeHtml = require('sanitize-html');

app.use(express.static('public'));

const users = {}; // socket.id -> username
const usernameMap = {}; // username -> socket.id

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    username = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
    if (usernameMap[username]) {
      socket.emit('usernameTaken');
      return;
    }
    users[socket.id] = username;
    usernameMap[username] = socket.id;
    socket.emit('yourUsername', username);
    io.emit('onlineUsers', Object.values(users));
  });

  socket.on('sendMessage', ({ to, message, timestamp }) => {
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });
    const targetSocketId = usernameMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiveMessage', {
        from: users[socket.id],
        message,
        timestamp
      });
    }
  });

  socket.on('typing', ({ to }) => {
    const targetSocketId = usernameMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('typing', { from: users[socket.id] });
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    delete usernameMap[username];
    io.emit('onlineUsers', Object.values(users));
  });
});

http.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});