import Player from 'play-sound';
import fs from 'fs';
import https from 'https';
import path from 'path';

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
    }).catch(err => console.error(err));
  }

  playSong(audioData) {
    const pathToFile = path.normalize(`${__dirname}/../..${audioData.pathToFile}`);
    return new Promise((resolve, reject) => {
      this.currentPlayer = this.player.play(pathToFile, { mplayer: [`volume=${audioData.volume || -1}`] }, (err) => {
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
    this.currentPlayer.kill();
    return Promise.resolve();
  }
}
