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

const ws = new WebSocket(`ws://${config.appUrl}:${config.port}`, {
  headers: { token: config.secretKey },
});

// ws.on('open', () => ws.send(JSON.stringify({ type: 'register' })));

ws.on('message', async (data) => {
  const { fileName, file: song, type, volume } = JSON.parse(data);
  logger.debug(data);

  switch (type) {
    case 'is_song_exist':
      if (await AudioService.isFileExist(fileName)) {
        return queue.addToQueue({ fileName, volume });
      }
      return ws.send(JSON.stringify({ type: 'get_file', fileName }));
    case 'song':
      await AudioService.saveBufferToFile(Buffer.from(song.data), fileName);
      return queue.addToQueue({ fileName, volume });
    default:
      logger.error('Unexpected data from server');
      logger.error(data);
      ws.send(JSON.stringify({ type: 'client_error' }));
  }
});
logger.info('Client started');
