/* eslint-disable no-underscore-dangle */
const { default: PQueue } = require('p-queue');
const { spawn } = require('child_process');
const logger = require('../helper/logger');

module.exports = class PlayerService {
  constructor() {
    if (typeof PlayerService.instance === 'object') {
      return PlayerService.instance;
    }
    PlayerService.instance = this;
    this.queue = new PQueue({ concurrency: 1 });
    this.process = null;
    return this;
  }

  async _play({ volume, link }) {
    return new Promise((resolve, reject) => {
      this.process = spawn('ffplay', ['-i', link, '-nodisp', '-volume', volume, '-autoexit']);
      this.process.on('close', (code) => {
        this.process = null;
        logger.debug('ffplay done playing');
        resolve(code);
      });
      this.process.stderr.on('error', (error) => {
        this.process = null;
        logger.error('Some error from fflay');
        reject(error);
      });
      // without this line -autoexit not working (((
      this.process.stderr.on('data', () => {});
    });
  }

  stopSong() {
    this.process?.kill('SIGINT');
  }

  addToQueue(audioData) {
    return this.queue.add(() => this._play(audioData));
  }

  pauseQueue() {
    return this.queue.pause();
  }

  clearQueue() {
    return this.queue.clear();
  }
};
