import logger from './helper/logger';
import { models } from './models';
import Polly from './businessLogic/awsBL';
import VoicesDao from './dataAccess/VoicesDao';
import TelegramBot from './businessLogic/bots/TelegramBot';

const { voices: VoicesModel } = models;

const updateVoice = () => {
  return Promise.resolve();

  // const voicesDao = new VoicesDao(models);
  //
  // return Polly.describeVoices()
  //   .promise()
  //   .then((data) => {
  //     logger.info('voices initialized');
  //     logger.info(data);
  //
  //     return Promise.all(data.Voices
  //       .map(voice => VoicesModel.build({
  //         id: voice.Id,
  //         gender: voice.Gender,
  //         languageCode: voice.LanguageCode,
  //         languageName: voice.LanguageName,
  //         name: voice.Name,
  //       }))
  //       .map(voice => voice.validate()),
  //     )
  //       .then(voices => Promise.all(voices.map(voice => voicesDao.upsertVoice(voice.get()))));
  //   });
};

const startBots = () => {
  const telegramBot = new TelegramBot();

  return Promise.all([
    telegramBot.start(),
  ]);
};

updateVoice()
  .then(() => startBots())
  .catch(logger.error);
