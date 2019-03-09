const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', function open() {
  ws.send('something from client2');
});

ws.on('message', function incoming(data) {
  console.log(`client2: ${data}`);
});
