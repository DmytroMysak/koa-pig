const { uniqBy } = require('lodash');
const Voices = require('../models/voices');
const config = require('../config');
const awsService = require('./awsService');

let voices = [];

module.exports = {
  initialize: async () => {
    if (config.initializeVoice) {
      await awsService.updateVoice();
    }
    voices = await Voices.find().lean();
    voices = voices.map((el) => {
      const code = el.languageCode.split('-');

      return ({ ...el, code: ['US', 'GB'].includes(code[1]) ? 'en' : code[0] });
    });
  },

  getById: (id) => voices.find((el) => el.id === id),

  getLanguagesList: () => uniqBy(voices, 'code').map((el) => ({
    name: el.languageName.split(' ')[1] ?? el.languageName,
    languageCode: el.languageCode,
    code: el.code,
  })),

  getVoicesList: (code = null) => {
    if (code) {
      return voices.filter((el) => el.code === code);
    }
    return voices;
  },
};
