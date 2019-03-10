import _ from 'lodash';
import UserDao from '../dataAccess/userDao';
import { models } from '../models/index';

export default class UserService {
  constructor() {
    this.userDao = new UserDao(models);
  }

  async upsertUserByTelegramId(user) {
    const dbUser = await this.userDao.getUserByTelegramId(user.telegramId);
    if (_.isEmpty(dbUser)) {
      const createdUser = this.userDao.addUser(user);
      return createdUser.get();
    }
    return Promise.resolve(dbUser.get());
  }

  getUserVoice(userId) {
    return this.userDao.getUserVoice(userId)
      .then(user => user.voice.get());
  }

  updateUserVoiceId(userId, voiceId) {
    return this.userDao.updateUserVoiceId(userId, voiceId);
  }

  updateUserVolume(userId, volume) {
    return this.userDao.updateUserVolume(userId, volume);
  }
}
