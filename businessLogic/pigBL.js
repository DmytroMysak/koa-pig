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
      `${__dirname}/../../${config.folderToSaveSongs}/${moment().format('YYYYMMDDHHmmssSSS')}.${config.songFormat}`,
    );

    return this.audioDataDao.getAudioDataByText({ text: chatData.get('text') })
      .then((audioData) => {
        if (!_.isEmpty(audioData)) {
          return [audioData];
        }

        return Promise.all([
          AudioDataModel.build({ voiceId: chatData.get('voiceId'), pathToFile }).validate(),
          Polly.synthesizeSpeech(params).promise(),
        ]);
      })
      .then(([audioData, audioStream]) => {
        if (_.isEmpty(audioStream)) {
          return [audioData];
        }

        return Promise.all([
          this.audioDataDao.saveAudioData(audioData.get()),
          this.audio.saveStreamToFile(audioData.get(), audioStream),
        ]);
      })
      .then(([audioData]) => Promise.all([
        this.queue.addToQueue(audioData),
        this.chatDataDao.saveChatData({ ...chatData.get(), audioId: audioData.get('id') }),
      ]));
  }

  getLanguagesList(unique) {
    return this.voicesDao.getVoices(unique)
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.languageName, code: voice.languageCode })),
        count: data.count,
      }));
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
      }));
  }
}
