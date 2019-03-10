
const WebSocket = require('ws');
// https://inops.serveo.net
const ws = new WebSocket('ws://localhost:4000', {
  headers: { token: 'xxx' },
});

ws.on('open', function open() {
  ws.send('something from client1');
});

ws.on('message', function incoming(data) {
  console.log(`client1: ${data}`);
});
