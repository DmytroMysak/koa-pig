import _ from 'lodash';
import moment from 'moment';
import path from 'path';
import Polly from './awsBL';
import Audio from './audioBL';
import { models } from '../models/index';
import VoicesDao from '../dataAccess/VoicesDao';
import ChatDataDao from '../dataAccess/ChatDataDao';
import AudioDataDao from '../dataAccess/AudioDataDao';
import Queue from './queueBL';
import config from '../config/env';

const { audioData: AudioDataModel } = models;

export default class PigService {
  constructor() {
    this.voicesDao = new VoicesDao(models);
    this.chatDataDao = new ChatDataDao(models);
    this.audioDataDao = new AudioDataDao(models);
    this.queue = new Queue();
    this.audio = new Audio();
  }

  pigSpeak(chatData) {
    const params = {
      OutputFormat: 'mp3',
      Text: chatData.get('text'),
      VoiceId: chatData.get('voiceId'),
    };
    const pathToFile = path.normalize(
      `${__dirname}/../../${config.folderToSaveSongs}/${moment().format('YYYYMMDDHHmmssSSS')}`,
    );

    return Promise.all([
      this.audioDataDao.getAudioDataByText({ text: chatData.get('text') }),
      AudioDataModel.build({ voiceId: chatData.get('voiceId'), pathToFile }).validate(),
      this.chatDataDao.saveChatData(chatData),
    ])
      .then(([audioData, newAudioData]) => Promise.all(!_.isEmpty(audioData) ? [audioData] : [
        this.audioDataDao.saveAudioData(newAudioData),
        Polly.synthesizeSpeech(params).promise(),
        this.chatDataDao.updateChatData(chatData.id, { audioId: newAudioData.id }, ['audioId']),
      ]))
      .then(([audioData, audioStream]) => Promise.all([
        audioData,
        _.isEmpty(audioStream) ? {} : this.audio.saveStreamToFile(audioData, audioStream),
      ]))
      .then(([audioData]) => this.queue.addToQueue(audioData));
  }

  getLanguagesList(unique) {
    return this.voicesDao.getVoices(unique)
      .then(voices => voices.map(voice => ({ name: voice.languageName, code: voice.languageCode })));
  }

  getVoicesList(languageCode = null) {
    return this.voicesDao.getVoices(false, ...languageCode ? { languageCode } : {});
  }

  getSpeakersNameList(id = null) {
    return this.voicesDao.getVoices(false, ...id ? { languageCode: id } : {})
      .then(voices => voices.map(voice => ({ name: voice.name, id: voice.id, gender: voice.gender })));
  }
}
