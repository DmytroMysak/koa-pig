import fs from 'fs';
import WebSocket from 'ws';
import Tunnel from './businessLogic/httpsTunnel/Tunnel';
import config from './config/env';
import logger from './helper/logger';
import sequelize from './models';
import TelegramBot from './businessLogic/bots/TelegramBot';

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
  const tunnel = new Tunnel(config.port);
  const appUrl = await tunnel.createTunnel();
  await sequelize.authenticate();

  const telegramBot = new TelegramBot(appUrl, webSocketClientList);
  await telegramBot.start();

  const wss = new WebSocket.Server({
    port: config.port,
    verifyClient: (info, cb) => {
      const { token } = info.req.headers;
      if (!token) {
        return cb(false, 401, 'Unauthorized');
      }
      info.req.token = token; // eslint-disable-line no-param-reassign
      return cb(true);
    },
  });
  wss.on('connection', ws => webSocketClientList[ws.upgradeReq.token] = ws);
};

main()
  .catch(error => logger.error(error));
