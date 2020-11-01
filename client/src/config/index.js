require('dotenv').config();

const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
const config = { development, production };

const defaults = {
  logger: {
    level: 'debug',
    logsDirectory: '',
  },
  isProduction: false,
  amqp: {
    url: process.env.AMQP_URL,
    responseQueueName: 'response-queue',
    queueName: process.env.SECRET_KEY,
  },
};

module.exports = { ...defaults, ...(config[env] || config.development) };
