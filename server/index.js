import fs from 'fs';
import WebSocket from 'ws';
import AWS from 'aws-sdk';
import config from './config/env';
import logger from './helper/logger';
import sequelize from './models';
import Tunnel from './businessLogic/httpsTunnel/tunnel';
import TelegramBot from './businessLogic/bots/telegramBot';
// import VoiceService from './businessLogic/voiceBL';
import ServerService from './businessLogic/serverBL';

// Create the songs directory if it doesn't exist
if (!fs.existsSync(config.folderToSaveSongs)) {
  fs.mkdirSync(config.folderToSaveSongs);
}
// Create the log directory if it does not exist
if (!fs.existsSync(config.folderToSaveLogs)) {
  fs.mkdirSync(config.folderToSaveLogs);
}

const webSocketClientList = {};

const main = async () => {
  const tunnel = new Tunnel(config.telegramPort);
  const appUrl = await tunnel.createTunnel();
  logger.info(`App url: ${appUrl}`);
  logger.info('Tunnel ok');

  await sequelize.authenticate();
  logger.info('DataBase ok');

  AWS.config = new AWS.Config({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region,
  });
  const polly = new AWS.Polly({ signatureVersion: 'v4' });
  // await new VoiceService().updateVoice(polly);
  logger.info('Voices ok');

  const wss = new WebSocket.Server({
    port: config.wsPort,
    verifyClient: (info, cb) => {
      const { token } = info.req.headers;
      if (!token) {
        return cb(false, 401, 'Unauthorized');
      }
      info.req.token = token; // eslint-disable-line no-param-reassign
      return cb(true);
    },
  });
  wss.on('connection', (ws, req) => {
    webSocketClientList[req.token] = ws;
    logger.debug('connected');
  });

  const serverService = new ServerService(webSocketClientList, polly);
  const telegramBot = new TelegramBot(appUrl, config.telegramPort, serverService);
  await telegramBot.start();
  logger.info('Telegram bot ok');
};

main()
  .catch(error => logger.error(error));
