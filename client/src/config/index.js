require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  folderToSaveSongs: 'songs',
  folderToSaveLogs: 'logs',
  songFormat: 'mp3',
  secretKey: 'xxx' || process.env.APP_URL,
  ffmpegPath: process.env.FFMPEG_PATH,
};

export default Object.assign(defaults, config.default);
