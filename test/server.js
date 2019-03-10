const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 4000,
  verifyClient: (info, cb) => {
    const { token } = info.req.headers;
    console.log(token);
    if (!token) {
      return cb(false, 401, 'Unauthorized');
    }
    info.req.token = token; // eslint-disable-line no-param-reassign
    return cb(true);
  },
});
console.log('started');
wss.on('connection', function connection(ws) {
  console.log('connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send(JSON.stringify({ a: 'something from server', b: 'bla-bla-bla' }));
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
