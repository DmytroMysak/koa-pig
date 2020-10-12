const { spawn } = require('child_process');
const logger = require('../../helper/logger');

module.exports = class Serveo {
  constructor(port) {
    this.port = port;
    this.process = null;
    this.stdoutData = null;
  }

  start() {
    this.process = spawn('ssh', ['-o', 'ServerAliveInterval=60', '-R', `80:localhost:${this.port}`, 'serveo.net']);

    return new Promise((resolve, reject) => {
      this.process.stdout.on('data', (data) => {
        logger.debug(`stdout: ${data.toString()}`);
        this.stdoutData = data.toString();
        resolve();
      });
      this.process.on('close', (code) => {
        logger.error(`child process exited with code ${code}`);
        reject(code);
      });
    });
  }

  getUrlAddress() {
    return this.stdoutData.match(/https:\/\/[\w]+.serveo.net/g)[0];
  }
};
