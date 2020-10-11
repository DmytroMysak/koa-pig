export default class ClientDao {
  constructor(models) {
    this.users = models.users;
    this.clients = models.clients;
  }

  getUserClients(userId) {
    return this.users.findOne({
      attributes: [],
      where: { id: userId },
      include: [{
        model: this.clients,
        attributes: ['accessKey', 'name'],
        required: true,
      }],
    });
  }

  getPublicClients() {
    return this.clients.findAll({
      attributes: ['accessKey', 'name'],
      where: { type: 'public' },
      raw: true,
    });
  }
}
