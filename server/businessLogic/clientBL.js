import fs from 'fs';
import { promisify } from 'util';
import logger from '../helper/logger';
import ValidationError from '../helper/validationError';
import AudioService from './audioBL';

export default class ClientService {
  static processResponseFromClient(client) {
    client.on('message', (input) => {
      logger.debug(input);
      const data = JSON.parse(input);
      if (data.type === 'get_file') {
        const fullPath = AudioService.getFullPathToFile(data.fileName);
        const getFile = promisify(fs.readFile);
        getFile(fullPath)
          .then((file) => {
            const params = {
              type: 'song', file, fileName: data.fileName, volume: data.volume,
            };
            return ClientService.sendToClient(params, client);
          });
      }
    });
  }

  /**
   * @return {Promise}
   * @param {{fileName: string, volume: number, song: Buffer|null, type: string|null, file: Buffer}} data
   * @param {object} client
   */
  static sendToClient(data, client) {
    if (!data.type) {
      data.type = 'is_song_exist'; // eslint-disable-line no-param-reassign
    }
    client.send(JSON.stringify(data));
    return Promise.resolve();
  }

  /**
   * @return {Promise}
   * @param {{fileName: string, volume: number, song: Buffer|null, type: string|null, file: Buffer}} data
   * @param {Array<{name: string, accessKey: string}>}clients
   * @param webSocketClientList
   */
  static async sendToClients(data, clients, webSocketClientList) {
    if (!clients || !clients.length) {
      return Promise.reject(new ValidationError('user_do_not_have_clients'));
    }
    return Promise.all(clients.map((client) => {
      const wsc = webSocketClientList[client.accessKey];
      if (!wsc) {
        return Promise.reject(new ValidationError([
          { text: 'client', translate: true },
          { text: client.name, translate: false },
          { text: 'inactive, please try again later', translate: true },
        ]));
      }
      return ClientService.sendToClient(data, wsc);
    }));
  }
}
