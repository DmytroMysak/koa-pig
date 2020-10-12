const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
  },
  languageCode: {
    type: String,
  },
  languageName: {
    type: String,
  },
  name: {
    type: String,
  },
}, {
  _id: false,
});

const Voice = mongoose.model('voices', voiceSchema);
module.exports = Voice;
