require('dotenv').config();

const path = require('path');
const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
const config = { development, production };

const defaults = {
  songsDirectory: path.normalize(`${__dirname}/../../songs`),
  logsDirectory: path.normalize(`${__dirname}/../../logs`),
  logger: {
    level: 'debug',
  },
  isProduction: false,
  amqp: {
    url: process.env.AMQP_URL,
    responseQueueName: 'response-queue',
    queueName: process.env.SECRET_KEY,
  },

  ffmpegPath: process.env.FFMPEG_PATH,
};

module.exports = { ...defaults, ...(config[env] || config.development) };
