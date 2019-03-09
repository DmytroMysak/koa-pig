const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });
console.log('started');
wss.on('connection', function connection(ws) {
  console.log('connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something from server');
});

class A {
  constructor(object) {
    console.log(Object.keys(object));
    this.object = object;
  }

  a() {
    console.log(Object.keys(this.object));
  }
}

const object = {};

const a = new A(object);
object['abc'] = wss;
a.a();
