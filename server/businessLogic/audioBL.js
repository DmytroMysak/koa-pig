import fs from 'fs';
import https from 'https';
import path from 'path';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import Polly from './awsBL';
import config from '../config/env';
import logger from '../helper/logger';
import AudioDataDao from '../dataAccess/AudioDataDao';
import { models } from '../models';

export default class Audio {
  constructor() {
    this.audioDataDao = new AudioDataDao(models);
  }

  isSongExist(hash) {
    const file = this.getFullPathToFile(hash);
    const isExist = promisify(fs.exists);
    return isExist(file);
  }

  createAudioFileFromText({ text, hash, voiceId }) {
    const params = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: voiceId || config.defaultVoiceId,
    };
    return Polly.synthesizeSpeech(params).promise()
      .then(stream => this.saveStreamToFile(stream.AudioStream, hash))
      .then(() => this.audioDataDao.saveAudioData({
        fileName: hash,
        type: 'AWS',
        fileId: text.toString().substring(0, 20),
      }))
      .then(audioData => audioData.get())
      .catch(err => logger.error(err));
  }

  saveStreamToFile(stream, hash) {
    return new Promise((resolve, reject) => {
      const fullPath = this.getFullPathToFile(hash);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(stream);
      writeStream
        .on('finish', () => resolve())
        .on('error', err => reject(err));
    }).catch(err => logger.error(err));
  }

  saveMp4StreamToFile(stream, videoKey) {
    const proc = ffmpeg({ source: stream });
    if (config.ffmpegPath) {
      proc.setFfmpegPath(config.ffmpegPath);
    }
    const fullPath = this.getFullPathToFile(videoKey);
    return new Promise((resolve, reject) => proc.saveToFile(fullPath)
      .on('end', () => resolve())
      .on('error', err => reject(err)))
      .then(() => this.audioDataDao.saveAudioData({
        fileName: videoKey,
        type: 'YOUTUBE',
        fileId: 'youtube link',
      }))
      .then(audioData => audioData.get())
      .catch(err => logger.error(err));
  }

  saveAudioToFileFromUrl(url, fileId, formatToMp3) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const fullPath = this.getFullPathToFile(fileId);
        const writeStream = fs.createWriteStream(fullPath);
        response.pipe(writeStream);
        writeStream
          .on('finish', () => resolve())
          .on('error', err => reject(err));
      });
    })
      .then(() => (formatToMp3 ? this.transformToMp3(fileId) : Promise.resolve()))
      .then(() => this.audioDataDao.saveAudioData({
        fileName: fileId,
        type: 'TELEGRAM',
        fileId: 'telegram file',
      }))
      .then(audioData => audioData.get())
      .catch(err => logger.error(err));
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

  getFullPathToFile(hash) {
    return path.normalize(`${__dirname}/../../${config.folderToSaveSongs}/${hash}.${config.songFormat}`);
  }
}
