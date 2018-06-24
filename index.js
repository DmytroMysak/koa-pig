import app from './config/express';
import config from './config/env';
import logger from './helper/logger';
import { models } from './models';
import Polly from './businessLogic/awsBL';
import VoicesDao from './dataAccess/VoicesDao';
import BotService from './businessLogic/botBL';

const { voices: VoicesModel } = models;

const initialize = () => {
  const voicesDao = new VoicesDao(models);
  const botService = new BotService();
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
    })
    .then(() => botService.addPersistentMenu());
};

app.listen(config.port, () => {
  logger.info(`App listening on port ${config.port}!`);

  return initialize(models)
    .then(logger.info('App ready!!!'))
    .catch((error) => {
      logger.info('Error during app initialization');
      logger.info(error);
      process.exit();
    });
});
