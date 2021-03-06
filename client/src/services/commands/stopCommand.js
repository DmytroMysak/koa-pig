const BaseCommand = require('./baseCommand');

module.exports = class StopCommand extends BaseCommand {
  constructor(channel) {
    super(channel);
    this.name = 'stop-all-songs';
  }

  // eslint-disable-next-line no-unused-vars
  async execute(message) {
    this.player.clearQueue();
    this.player.stopSong();
    this.ack();
  }
};
