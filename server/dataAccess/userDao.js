export default class UserDao {
  constructor(models) {
    this.users = models.users;
    this.voices = models.voices;
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
      where: { telegramId },
    });
  }

  updateUserVoiceId(userId, voiceId) {
    return this.users.update(
      { selectedVoiceId: voiceId },
      {
        fields: ['selectedVoiceId'],
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
      fields: [],
      where: { id: userId },
      include: [{ model: this.voices, required: false }],
    });
  }
}