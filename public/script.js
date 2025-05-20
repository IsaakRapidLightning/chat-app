const socket = io();
let myUsername = '';
let currentChat = null;

function showPrompt() {
  document.getElementById('username-prompt').classList.remove('hidden');
  document.getElementById('chat-container').classList.add('hidden');
}

function showChat() {
  document.getElementById('username-prompt').classList.add('hidden');
  document.getElementById('chat-container').classList.remove('hidden');
  document.getElementById('user-list-container').classList.remove('hidden');
  document.getElementById('dm-container').classList.add('hidden');
}

function showDM(username) {
  try {
    currentChat = username;
    document.getElementById('dm-title').textContent = `Chatting with: ${username}`;
    document.getElementById('dm-container').classList.remove('hidden');
    document.getElementById('user-list-container').classList.add('hidden');
    document.getElementById('messages').innerHTML = '';
    document.getElementById('message-input').focus();
    console.log(`Switched to DM with ${username}`);
  } catch (error) {
    console.error('Error in showDM:', error);
    alert('Failed to open chat. Please try again.');
  }
}

function showUserList() {
  currentChat = null;
  document.getElementById('dm-container').classList.add('hidden');
  document.getElementById('user-list-container').classList.remove('hidden');
  document.getElementById('messages').innerHTML = '';
  console.log('Returned to user list');
}

socket.on('connect', () => {
  showPrompt();
});

socket.on('usernameTaken', () => {
  alert('Username is taken. Please choose another.');
  document.getElementById('username-input').value = '';
});

socket.on('yourUsername', (username) => {
  myUsername = username;
  document.getElementById('your-username').textContent = `Your Username: ${username}`;
  showChat();
});

socket.on('onlineUsers', (users) => {
  const list = document.getElementById('online-list');
  list.innerHTML = '';
  users.forEach(user => {
    if (user !== myUsername) {
      const item = document.createElement('li');
      item.className = 'online-user';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = user;
      const chatBtn = document.createElement('button');
      chatBtn.textContent = 'Chat';
      chatBtn.className = 'chat-btn';
      chatBtn.onclick = () => showDM(user);
      item.appendChild(nameSpan);
      item.appendChild(chatBtn);
      list.appendChild(item);
    }
  });
});

socket.on('receiveMessage', ({ from, message, timestamp }) => {
  if (from === currentChat) {
    const msg = document.createElement('div');
    msg.className = 'message received';
    msg.textContent = `${message} (${new Date(timestamp).toLocaleTimeString()})`;
    document.getElementById('messages').appendChild(msg);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    playNotificationSound();
  }
});

socket.on('typing', ({ from }) => {
  if (from === currentChat) {
    const indicator = document.getElementById('typing-indicator');
    indicator.textContent = `${from} is typing...`;
    indicator.classList.remove('hidden');
    setTimeout(() => indicator.classList.add('hidden'), 3000);
  }
});

document.getElementById('join-btn').onclick = () => {
  const username = document.getElementById('username-input').value.trim();
  if (!username || username.length < 3) {
    alert('Username must be at least 3 characters.');
    return;
  }
  socket.emit('join', username);
};

document.getElementById('send-btn').onclick = () => {
  const message = document.getElementById('message-input').value.trim();
  if (!currentChat || !message) {
    alert('Please select a user and enter a message.');
    return;
  }
  socket.emit('sendMessage', { to: currentChat, message, timestamp: Date.now() });
  const msg = document.createElement('div');
  msg.className = 'message sent';
  msg.textContent = `${message} (${new Date().toLocaleTimeString()})`;
  document.getElementById('messages').appendChild(msg);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
  document.getElementById('message-input').value = '';
};

document.getElementById('message-input').oninput = () => {
  if (currentChat) {
    socket.emit('typing', { to: currentChat });
  }
};

document.getElementById('copy-username').onclick = () => {
  navigator.clipboard.writeText(myUsername).then(() => {
    alert('Username copied!');
  }).catch(() => {
    alert('Failed to copy username.');
  });
};

document.getElementById('theme-toggle').onclick = () => {
  document.documentElement.classList.toggle('dark');
};

document.getElementById('back-btn').onclick = () => {
  showUserList();
};

function playNotificationSound() {
  const audio = new Audio('https://freesound.org/data/previews/316/316847_4939433-lq.mp3');
  audio.play().catch(() => console.log('Audio play failed'));
}