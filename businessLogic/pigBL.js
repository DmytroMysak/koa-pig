import _ from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import Polly from './awsBL';
import Audio from './audioBL';
import { models } from '../models/index';
import VoicesDao from '../dataAccess/VoicesDao';
import ChatDataDao from '../dataAccess/ChatDataDao';
import AudioDataDao from '../dataAccess/AudioDataDao';
import Queue from './queueBL';
import config from '../config/env';
import path from "path";

const { audioData: AudioDataModel } = models;

export default class PigService {
  constructor() {
    this.voicesDao = new VoicesDao(models);
    this.chatDataDao = new ChatDataDao(models);
    this.audioDataDao = new AudioDataDao(models);
    this.queue = new Queue();
    this.audio = new Audio();
  }

  pigSpeakText(chatData) {
    const params = {
      OutputFormat: 'mp3',
      Text: chatData.text,
      VoiceId: chatData.voiceId,
    };
    const pathToFile = `/${config.folderToSaveSongs}/${moment().format('YYYYMMDDHHmmssSSS')}.${config.songFormat}`;

    return this.audioDataDao.getAudioDataByText({ text: chatData.text, voiceId: chatData.voiceId })
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }

        // get audio stream from aws
        return Promise.all([
          AudioDataModel.build({ id: uuidv4(), voiceId: chatData.voiceId, pathToFile }).validate(),
          Polly.synthesizeSpeech(params).promise(),
        ]);
      })
      .then(([audioData, audioStream]) => {
        if (_.isEmpty(audioStream)) {
          return [audioData];
        }

        // save audioStream to file + audio_id to db
        return Promise.all([
          this.audioDataDao.saveAudioData(audioData.get()),
          this.audio.saveStreamToFile(audioData.get(), audioStream.AudioStream),
        ]);
      })
      .then(([audioData]) => Promise.all([
        audioData.get(),
        this.chatDataDao.saveChatData({ ...chatData, audioId: audioData.get('id') }),
        this.queue.addToQueue(audioData.get()),
      ]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  pigSpeakAudio(fileId, getFileUrl) {
    const pathToFile = `/${config.folderToSaveSongs}/${moment().format('YYYYMMDDHHmmssSSS')}.${config.songFormat}`;

    return this.audioDataDao.getAudioDataByFileId(fileId)
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }

        return Promise.all([
          AudioDataModel.build({ type: 'TELEGRAM', fileId, pathToFile }).validate(),
          getFileUrl(),
        ]);
      })
      .then(([audioData, fileUrl]) => {
        if (_.isEmpty(fileUrl)) {
          return [audioData];
        }

        return Promise.all([
          this.audioDataDao.saveAudioData(audioData.get()),
          this.audio.saveAudioToFileFromUrl(audioData, fileUrl),
        ]);
      })
      .then(([audioData]) => Promise.all([audioData.get(), this.queue.addToQueue(audioData.get())]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  pigSpeakFromUrl(url) {
    const pathToFile = `/${config.folderToSaveSongs}/${moment().format('YYYYMMDDHHmmssSSS')}.${config.songFormat}`;
    const fullPath = path.normalize(`${__dirname}/../..${pathToFile}`);
    const fileId = url.match(/(?<=v=).*$/)[0];

    return this.audioDataDao.getAudioDataByFileId(fileId)
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }
        const proc = ffmpeg({ source: ytdl(url) });
        return Promise.all([
          this.audioDataDao.saveAudioData(AudioDataModel.build({ type: 'YOUTUBE', fileId, pathToFile }).get()),
          new Promise((resolve, reject) => proc.saveToFile(fullPath).on('end', resolve).on('error', reject)),
        ]);
      })
      .then(([audioData]) => Promise.all([audioData.get(), this.queue.addToQueue(audioData.get())]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  getLanguagesList(unique) {
    return this.voicesDao.getVoices(unique)
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.languageName, code: voice.languageCode })),
        count: data.count,
      }))
      .catch(err => console.error(err));
  }

  getVoicesList(languageCode = null) {
    const filter = {
      ...languageCode ? { languageCode } : {},
    };
    return this.voicesDao.getVoices(false, filter);
  }

  getSpeakersNameList(id = null) {
    return this.voicesDao.getVoices(false, ...id ? { languageCode: id } : {})
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.name, id: voice.id, gender: voice.gender })),
        count: data.count,
      }))
      .catch(err => console.error(err));
  }
}
