const ytdl = require('ytdl-core');
const BaseCommand = require('./baseCommand');
const logger = require('../../helper/logger');

module.exports = class PlayYouTubeCommand extends BaseCommand {
  constructor(channel) {
    super(channel);
    this.name = 'play-song-youtube';
  }

  async execute(message) {
    let info;
    try {
      info = await ytdl.getInfo(message.link);
    } catch (error) {
      return this.sendResponse({ message: error.message });
    }

    // audio only, sorted by quality (highest bitrate)
    const [audio] = ytdl.filterFormats(info.formats || [], 'audioonly')
      .sort((a, b) => b.audioBitrate - a.audioBitrate);
    if (audio) {
      logger.debug(`Audio quality: ${audio.audioBitrate}kbps (${audio.mimeType})`);
    }

    // low resolution video only, webm prefered (lowest resolution)
    // const [video] = ytdl.filterFormats(info.formats || [], 'highestaudio')
    //   .sort((a) => (a.container === 'webm' ? -1 : 1));
    // if (video) {
    //   logger.debug(`Video format: ${video.resolution} [${video.size}] (${video.encoding}) ${video.fps}`);
    // }

    await this.player.addToQueue({ ...message, link: audio.url });
    return this.ack();
  }
};
