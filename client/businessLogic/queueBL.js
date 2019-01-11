import PQueue from 'p-queue';
import Audio from './audioBL';


export default class Queue {
  constructor() {
    this.queue = new PQueue({ concurrency: 1 });
    this.audio = new Audio();
  }

  addToQueue(audioData) {
    return this.queue.add(() => this.audio.playSong(audioData));
  }

  pauseQueue() {
    return this.queue.pause();
  }

  clearQueue() {
    return this.queue.clear();
  }
}
