import Queue from './queueBL';
import AudioService from './audioBL';
import logger from '../helper/logger';

export default class PigService {
  constructor() {
    this.queue = new Queue();
  }

  speak(fileName, options) {
    return this.queue.addToQueue({ fileName, ...options })
      .catch(err => logger.error(err));
  }

  pigSpeakIfExist(fileName, options) {
    return AudioService.isFileExist(fileName)
  }

  saveAndSpeak() {

  }
}
