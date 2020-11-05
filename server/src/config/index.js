require('dotenv').config();

const path = require('path');
const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
const config = { development, production };

const defaults = {
  initializeVoice: false,
  createAppUrl: true,
  port: process.env.PORT || 5000,
  logger: {
    prettyPrint: { translateTime: 'SYS:standard' },
    level: 'debug',
  },
  logsDirectory: '',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
  google: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  },
  bucket: {
    name: 'pig-bot-songs',
    url: 'https://storage.googleapis.com',
  },
  amqp: {
    url: process.env.AMQP_URL,
    responseQueueName: 'response-queue',
  },
  songFormat: 'mp3',
  telegramVerifyToken: process.env.TELEGRAM_VERITY_TOKEN,
  telegramPath: '/bot/telegram/webhook',
  appUrl: process.env.APP_URL,

  defaultVoiceId: 'Maxim',
  defaultLocale: 'en',

  localesPath: path.normalize(`${__dirname}/../../locales`),
  fbVerifyToken: process.env.FB_VERITY_TOKEN,
  fbAccessToken: process.env.FB_ACCESS_TOKEN,
};

module.exports = { ...defaults, ...(config[env] || config.development) };
