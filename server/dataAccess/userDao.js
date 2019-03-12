export default class UserDao {
  constructor(models) {
    this.users = models.users;
    this.voices = models.voices;
    this.clients = models.clients;
  }

  addUser(user) {
    return this.users.create(user);
  }

  getUserByFacebookId(facebookId) {
    return this.users.findOne({
      where: { facebookId },
      include: [{ model: this.voices, required: false }],
    });
  }

  getUserByTelegramId(telegramId) {
    return this.users.findOne({
      attributes: ['volume', 'id', 'voiceId', 'locale'],
      where: { telegramId },
    });
  }

  updateUserVoiceId(userId, voiceId) {
    return this.users.update(
      { voiceId },
      {
        fields: ['voiceId'],
        where: { id: userId },
        returning: true,
      },
    );
  }

  updateUserVolume(userId, volume) {
    return this.users.update(
      { volume },
      {
        fields: ['volume'],
        where: { id: userId },
        returning: true,
      },
    );
  }

  getUserVoice(userId) {
    return this.users.findOne({
      attributes: [],
      where: { id: userId },
      include: [{ model: this.voices, required: false }],
    });
  }
}
