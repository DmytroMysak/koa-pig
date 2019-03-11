import ytdl from 'ytdl-core';
import config from '../config/env/index';
import ClientService from './clientBL';
import AudioService from './audioBL';
import MessageService from './messageBL';

export default class serverService {
  /**
   * @constructor
   * @param {Array<object>} webSocketClientList
   * @param polly
   */
  constructor(webSocketClientList, polly) {
    this.audioService = new AudioService(polly);
    this.messageService = new MessageService();
    this.webSocketClientList = webSocketClientList;
  }

  /**
   * Save audio data in db and send info to clients
   * @param {string} fileId
   * @param {function} getFileUrl
   * @param {number} volume
   * @param {Array<string>} clients
   * @return {Promise}
   */
  async processAudio({ fileId, getFileUrl }, volume, clients) {
    const songExist = await AudioService.isSongExist(fileId);

    if (!songExist) {
      const fileUrl = await getFileUrl();
      const songFormat = fileUrl.match(/\.[0-9a-z]+$/i)[0];
      const formatToMp3 = songFormat !== config.songFormat;
      await this.audioService.saveAudioToFileFromUrl(fileUrl, fileId, formatToMp3);
    }

    return ClientService.sendToClients({ fileName: fileId, volume }, clients, this.webSocketClientList);
  }

  /**
   * Save text and send info to client
   * @param {string} text
   * @param {string} voiceId
   * @param {string} userId
   * @param {number} volume
   * @param {Array<string>} clients
   * @return {Promise}
   */
  async processText({ text, voiceId, userId }, volume, clients) {
    const message = await this.messageService.saveMessage({ text, voiceId, userId });
    const fileName = AudioService.createFileNameFromText(text, voiceId);
    const songExist = await AudioService.isSongExist(fileName);

    if (!songExist) {
      const audio = await this.audioService.createAudioFileFromText({ text, voiceId, fileName });
      await this.messageService.linkSongToMessage(message.id, audio.id);
    } else {
      await this.messageService.linkSongToMessageByFileName(message.id, fileName);
    }

    return ClientService.sendToClients({ fileName, volume }, clients, this.webSocketClientList);
  }

  /**
   * Save text and send info to client
   * @param {string} url
   * @param {string} userId
   * @param {number} volume
   * @param {Array<string>} clients
   * @return {Promise}
   */
  async processUrl({ url, userId }, volume, clients) {
    const fileName = url.match(/(?<=v=).*$/)[0];
    const message = await this.messageService.saveMessage({ text: url, userId });
    const songExist = await AudioService.isSongExist(fileName);

    if (!songExist) {
      const audio = await this.audioService.saveMp4StreamToFile(ytdl(url), fileName);
      await this.messageService.linkSongToMessage(message.id, audio.id);
    } else {
      await this.messageService.linkSongToMessageByFileName(message.id, fileName);
    }

    return ClientService.sendToClients({ fileName, volume }, clients, this.webSocketClientList);
  }
}
