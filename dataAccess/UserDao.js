export default class UserDao {
  constructor(models) {
    this.users = models.users;
  }

  addUser(voice) {
    return this.users.create(voice);
  }

  getUserByMac(mac) {
    return this.users.findOne({
      where: { mac },
    });
  }
}
