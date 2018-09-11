import _ from 'lodash';
import ytdl from 'ytdl-core';
import Polly from './awsBL';
import AudioService from './audioBL';
import { models } from '../models/index';
import VoicesDao from '../dataAccess/VoicesDao';
import ChatDataDao from '../dataAccess/ChatDataDao';
import AudioDataDao from '../dataAccess/AudioDataDao';
import Queue from './queueBL';
import config from '../config/env';
import logger from '../helper/logger';

const { voices: VoicesModel } = models;

export default class PigService {
  constructor() {
    this.voicesDao = new VoicesDao(models);
    this.chatDataDao = new ChatDataDao(models);
    this.audioDataDao = new AudioDataDao(models);
    this.queue = new Queue();
    this.audioService = new AudioService();
  }

  pigSpeakText(chatData, user) {
    return this.audioDataDao.getAudioDataByText({ text: chatData.text, voiceId: chatData.voiceId })
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }
        return Promise.all([null, this.audioService.saveAudioToFileFromText(chatData.text, chatData.voiceId)]);
      })
      .then(([audioData, fileName]) => {
        if (_.isEmpty(fileName)) {
          return audioData;
        }
        return this.audioDataDao.saveAudioData({ type: 'AWS', voiceId: chatData.voiceId, fileName });
      })
      .then(audioData => Promise.all([
        audioData.get(),
        this.chatDataDao.saveChatData({ ...chatData, audioId: audioData.get('id') }),
      ]))
      .then(([audioData]) => Promise.all([
        audioData,
        this.queue.addToQueue({ ...audioData, volume: user.volume }),
      ]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  updateVoice() {
    return Polly.describeVoices()
      .promise()
      .then((data) => {
        logger.info('voices initialized');
        logger.info(data);
        return Promise.all(data.Voices
          .map(voice => VoicesModel.build({
            id: voice.Id,
            gender: voice.Gender,
            languageCode: voice.LanguageCode,
            languageName: voice.LanguageName,
            name: voice.Name,
          }))
          .map(voice => voice.validate()),
        )
          .then(voices => Promise.all(voices.map(voice => this.voicesDao.upsertVoice(voice.get()))));
      });
  }

  pigSpeakAudio(fileId, getFileUrl, user) {
    return this.audioDataDao.getAudioDataByFileId(fileId)
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }
        return Promise.all([null, getFileUrl()]);
      })
      .then(([audioData, fileUrl]) => {
        if (_.isEmpty(fileUrl)) {
          return [audioData];
        }
        const songFormat = fileUrl.match(/\.[0-9a-z]+$/i)[0];
        const formatToMp3 = songFormat !== config.songFormat;
        return Promise.all([null, formatToMp3, this.audioService.saveAudioToFileFromUrl(fileUrl)]);
      })
      .then(([audioData, formatToMp3, fileName]) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }
        return Promise.all([
          this.audioDataDao.saveAudioData({ type: 'TELEGRAM', fileId, fileName }),
          formatToMp3 ? this.audioService.transformToMp3(fileName) : null,
        ]);
      })
      .then(([audioData]) => Promise.all([
        audioData.get(),
        this.queue.addToQueue({ ...audioData.get(), volume: user.volume }),
      ]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  pigSpeakFromUrl(url, user) {
    const fileId = url.match(/(?<=v=).*$/)[0];
    return this.audioDataDao.getAudioDataByFileId(fileId)
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }
        return Promise.all([null, this.audioService.saveMp4StreamToFile(ytdl(url))]);
      })
      .then(([audioData, fileName]) => {
        if (_.isEmpty(fileName)) {
          return audioData;
        }
        return this.audioDataDao.saveAudioData({ type: 'YOUTUBE', fileId, fileName });
      })
      .then(audioData => Promise.all([
        audioData.get(),
        this.queue.addToQueue({ ...audioData.get(), volume: user.volume }),
      ]))
      .then(([audioData]) => audioData)
      .catch(err => console.error(err));
  }

  getLanguagesList(unique) {
    return this.voicesDao.getVoices(unique)
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.languageName, code: voice.languageCode })),
        count: data.count.length,
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
