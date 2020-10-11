import _ from 'lodash';
import User from '../models/users';

const upsertUserByTelegramId = async (user) => {
  const dbUser = await User.findOne({ telegramId: user.telegramId });
  if (_.isEmpty(dbUser)) {
    const createdUser = await User.create(user);
    return createdUser.toJSON();
  }
  return Promise.resolve(dbUser.toJSON());
};

const updateUserVoiceId = (userId, voiceId) => User.update({ 'settings.voiceId': voiceId }).where({ _id: userId });

const updateUserVolume = (userId, volume) => User.update({ 'settings.volume': volume }).where({ _id: userId });

module.exports = {
  upsertUserByTelegramId,
  updateUserVoiceId,
  updateUserVolume,
};
