import Serveo from './Serveo';

export default class Tunnel {
  constructor(port) {
    this.serveo = new Serveo(port);
  }

  createTunnel() {
    return this.serveo.start()
      .then(() => this.serveo.getUrlAddress());
  }
}
