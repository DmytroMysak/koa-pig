const ngrok = require('ngrok');

module.exports = class Ngrok {
  constructor(port) {
    this.port = port;
    this.url = null;
  }

  async start() {
    this.url = await ngrok.connect(this.port);
  }

  getUrlAddress() {
    return this.url;
  }
};
