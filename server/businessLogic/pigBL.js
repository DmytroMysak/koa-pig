import ytdl from 'ytdl-core';
import AudioService from './audioBL';
import ChatService from './chatBL';
import config from '../config/env';

export default class PigService {
  constructor(webSocketClientList) {
    this.chatService = new ChatService();
    this.audioService = new AudioService();
    this.webSocketClientList = webSocketClientList;
  }

  processResponseFromClient(clientId) {
    this.webSocketClientList[clientId].on('message', (data) => {
      if (data.type === 'songExist' && data.status === false) {
        this.sendSongToClient(data.hash, data.upgradeReq.token);
      }
    });
  }

  sendToClient(data, clientId) {
    this.webSocketClientList[clientId].send(data);
    this.processResponseFromClient(clientId);
  }

  sendSongToClient(hash, clientId) {

  }

  /**
   * Work with text from message
   * @param {{text: string, voiceId: string, userId: string, volume: number}} ctx
   * @return {Promise}
   */
  async pigSpeakText({ text, voiceId, userId, volume, clientId }) {
    const message = await this.chatService.saveMessage(text, userId);
    const songExist = await this.audioService.isSongExist(message.textHash);

    if (!songExist) {
      const songData = await this.audioService.createAudioFileFromText({
        text, voiceId, hash: message.textHash, chatId: message.id,
      });
      await this.chatService.linkSongToMessage(message.id, songData.id);
    } else {
      await this.chatService.linkSongToMessageByHash(message.id, message.textHash);
    }

    if (this.webSocketClientList[clientId]) {
      this.sendToClient({ type: 'songExist', hash: message.textHash, volume }, clientId);
      return this.audioService.getFullPathToFile(message.textHash);
    }

    return Promise.reject(new Error(`Problem with client ${clientId}`));
  }

  async pigSpeakFromUrl({ url, userId, volume, clientId }) {
    const fileId = url.match(/(?<=v=).*$/)[0];
    const message = await this.chatService.saveMessage(url, userId);
    const songExist = await this.audioService.isSongExist(fileId);

    if (!songExist) {
      const songData = await this.audioService.saveMp4StreamToFile(ytdl(url), fileId, message.id);
      await this.chatService.linkSongToMessage(message.id, songData.id);
    } else {
      await this.chatService.linkSongToMessageByHash(message.id, message.textHash);
    }

    if (this.webSocketClientList[clientId]) {
      this.sendToClient({ type: 'songExist', hash: fileId, volume }, clientId);
      return this.audioService.getFullPathToFile(fileId);
    }

    return Promise.reject(new Error(`Problem with client ${clientId}`));
  }

  async pigSpeakAudio({ fileId, getFileUrl, volume, clientId }) {
    const songExist = await this.audioService.isSongExist(fileId);

    if (!songExist) {
      const fileUrl = await getFileUrl();
      const songFormat = fileUrl.match(/\.[0-9a-z]+$/i)[0];
      const formatToMp3 = songFormat !== config.songFormat;
      this.audioService.saveAudioToFileFromUrl(fileUrl, fileId, formatToMp3);
    }

    if (this.webSocketClientList[clientId]) {
      this.sendToClient({ type: 'songExist', hash: fileId, volume }, clientId);
      return this.audioService.getFullPathToFile(fileId);
    }

    return Promise.reject(new Error(`Problem with client ${clientId}`));
  }
}
