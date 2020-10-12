const { uniqBy } = require('lodash');
const Voices = require('../models/voices');
const config = require('../config/env');
const awsService = require('./awsService');

let voices = [];

module.exports = {
  initialize: async () => {
    if (config.env === 'production') {
      await awsService.updateVoice();
    }
    voices = await Voices.find().lean();
  },

  getById: (id) => voices.find((el) => el.id === id),

  getLanguagesList: () => uniqBy(voices, 'languageCode').map((el) => ({ name: el.languageName, code: el.languageCode })),

  getVoicesList: (languageCode = null) => {
    if (languageCode) {
      return voices.filter((el) => el.languageCode === languageCode);
    }
    return voices;
  },
};
