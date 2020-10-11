import AWS from 'aws-sdk';
import config from '../../config/env';
import logger from '../helper/logger';
import Voice from '../models/voices';

export default class AwsService {
  constructor() {
    this.polly = null;
  }

  async startAwsPolly() {
    AWS.config = new AWS.Config({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });
    this.polly = new AWS.Polly({ signatureVersion: 'v4' });
    logger.debug('AWS Polly ok');
  }

  async updateVoice() {
    if (!this.polly) {
      throw Error('No polly initialized');
    }
    const data = await this.polly.describeVoices().promise();

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
  }
}
