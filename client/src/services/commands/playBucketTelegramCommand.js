const BaseCommand = require('./baseCommand');

module.exports = class PlayBucketSongCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['play-song-bucket', 'play-song-telegram'];
  }

  async execute(data) {
    super.execute(data);

    await this.player.addToQueue(data);
  }
};
