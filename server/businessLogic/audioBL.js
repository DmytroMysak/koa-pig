import fs from 'fs';
import https from 'https';
import path from 'path';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import config from '../config/env';
import logger from '../helper/logger';
import AudioDao from '../dataAccess/audioDao';
import { models } from '../models';
import { createHash } from '../helper/functions';

export default class AudioService {
  constructor(polly) {
    this.polly = polly;
    this.audioDao = new AudioDao(models);
  }

  static getFullPathToFile(fileName) {
    return path.normalize(`${__dirname}/../../${config.folderToSaveSongs}/${fileName}.${config.songFormat}`);
  }

  static isSongExist(fileName) {
    const file = AudioService.getFullPathToFile(fileName);
    const isExist = promisify(fs.exists);
    return isExist(file);
  }

  static createFileNameFromText(text, voiceId) {
    return `${createHash(text)}_${voiceId}`;
  }

  static saveStreamToFile(stream, fileName) {
    return new Promise((resolve, reject) => {
      const fullPath = AudioService.getFullPathToFile(fileName);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(stream);
      writeStream
        .on('finish', () => resolve())
        .on('error', err => reject(err));
    }).catch(err => logger.error(err));
  }

  static transformToMp3(fileName) {
    const proc = ffmpeg(AudioService.getFullPathToFile(fileName));
    if (config.ffmpegPath) {
      proc.setFfmpegPath(config.ffmpegPath);
    }
    return new Promise((resolve, reject) => proc.toFormat('mp3').save(AudioService.getFullPathToFile(fileName))
      .on('end', () => resolve())
      .on('error', err => reject(err)));
  }

  async createAudioFileFromText({ text, fileName, voiceId }) {
    try {
      const stream = await this.polly.synthesizeSpeech({ OutputFormat: 'mp3', Text: text, VoiceId: voiceId }).promise();
      await AudioService.saveStreamToFile(stream.AudioStream, fileName);
      const audio = await this.audioDao.saveAudio({ fileName, type: 'AWS', voiceId });
      return audio.get();
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }

  async saveMp4StreamToFile(stream, fileName) {
    const proc = ffmpeg({ source: stream });
    if (config.ffmpegPath) {
      proc.setFfmpegPath(config.ffmpegPath);
    }
    const fullPath = AudioService.getFullPathToFile(fileName);
    try {
      await new Promise((resolve, reject) => proc.saveToFile(fullPath)
        .on('end', () => resolve())
        .on('error', err => reject(err)));
      const audio = await this.audioDao.saveAudio({ fileName, type: 'YOUTUBE' });
      return audio.get();
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }

  async saveAudioToFileFromUrl(url, fileName, formatToMp3) {
    try {
      await new Promise((resolve, reject) => {
        https.get(url, (response) => {
          const fullPath = AudioService.getFullPathToFile(fileName);
          const writeStream = fs.createWriteStream(fullPath);
          response.pipe(writeStream);
          writeStream
            .on('finish', () => resolve())
            .on('error', err => reject(err));
        });
      });
      if (formatToMp3) {
        await AudioService.transformToMp3(fileName);
      }
      const audio = this.audioDao.saveAudio({ fileName, type: 'TELEGRAM' });
      return audio.get();
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }
}
