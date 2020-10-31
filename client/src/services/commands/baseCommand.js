const PlayerService = require('../playerService');

module.exports = class BaseCommand {
  constructor() {
    this.player = new PlayerService();
    this.name = null;
    this.chatId = null;
  }

  execute(data) {
    this.chatId = data.chatId;
  }
};
