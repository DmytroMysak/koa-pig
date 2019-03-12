import _ from 'lodash';
import UserDao from '../dataAccess/userDao';
import ClientDao from '../dataAccess/clientDao';
import RoleDao from '../dataAccess/roleDao';
import { models } from '../models/index';
import config from '../config/env';

export default class UserService {
  constructor() {
    this.userDao = new UserDao(models);
    this.roleDao = new RoleDao(models);
    this.clientDao = new ClientDao(models);
  }

  async upsertUserByTelegramId(user) {
    const dbUser = await this.userDao.getUserByTelegramId(user.telegramId);
    if (_.isEmpty(dbUser)) {
      const createdUser = await this.userDao.addUser(user);
      await this.setUserRoleByTelegramId(createdUser);
      return createdUser.get();
    }
    return Promise.resolve(dbUser.get());
  }

  getUserVoice(userId) {
    return this.userDao.getUserVoice(userId)
      .then(user => user.voice.get());
  }

  getUserClients(userId) {
    return Promise.all([this.clientDao.getUserClients(userId), this.clientDao.getPublicClients()])
      .then(([user, publicClients]) => [
        ...publicClients,
        ...user && user.clients ? user.clients.map(elem => elem.get()) : [],
      ]);
  }

  updateUserVoiceId(userId, voiceId) {
    return this.userDao.updateUserVoiceId(userId, voiceId);
  }

  updateUserVolume(userId, volume) {
    return this.userDao.updateUserVolume(userId, volume);
  }

  async setUserRoleByTelegramId(user) {
    const roleName = config.superAdminIds.includes(user.get('telegramId')) ? 'admin' : 'user';
    if (!await this.roleDao.isRolesExist()) {
      await this.roleDao.createInitRoles();
    }
    const roleId = await this.roleDao.getRoleIdByName(roleName);
    return user.setRoles([roleId]);
  }
}
