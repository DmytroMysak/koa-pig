import config from '../config/env';
import logger from './helper/logger';
import AwsService from './services/awsService';
import Tunnel from './services/httpsTunnel/serveo';
import TelegramBot from './services/bots/telegramBot';

const createAppUrl = async () => {
  const tunnel = new Tunnel(config.port);
  await tunnel.start();
  logger.debug('Tunnel ok');
  const appUrl = tunnel.getUrlAddress();
  logger.debug(`App url: ${appUrl}`);
};

const initializeAws = async () => {
  const awsService = new AwsService();
  await awsService.startAwsPolly();

  if (config.env === 'production') {
    await awsService.updateVoice();
  }
};

const main = async () => {
  await initializeAws();

  let appUrl;
  if (config.createAppUrl) {
    appUrl = await createAppUrl();
  }

  const telegramBot = new TelegramBot(appUrl || config.appUrl, config.telegramPort);
  await telegramBot.start();
  logger.debug('Telegram bot started');
};

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
