import app from './config/express';
import config from './config/env';
import logger from './helper/logger';
import { models } from './models';
import Polly from './businessLogic/awsBL';
import VoicesDao from './dataAccess/VoicesDao';

const { voices: VoicesModel } = models;

const initialize = () => {
  const voicesDao = new VoicesDao(models);
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
        .then(voices => Promise.all(voices.map(voice => voicesDao.upsertVoice(voice.get()))));
    });
};

app.listen(config.port, () => {
  logger.info(`App listening on port ${config.port}!`);

  return initialize(models)
    .then(logger.info('App ready!!!'))
    .catch((error) => {
      logger.info('Error when saving voices to db');
      logger.info(error);
      process.exit();
    });
});
