import Player from 'play-sound';
import fs from 'fs';
import https from 'https';
import path from 'path';
import moment from 'moment';
import ffmpeg from 'fluent-ffmpeg';
import Polly from './awsBL';
import config from '../config/env';

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

  saveMp4StreamToFile(stream, nameOfFile = null) {
    const proc = ffmpeg({ source: stream });
    if (config.ffmpegPath) {
      proc.setFfmpegPath(config.ffmpegPath);
    }
    const fileName = this.createFileName(nameOfFile);
    const fullPath = this.getFullPathToFile(fileName);
    return new Promise((resolve, reject) => proc.saveToFile(fullPath)
      .on('end', () => resolve(fileName))
      .on('error', err => reject(err)));
  }

  saveStreamToFile(stream, nameOfFile = null) {
    return new Promise((resolve, reject) => {
      const fileName = this.createFileName(nameOfFile);
      const fullPath = this.getFullPathToFile(fileName);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(stream);
      writeStream
        .on('finish', () => resolve(fileName))
        .on('error', err => reject(err));
    }).catch(err => console.error(err));
  }

  saveAudioToFileFromUrl(url, nameOfFile = null) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const fileName = this.createFileName(nameOfFile);
        const fullPath = this.getFullPathToFile(fileName);
        const writeStream = fs.createWriteStream(fullPath);
        response.pipe(writeStream);
        writeStream
          .on('finish', () => resolve(fileName))
          .on('error', err => reject(err));
      });
    }).catch(err => console.error(err));
  }

  saveAudioToFileFromText(text, voiceId) {
    const params = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: voiceId || config.defaultVoiceId,
    };
    return Polly.synthesizeSpeech(params).promise()
      .then(stream => this.saveStreamToFile(stream.AudioStream));
  }

  transformToMp3(fileName) {
    const proc = ffmpeg(this.getFullPathToFile(fileName));
    if (config.ffmpegPath) {
      proc.setFfmpegPath(config.ffmpegPath);
    }
    return new Promise((resolve, reject) => proc.toFormat('mp3').save(this.getFullPathToFile(fileName))
      .on('end', () => resolve())
      .on('error', err => reject(err)));
  }

  playSong(audioData) {
    const fullPath = this.getFullPathToFile(audioData.fileName);
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
    this.currentPlayer.kill();
    return Promise.resolve();
  }

  createFileName(fileName = null) {
    return `${fileName || moment().format('YYYYMMDDHHmmssSSS')}.${config.songFormat}`;
  }

  getFullPathToFile(fileName) {
    return path.normalize(`${__dirname}/../../${config.folderToSaveSongs}/${fileName}`);
  }
}
