const config = require('./config/env');
const logger = require('./helper/logger');
const Tunnel = require('./services/httpsTunnel/ngrok');
const TelegramBot = require('./services/bots/telegramBot');
const voiceService = require('./services/voiceService');
const i18nService = require('./services/i18nService');
const clientService = require('./services/clientService');
const { dbInitialize } = require('./models/index');

const createAppUrl = async () => {
  const tunnel = new Tunnel(config.port);
  await tunnel.start();

  const appUrl = tunnel.getUrlAddress();
  logger.debug(`App url: ${appUrl}`);

  return appUrl;
};

const main = async () => {
  await dbInitialize();
  await Promise.all([
    voiceService.initialize(),
    i18nService.initialize(),
    clientService.initialize(),
  ]);

  const appUrl = config.createAppUrl ? (await createAppUrl()) : config.appUrl;
  const telegramBot = new TelegramBot(appUrl, config.port);

  await telegramBot.start();
  logger.debug('Telegram bot started');
};

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
