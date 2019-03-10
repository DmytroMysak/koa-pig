import fs from 'fs';
import { promisify } from 'util';
import AudioService from './audioBL';

export default class ClientService {
  constructor(webSocketClientList) {
    this.webSocketClientList = webSocketClientList;
  }

  processResponseFromClient(clientId) {
    this.webSocketClientList[clientId].on('message', (data) => {
      if (data.type === 'get_file') {
        const fullPath = AudioService.getFullPathToFile(data.fileName);
        const getFile = promisify(fs.readFile);
        getFile(fullPath)
          .then(file => this.sendToClient({ type: 'song', file, ...data }, clientId));
      }
    });
  }

  /**
   * @return {Promise}
   * @param {{fileName: string, volume: number, song: Buffer|null, type: string|null}} data
   * @param {string} clientId
   */
  sendToClient(data, clientId) {
    if (!data.type) {
      data.type = 'is_song_exist'; // eslint-disable-line no-param-reassign
      this.processResponseFromClient(clientId);
    }
    if (this.webSocketClientList[clientId]) {
      this.webSocketClientList[clientId].send(JSON.stringify(data));
    }

    return Promise.reject(new Error(`Problem with client ${clientId}`));
  }
}
