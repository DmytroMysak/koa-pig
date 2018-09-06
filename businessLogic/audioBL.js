import Player from 'play-sound';
import fs from 'fs';
import https from 'https';
import path from 'path';
import logger from '../helper/logger';
import config from '../config/env';

export default class Audio {
  constructor() {
    // Create the songs directory if it does not exist
    if (!fs.existsSync(config.folderToSaveSongs)) {
      fs.mkdirSync(config.folderToSaveSongs);
    }
    this.player = new Player();
  }

  saveStreamToFile(audioData, stream) {
    return new Promise((resolve, reject) => {
      const fullPath = path.normalize(`${__dirname}/../..${audioData.pathToFile}`);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(stream);
      writeStream
        .on('finish', () => resolve())
        .on('error', () => reject());
    });
  }

  saveAudioToFileFromUrl(audioData, url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const fullPath = path.normalize(`${__dirname}/../..${audioData.pathToFile}`);
        const writeStream = fs.createWriteStream(fullPath);
        response.pipe(writeStream);

        writeStream.on('error', () => reject(new Error('Error writing to file!')));
        writeStream.on('finish', () => writeStream.close(resolve));
      });
    }).catch(err => logger.error(err));
  }

  playSong(audioData) {
    const pathToFile = path.normalize(`${__dirname}/../..${audioData.pathToFile}`);
    return new Promise((resolve, reject) => this.player.play(pathToFile, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    }));
  }
}
