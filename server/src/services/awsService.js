const AWS = require('aws-sdk');
const config = require('../config');
const logger = require('../helper/logger');
const Voice = require('../models/voices');

AWS.config = new AWS.Config({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const polly = new AWS.Polly({ signatureVersion: 'v4' });

module.exports = {
  updateVoice: async () => {
    if (!polly) {
      throw Error('No polly initialized');
    }
    const data = await polly.describeVoices().promise();

    const voices = data.Voices.map((voice) => ({
      id: voice.Id,
      gender: voice.Gender,
      languageCode: voice.LanguageCode,
      languageName: voice.LanguageName,
      name: voice.Name,
    }));

    try {
      await Voice.insertMany(voices);
    } catch (error) {
      logger.info('Voices already added to DB', error);
    }
    logger.debug('Voice initialized');
  },

  createAudioFileFromText: async (text, voiceId) => (
    polly.synthesizeSpeech({ OutputFormat: 'mp3', Text: text, VoiceId: voiceId }).promise()
  ),
};
