import ChatDataDao from '../dataAccess/ChatDataDao';
import { models } from '../models';
import { createHash } from '../helper/functions';

export default class ChatService {
  constructor() {
    this.chatDataDao = new ChatDataDao(models);
  }

  saveMessage(text, userId) {
    const messageHash = createHash(text);
    return this.chatDataDao.saveChatData({ text, textHash: messageHash, userId });
  }

  linkSongToMessage(messageId, songId) {
    return this.chatDataDao.updateChatData(messageId, { audioId: songId }, ['audioId']);
  }

  linkSongToMessageByHash(messageId, hash) {
    return this.chatDataDao.addAudioIdByHash(messageId, hash);
  }
}
