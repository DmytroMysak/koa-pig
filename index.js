import localTunnelPromise from './localTunnelPromise';
import logger from './helper/logger';
import config from './config/env';
import PigService from './businessLogic/pigBL';
import TelegramBot from './businessLogic/bots/TelegramBot';

const pigService = new PigService();

// function to go over all bots and start them
const startBots = (appUrl) => {
  const telegramBot = new TelegramBot(appUrl);

  return Promise.all([
    telegramBot.start(appUrl),
  ]);
};

localTunnelPromise(config.port)
  .then((result) => {
    pigService.updateVoice()
      .then(() => startBots(result.url))
      .catch(logger.error);
  })
  .catch((err) => {
    logger.error(err);
    // тому що вінстон 3.0 гамно їбане блять
    console.log(err); // eslint-disable-line no-console
  });
