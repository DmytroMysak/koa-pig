import _ from 'lodash';
import Polly from './awsBL';
import * as pigDao from '../dataAccess/pigDAO';
import * as queueBL from './queueBL';

export const pigSpeak = (text, voiceId) => {
  const params = {
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: voiceId,
  };

  return Promise.all([
    Polly.synthesizeSpeech(params).promise(),
    pigDao.saveText('mac', text),
  ])
    .then(([data]) => queueBL.addToQueue(data));
};

export const getLanguagesList = (unique) => {
  // todo get from db, if empty get from aws and save to db
  return Polly.describeVoices()
    .promise()
    .then((voiceList) => {
      const voices = voiceList.Voices.map(voice => ({ name: voice.LanguageName, code: voice.LanguageCode }));

      return (!unique && voices) || _.uniqBy(voices, voice => `${voice.name}${voice.code}`);
    });
};

export const getVoicesList = (languageCode = null) => {
  // todo get from db, if empty get from aws and save to db
  return Polly.describeVoices(...languageCode ? { LanguageCode: languageCode } : {})
    .promise()
    .then(data => data.Voices);
};

export const getSpeakersNameList = (id = null) => {
  // todo get from db, if empty get from aws and save to db
  return Polly.describeVoices(...id ? { LanguageCode: id } : {})
    .promise()
    .then(voiceList => voiceList.Voices.map(voice => ({ name: voice.Name, id: voice.Id, gender: voice.Gender })));
};
