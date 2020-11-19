const BaseCommand = require('./baseCommand');

module.exports = class StopCommand extends BaseCommand {
  constructor(channel) {
    super(channel);
    this.name = 'stop-song';
  }

  // eslint-disable-next-line no-unused-vars
  async execute(message) {
    this.player.stopSong();
    this.ack();
  }
};
