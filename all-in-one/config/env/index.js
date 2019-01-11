require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  pg: {
    name: process.env.DB_NAME || 'little_pig',
    username: process.env.DB_USER || 'littlePig',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-west-1',
  },
  folderToSaveSongs: 'songs',
  folderToSaveLogs: 'logs',
  songFormat: 'mp3',
  fbVerifyToken: process.env.FB_VERITY_TOKEN,
  fbAccessToken: process.env.FB_ACCESS_TOKEN,
  telegramVerifyToken: process.env.TELEGRAM_VERITY_TOKEN,
  appUrl: process.env.APP_URL || 'https://appareo.serveo.net',
  ffmpegPath: process.env.FFMPEG_PATH,
  telegramPath: '/bot/telegram/webhook',
  defaultVoiceId: 'Maxim',
};

export default Object.assign(defaults, config.default);
