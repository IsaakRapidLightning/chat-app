const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const users = {}; // { socket.id: { code, username } }
const codes = {}; // { code: socket.id }

function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

io.on('connection', (socket) => {
  let code = generateCode();
  while (codes[code]) code = generateCode();

  socket.on('register', (username) => {
    users[socket.id] = { code, username };
    codes[code] = socket.id;

    socket.emit('registered', { code });

    io.emit('onlineUsers', Object.fromEntries(
      Object.values(users).map(u => [u.code, u.username])
    ));
  });

  socket.on('sendMessage', ({ to, message }) => {
    const toSocket = codes[to];
    const fromUser = users[socket.id];
    if (toSocket && fromUser) {
      io.to(toSocket).emit('receiveMessage', {
        from: fromUser.username || fromUser.code,
        message
      });
    }
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      delete codes[users[socket.id].code];
      delete users[socket.id];
      io.emit('onlineUsers', Object.fromEntries(
        Object.values(users).map(u => [u.code, u.username])
      ));
    }
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
