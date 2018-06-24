export default class UserDao {
  constructor(models) {
    this.users = models.users;
  }

  addUser(voice) {
    return this.users.create(voice);
  }

  getUserByFacebookId(facebookId) {
    return this.users.findOne({
      where: { facebookId },
    });
  }
}
