const socket = io();

const generateBtn = document.getElementById('generateBtn');
const myCodeDisplay = document.getElementById('myCode');
const friendCodeInput = document.getElementById('friendCodeInput');
const friendMessageInput = document.getElementById('friendMessageInput');
const sendFriendMsgBtn = document.getElementById('sendFriendMsgBtn');
const friendChat = document.getElementById('friendChat');

let myCode = null;

generateBtn.onclick = () => {
  socket.emit('generateCode');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
};

socket.on('codeGenerated', (code) => {
  myCode = code;
  myCodeDisplay.textContent = code.toUpperCase();
  generateBtn.textContent = 'Friend Code Generated!';
});

sendFriendMsgBtn.onclick = () => {
  const toCode = friendCodeInput.value.trim().toLowerCase();
  const message = friendMessageInput.value.trim();
  if (!toCode || !message) return alert("Please fill in both fields.");
  socket.emit('sendMessage', { toCode, message });
  addMessage(`You: ${message}`, 'self');
  friendMessageInput.value = '';
};

socket.on('receiveMessage', ({ fromCode, message }) => {
  const label = fromCode === myCode ? 'You' : fromCode.toUpperCase();
  addMessage(`${label}: ${message}`, 'friend');
});

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = 'message';
  if (type === 'self') div.classList.add('self');
  div.textContent = text;
  friendChat.appendChild(div);
  friendChat.scrollTop = friendChat.scrollHeight;
}
