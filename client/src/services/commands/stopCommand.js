const BaseCommand = require('./baseCommand');

module.exports = class StopCommand extends BaseCommand {
  constructor() {
    super();
    this.name = 'stop-song';
    this.chatId = null;
  }

  async execute(data) {
    super.execute(data);

    this.player.stopSong();
  }
};
