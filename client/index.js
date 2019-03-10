import fs from 'fs';
import WebSocket from 'ws';
import config from './config/env';
import logger from './helper/logger';
import AudioService from './businessLogic/audioBL';
import Queue from './businessLogic/queueBL';

const queue = new Queue();

// Create the songs directory if it doesn't exist
if (!fs.existsSync(config.folderToSaveSongs)) {
  fs.mkdirSync(config.folderToSaveSongs);
}
// Create the log directory if it does not exist
if (!fs.existsSync(config.folderToSaveLogs)) {
  fs.mkdirSync(config.folderToSaveLogs);
}

const ws = new WebSocket(config.appUrl, {
  headers: { token: config.secretKey },
});

ws.on('open', () => ws.send(JSON.stringify({ type: 'register' })));

ws.on('message', async (data) => {
  const doneResponse = fileId => ws.send(JSON.stringify({ type: 'done', fileId }));
  const { fileName, file: song, type, volume } = JSON.parse(data);
  logger.debug(fileName);
  // todo volume

  switch (type) {
    case 'is_song_exist':
      if (await AudioService.isFileExist(fileName)) {
        queue.addToQueue(fileName, doneResponse);
      }
      ws.send(JSON.stringify({ type: 'get_file', fileId: fileName }));
      break;
    case 'song':
      await AudioService.saveStreamToFile(song, fileName);
      queue.addToQueue(fileName, doneResponse);
      break;
    default:
      logger.error('Unexpected data from server');
      logger.error(data);
      ws.send(JSON.stringify({ event: 'client_error', hash: data.hash }));
  }
});
