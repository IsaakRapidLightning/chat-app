const socket = io();
let myCode = '';

socket.on('yourCode', (code) => {
  myCode = code;
  document.getElementById('your-code').textContent = `Your Code: ${code}`;
});

socket.on('onlineUsers', (codes) => {
  const list = document.getElementById('online-list');
  list.innerHTML = '';
  codes.forEach(code => {
    if (code !== myCode) {
      const item = document.createElement('li');
      item.textContent = code;
      item.onclick = () => {
        document.getElementById('friend-code-input').value = code;
      };
      list.appendChild(item);
    }
  });
});

socket.on('receiveMessage', ({ from, message }) => {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = `[${from}] → ${message}`;
  document.getElementById('messages').appendChild(msg);
});

document.getElementById('send-btn').onclick = () => {
  const toCode = document.getElementById('friend-code-input').value;
  const message = document.getElementById('message-input').value;
  if (toCode && message) {
    socket.emit('sendMessage', { toCode, message });
    const msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = `To [${toCode}]: ${message}`;
    document.getElementById('messages').appendChild(msg);
    document.getElementById('message-input').value = '';
  }
};
