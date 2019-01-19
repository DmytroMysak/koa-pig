import fs from 'fs';
import WebSocket from 'ws';
import config from './config/env';
import logger from './helper/logger';
import PigService from './businessLogic/pigBL';

const pigService = new PigService();

// Create the songs directory if it doesn't exist
if (!fs.existsSync(config.folderToSaveSongs)) {
  fs.mkdirSync(config.folderToSaveSongs);
}
// Create the log directory if it does not exist
if (!fs.existsSync(config.folderToSaveLogs)) {
  fs.mkdirSync(config.folderToSaveLogs);
}

const ws = new WebSocket(config.appUrl);

ws.on('open', () => ws.send({ type: 'start', payload: { secretKey: config.secretKey } }));

ws.on('message', (data) => {
  logger.debug(data);

  switch (data.type) {
    case 'hash':
      pigService.pigSpeakIfExist(data)
        .then(result => result ? null : ws.send(JSON.stringify({ event: 'get_file', hash: data.hash })));
      break;
    case 'song':
      pigService.saveAndSpeak(data)
        .then(result => ws.send(JSON.stringify({ event: 'status', hash: data.hash, status: result })));
      break;
    default:
      logger.error('Unexpected data from server');
      logger.error(data);
      ws.send(JSON.stringify({ event: 'client_error', hash: data.hash }));
  }
});
