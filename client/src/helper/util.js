const Ffmpeg = require('fluent-ffmpeg');
const logger = require('./logger');

const getFfmpeg = (url, volume) => new Ffmpeg()
  .addInput(url)
  .audioFilters(`volume=${volume / 100}`)
  .noVideo()
  .format('s16le')
  .audioCodec('pcm_s16le')
  .on('start', (commandLine) => logger.debug(`Spawned FFmpeg with command: ${commandLine}`))
  .on('end', () => logger.debug('FFmpeg instance ended'))
  .on('error', (err) => logger.error(`FFmpeg error: ${err.message}`));

module.exports = {
  getFfmpeg,
};
