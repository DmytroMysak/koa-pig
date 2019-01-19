import Player from 'play-sound';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import config from '../config/env';
import logger from '../helper/logger';

let instance = null;

export default class Audio {
  constructor() {
    if (!instance) {
      instance = this;
    }
    this.player = new Player();
    this.currentPlayer = null;
    return instance;
  }

  static createFullPathToFile(fileName) {
    return path.normalize(`${__dirname}/../${config.folderToSaveSongs}/${fileName}`);
  }

  static isFileExist(fileName) {
    const isExists = promisify(fs.exists);
    return isExists(Audio.createFullPathToFile(fileName));
  }

  static saveStreamToFile(stream, fileName) {
    return new Promise((resolve, reject) => {
      const fullPath = Audio.createFullPathToFile(fileName);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(stream);
      writeStream
        .on('finish', () => resolve(fileName))
        .on('error', err => reject(err));
    }).catch(err => logger.error(err));
  }

  playSong(audioData) {
    const fullPath = Audio.createFullPathToFile(audioData.fileName);
    return new Promise((resolve, reject) => {
      this.currentPlayer = this.player.play(fullPath, { mplayer: ['-volume', audioData.volume || -1] }, (err) => {
        if (!err || err === 1) {
          // err === 1 ==> force stop player
          this.currentPlayer = null;
          return resolve();
        }
        return reject(err);
      });
    });
  }

  stopSong() {
    if (this.currentPlayer) {
      this.currentPlayer.kill();
    }
    return Promise.resolve();
  }
}
