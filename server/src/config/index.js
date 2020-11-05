require('dotenv').config();

const _ = require('lodash');
const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
if (!['development', 'production'].includes(env)) {
  throw new Error('Unexpected env');
}
const config = { development, production };

const defaults = {
  initializeVoice: false,
  port: process.env.PORT || 5000,
  logger: {
    prettyPrint: { translateTime: 'SYS:standard' },
    level: 'debug',
  },
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
  mongoose: {
    options: {
      socketTimeoutMS: 0,
      keepAlive: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
  },
  songFormat: 'mp3',
  telegramVerifyToken: process.env.TELEGRAM_VERITY_TOKEN,
  telegramPath: '/bot/telegram/webhook',
  appUrl: process.env.APP_URL,
  defaultVoiceId: 'Maxim',

  fbVerifyToken: process.env.FB_VERITY_TOKEN,
  fbAccessToken: process.env.FB_ACCESS_TOKEN,
};

module.exports = _.merge(defaults, config[env]);
