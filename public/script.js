const socket = io();
let yourCode = null;

document.getElementById('joinBtn').addEventListener('click', () => {
  const username = document.getElementById('usernameInput').value.trim();
  if (username.length === 0) return;

  socket.emit('register', username);
  document.querySelector('.login-screen').classList.add('hidden');
  document.querySelector('.chat-screen').classList.remove('hidden');
});

socket.on('registered', (data) => {
  yourCode = data.code;
  document.getElementById('yourCodeDisplay').innerText = `Your Friend Code: ${yourCode}`;
});

socket.on('onlineUsers', (users) => {
  const list = document.getElementById('onlineUsersList');
  list.innerHTML = `<h3>Online Users</h3>`;
  for (const [code, username] of Object.entries(users)) {
    list.innerHTML += `<div>${username} (${code})</div>`;
  }
});

socket.on('receiveMessage', ({ from, message }) => {
  const div = document.createElement('div');
  div.innerText = `From ${from}: ${message}`;
  document.getElementById('messages').appendChild(div);
});

document.getElementById('messageForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const recipient = document.getElementById('recipientCode').value.trim();
  const message = document.getElementById('messageInput').value.trim();
  if (!recipient || !message) return;

  socket.emit('sendMessage', { to: recipient, message });
  document.getElementById('messageInput').value = '';
});
