const { default: PQueue } = require('p-queue');
const Speaker = require('speaker');
const logger = require('../helper/logger');
const { getFfmpeg } = require('../helper/util');

module.exports = class PlayerService {
  constructor() {
    if (typeof PlayerService.instance === 'object') {
      return PlayerService.instance;
    }
    PlayerService.instance = this;

    this.queue = new PQueue({ concurrency: 1 });
    this.process = null;
    this.speaker = new Speaker();
    this.updateSpeaker = (function updateSpeaker(codec) {
      this.speaker.channels = codec.audio_details[2] === 'mono' ? 1 : 2;
      this.speaker.sampleRate = parseInt(codec.audio_details[1].match(/\d+/)[0], 10);
    }).bind(this);

    return this;
  }

  /**
   * @param {{ volume: number, chatId: string, link: string, command: string }} audioData
   * @return {Promise}
   */
  addToQueue(audioData) {
    return this.queue.add(() => this.play(audioData));
  }

  stopSong() {
    this.process?.ffmpegProc?.stdin?.write('q');
  }

  pauseQueue() {
    return this.queue.pause();
  }

  clearQueue() {
    return this.queue.clear();
  }

  /**
   * @param {{ volume: number, chatId: string, link: string, command: string }} audioData
   * @return {Promise}
   */
  async play({ link, volume }) {
    return new Promise((resolve, reject) => {
      this.speaker = new Speaker();
      this.process = getFfmpeg(link, volume).on('codecData', this.updateSpeaker);
      try {
        this.process.pipe(this.speaker);
      } catch (e) {
        this.speaker.close(false);
      }
      this.speaker.on('close', (() => resolve()));
      this.speaker.on('error', (() => reject()));
    });
  }
};
