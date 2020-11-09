const BaseCommand = require('./baseCommand');

module.exports = class PlayBucketSongCommand extends BaseCommand {
  constructor(channel) {
    super(channel);
    this.name = ['play-song-bucket', 'play-song-telegram'];
  }

  async execute(message) {
    await this.player.addToQueue(message);
    this.ack();
  }
};
