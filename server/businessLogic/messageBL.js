import MessageDao from '../dataAccess/messageDao';
import { models } from '../models';

export default class ChatService {
  constructor() {
    this.messageDao = new MessageDao(models);
  }

  saveMessage({ text, voiceId, userId }) {
    return this.messageDao.saveMessage({ text, voiceId, userId });
  }

  linkSongToMessage(messageId, songId) {
    return this.messageDao.updateMessage(messageId, { audioId: songId }, ['audioId']);
  }

  linkSongToMessageByFileName(messageId, fileName) {
    return this.messageDao.addAudioIdByFileName(messageId, fileName);
  }
}
