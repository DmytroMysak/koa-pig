const BaseCommand = require('./baseCommand');

module.exports = class PlayBucketSongCommand extends BaseCommand {
  constructor() {
    super();
    this.name = 'play-song-telegram';
    this.chatId = null;
  }

  async execute(data) {
    super.execute(data);

    const { volume, link } = data;
    await this.player.addToQueue({ volume, link });
  }
};
