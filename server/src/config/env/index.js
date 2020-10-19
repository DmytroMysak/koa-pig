/* eslint-disable import/first */
require('dotenv').config();

const path = require('path');
const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
const config = { development, production };

const defaults = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-west-1',
  },
  bucket: {
    name: 'pig-bot-songs',
    url: 'https://storage.googleapis.com',
  },
  amqpUrl: process.env.AMQP_URL,
  songFormat: 'mp3',
  fbVerifyToken: process.env.FB_VERITY_TOKEN,
  fbAccessToken: process.env.FB_ACCESS_TOKEN,
  telegramVerifyToken: process.env.TELEGRAM_VERITY_TOKEN,
  appUrl: process.env.APP_URL || 'https://appareo.serveo.net',
  ffmpegPath: process.env.FFMPEG_PATH,
  telegramPath: '/bot/telegram/webhook',
  defaultVoiceId: 'Maxim',
  superAdminIds: ['352045593'],
  defaultLocale: 'en',
  localesPath: path.normalize(`${__dirname}/../../../locales`),
};

module.exports = { ...defaults, ...(config[env] || config.development) };
